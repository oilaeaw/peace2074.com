/**
 * useQuranSync — Cross-device reading position sync via @waelio/sync
 *
 * @waelio/sync is a Cloudflare Worker REST API (KV-backed).
 * This composable is the client: push/pull reading position, bookmarks,
 * and Tasbeeh count across devices using the sync endpoint.
 *
 * Endpoint: https://waelio-sync.pages.dev/api/items
 * (or proxy via the Nitro API at /api/sync/* if you want auth-gating)
 */

import { ref, computed } from 'vue'
import { useStorageRef } from './useUStore'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuranReadingPosition {
  suraId: number
  verseId: number
  readerMode: 'mushaf' | 'reader' | 'audio'
  updatedAt: string
}

export interface QuranSyncPayload {
  position?: QuranReadingPosition
  bookmarks?: number[]      // sura IDs
  tasbeehCount?: number
  deviceId?: string
}

// ── Config ────────────────────────────────────────────────────────────────────

const SYNC_ENDPOINT = 'https://waelio-sync.pages.dev/api/items'
const DEVICE_ID_KEY = 'peace2074-device-id'
const SYNC_ITEM_KEY = 'peace2074-quran-sync'

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

// ── Singleton state ───────────────────────────────────────────────────────────

const isSyncing = ref(false)
const lastSyncedAt = ref<string | null>(null)
const syncError = ref<string | null>(null)
let _remoteItemId: string | null = null

// ── Composable ────────────────────────────────────────────────────────────────

export function useQuranSync() {
  // Local last-position, persisted via @waelio/ustore
  const { value: lastPosition, set: setLastPosition } = useStorageRef<QuranReadingPosition | null>(
    'quran-last-position',
    null,
    'local'
  )

  const { value: bookmarks, set: setBookmarks } = useStorageRef<number[]>(
    'quran-bookmarks',
    [],
    'local'
  )

  /**
   * Push current reading state to the sync endpoint.
   * Fire-and-forget — never blocks navigation.
   */
  async function pushSync(position?: QuranReadingPosition, tasbeehCount?: number): Promise<boolean> {
    if (isSyncing.value) return false
    if (typeof window === 'undefined') return false

    const deviceId = getOrCreateDeviceId()
    const payload: QuranSyncPayload = {
      position: position ?? lastPosition.value ?? undefined,
      bookmarks: bookmarks.value,
      tasbeehCount,
      deviceId,
    }

    isSyncing.value = true
    syncError.value = null

    try {
      let url = SYNC_ENDPOINT
      let method = 'POST'

      if (_remoteItemId) {
        // Update existing
        url = `${SYNC_ENDPOINT}/${_remoteItemId}`
        method = 'PUT'
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: SYNC_ITEM_KEY,
          content: JSON.stringify(payload),
        }),
      })

      if (!res.ok) throw new Error(`Sync push failed: ${res.status}`)

      const data = await res.json() as { id?: string }
      if (data?.id) _remoteItemId = data.id

      lastSyncedAt.value = new Date().toISOString()
      return true
    } catch (err) {
      syncError.value = err instanceof Error ? err.message : 'Sync failed'
      console.warn('[QuranSync] Push error:', err)
      return false
    } finally {
      isSyncing.value = false
    }
  }

  /**
   * Pull latest reading state from the sync endpoint.
   * Call on app start or when switching devices.
   */
  async function pullSync(): Promise<QuranSyncPayload | null> {
    if (typeof window === 'undefined') return null

    isSyncing.value = true
    syncError.value = null

    try {
      const res = await fetch(SYNC_ENDPOINT)
      if (!res.ok) throw new Error(`Sync pull failed: ${res.status}`)

      const items = await res.json() as Array<{ id: string; title: string; content: string }>
      const match = items.find((i) => i.title === SYNC_ITEM_KEY)

      if (!match) return null

      _remoteItemId = match.id
      const payload = JSON.parse(match.content) as QuranSyncPayload

      // Restore state
      if (payload.position) {
        setLastPosition(payload.position)
      }
      if (payload.bookmarks) {
        setBookmarks(payload.bookmarks)
      }

      lastSyncedAt.value = new Date().toISOString()
      return payload
    } catch (err) {
      syncError.value = err instanceof Error ? err.message : 'Sync failed'
      console.warn('[QuranSync] Pull error:', err)
      return null
    } finally {
      isSyncing.value = false
    }
  }

  /**
   * Save reading position locally and push to sync.
   */
  function updatePosition(suraId: number, verseId: number, readerMode: QuranReadingPosition['readerMode'] = 'reader') {
    const position: QuranReadingPosition = {
      suraId,
      verseId,
      readerMode,
      updatedAt: new Date().toISOString(),
    }
    setLastPosition(position)
    // Push in background — non-blocking
    void pushSync(position)
    return position
  }

  /**
   * Toggle a sura bookmark.
   */
  function toggleBookmark(suraId: number): boolean {
    const current = bookmarks.value ?? []
    const isBookmarked = current.includes(suraId)
    const next = isBookmarked
      ? current.filter((id) => id !== suraId)
      : [...current, suraId]

    setBookmarks(next)
    void pushSync()
    return !isBookmarked
  }

  return {
    // State
    isSyncing: computed(() => isSyncing.value),
    syncError: computed(() => syncError.value),
    lastSyncedAt: computed(() => lastSyncedAt.value),
    lastPosition,
    bookmarks,

    // Methods
    pushSync,
    pullSync,
    updatePosition,
    toggleBookmark,
  }
}

export default useQuranSync

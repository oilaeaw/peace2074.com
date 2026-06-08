/**
 * Offline Quran Recitation Manager
 * Handles downloading and caching audio files for offline playback.
 *
 * Audio blobs  → Cache API  (binary, can't go in localStorage)
 * Download state → @waelio/realdb (reactive, queryable, persistent)
 */

import { ref, computed, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { RealDB, LocalStorageAdapter } from '@waelio/realdb'

export interface RecitationDownloadProgress {
  suraId: number
  current: number
  total: number
  status: 'pending' | 'downloading' | 'complete' | 'error'
  bytesDownloaded?: number
  totalBytes?: number
}

export type RecitationQuality = 'regular' | 'hiq'

export interface OfflineRecitationStatus {
  fullQuranAvailable: boolean
  currentSuraAvailable: boolean
  preferredQuality: RecitationQuality | null
  fullQuranQuality: RecitationQuality | null
  currentSuraQuality: RecitationQuality | null
}

// ── RealDB schema ─────────────────────────────────────────────────────────────
interface CachedSuraRecord {
  suraId: number
  quality: RecitationQuality
  verseCount: number
  cachedAt: string
}

// Singleton DB instance (shared across composable calls)
let _db: RealDB | null = null
let _dbReady: Promise<RealDB> | null = null

function getDB(): Promise<RealDB> {
  if (_db?.isOpen) return Promise.resolve(_db)
  if (_dbReady) return _dbReady

  _dbReady = (async () => {
    _db = new RealDB({
      name: 'peace2074-audio',
      adapter: new LocalStorageAdapter('peace2074-audio'),
    })
    await _db.open()
    return _db
  })()

  return _dbReady
}

// ── Constants ─────────────────────────────────────────────────────────────────
export const TOTAL_QURAN_SURAS = 114
const RECITATION_QUALITIES: RecitationQuality[] = ['regular', 'hiq']
const OFFLINE_RECITATION_QUALITY_STORAGE_KEY = 'quran-offline-recitation-quality'
const CACHE_NAME_PREFIX = 'quran-audio-offline'

interface RecitationQualityInfo {
  bitrate: string
  estimatedSizePerSura: string
  estimatedSizeFullQuran: string
  description: string
}

const QUALITY_INFO: Record<RecitationQuality, RecitationQualityInfo> = {
  regular: {
    bitrate: '32kbps',
    estimatedSizePerSura: '~1.5MB',
    estimatedSizeFullQuran: '~180MB',
    description: 'Good quality, smaller file size',
  },
  hiq: {
    bitrate: '128kbps',
    estimatedSizePerSura: '~6MB',
    estimatedSizeFullQuran: '~720MB',
    description: 'High quality, larger file size',
  },
}

const getCacheName = (quality: RecitationQuality) => `${CACHE_NAME_PREFIX}-${quality}-v1`

function readStoredSelectedQuality(): RecitationQuality {
  if (typeof window === 'undefined') return 'regular'
  const stored = window.localStorage.getItem(OFFLINE_RECITATION_QUALITY_STORAGE_KEY)
  return stored === 'hiq' ? 'hiq' : 'regular'
}

function getPreferredQualityOrder(preferredQuality: RecitationQuality) {
  return [preferredQuality, ...RECITATION_QUALITIES.filter((q) => q !== preferredQuality)]
}

function extractSuraIdsFromRequests(requests: readonly Request[]): Set<number> {
  const suraIds = new Set<number>()
  requests.forEach((req) => {
    const match = req.url.match(/\/(\d{3})\d{3}\.mp3/)
    if (match) suraIds.add(parseInt(match[1], 10))
  })
  return suraIds
}

export function resolveOfflineRecitationStatus({
  suraId,
  preferredQuality,
  cachedSurasByQuality,
  totalSuras = TOTAL_QURAN_SURAS,
}: {
  suraId?: number
  preferredQuality: RecitationQuality
  cachedSurasByQuality: Record<RecitationQuality, Iterable<number>>
  totalSuras?: number
}): OfflineRecitationStatus {
  const normalizedSurasByQuality = RECITATION_QUALITIES.reduce(
    (acc, quality) => {
      acc[quality] = new Set(cachedSurasByQuality[quality] || [])
      return acc
    },
    {} as Record<RecitationQuality, Set<number>>
  )

  const preferredOrder = getPreferredQualityOrder(preferredQuality)

  const fullQuranQualities = preferredOrder.filter(
    (quality) => normalizedSurasByQuality[quality].size >= totalSuras
  )

  const currentSuraQualities =
    typeof suraId === 'number' && suraId > 0
      ? preferredOrder.filter((quality) => normalizedSurasByQuality[quality].has(suraId))
      : []

  const fullQuranQuality = fullQuranQualities[0] || null
  const currentSuraQuality = currentSuraQualities[0] || null

  return {
    fullQuranAvailable: fullQuranQuality !== null,
    currentSuraAvailable: currentSuraQuality !== null,
    preferredQuality: fullQuranQuality || currentSuraQuality,
    fullQuranQuality,
    currentSuraQuality,
  }
}

export function useOfflineRecitation() {
  const $q = useQuasar()

  const selectedQuality = ref<RecitationQuality>(readStoredSelectedQuality())
  const downloadProgress = ref<Map<number, RecitationDownloadProgress>>(new Map())
  const isDownloading = ref(false)
  const downloadedSuras = ref<Set<number>>(new Set())

  // ── RealDB subscription cleanup ──────────────────────────────────────────
  const subscriptions: Array<{ unsubscribe: () => void }> = []
  onUnmounted(() => subscriptions.forEach((s) => s.unsubscribe()))

  function setSelectedQualityPreference(quality: RecitationQuality) {
    selectedQuality.value = quality
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(OFFLINE_RECITATION_QUALITY_STORAGE_KEY, quality)
    }
  }

  // ── RealDB helpers ────────────────────────────────────────────────────────

  async function getSuraCollection() {
    const db = await getDB()
    return db.collection<CachedSuraRecord>('cached-suras')
  }

  /**
   * Mark a sura as fully cached in RealDB (metadata only — blobs are in Cache API).
   */
  async function markSuraCached(suraId: number, quality: RecitationQuality, verseCount: number) {
    const col = await getSuraCollection()
    // Use suraId+quality as logical key — upsert by finding existing
    const existing = await col.findOne([
      { field: 'suraId', op: 'eq', value: suraId },
      { field: 'quality', op: 'eq', value: quality },
    ])

    if (existing) {
      await col.update(existing.id, { cachedAt: new Date().toISOString(), verseCount })
    } else {
      await col.insert({ suraId, quality, verseCount, cachedAt: new Date().toISOString() })
    }

    // Keep reactive ref in sync
    if (quality === selectedQuality.value) {
      downloadedSuras.value = new Set([...downloadedSuras.value, suraId])
    }
  }

  /**
   * Remove a sura's metadata from RealDB.
   */
  async function unmarkSuraCached(suraId: number, quality: RecitationQuality) {
    const col = await getSuraCollection()
    const records = await col.find([
      { field: 'suraId', op: 'eq', value: suraId },
      { field: 'quality', op: 'eq', value: quality },
    ])
    await Promise.all(records.map((r) => col.delete(r.id)))

    if (quality === selectedQuality.value) {
      const next = new Set(downloadedSuras.value)
      next.delete(suraId)
      downloadedSuras.value = next
    }
  }

  /**
   * Load all cached sura IDs for a quality from RealDB (fast — no Cache API scan).
   */
  async function getCachedSurasFromDB(quality: RecitationQuality): Promise<Set<number>> {
    try {
      const col = await getSuraCollection()
      const records = await col.find([{ field: 'quality', op: 'eq', value: quality }])
      return new Set(records.map((r) => r.suraId))
    } catch {
      return new Set()
    }
  }

  // ── Cache API helpers (audio blobs) ──────────────────────────────────────

  async function getCachedSurasForQuality(quality: RecitationQuality): Promise<Set<number>> {
    // Primary source: RealDB (fast, reactive)
    const fromDB = await getCachedSurasFromDB(quality)
    if (fromDB.size > 0) return fromDB

    // Fallback: scan Cache API (for data cached before this upgrade)
    if (!('caches' in window)) return new Set()
    try {
      const cache = await caches.open(getCacheName(quality))
      const keys = await cache.keys()
      return extractSuraIdsFromRequests(keys)
    } catch {
      return new Set()
    }
  }

  async function isSuraCached(suraId: number, quality: RecitationQuality): Promise<boolean> {
    const cached = await getCachedSurasForQuality(quality)
    return cached.has(suraId)
  }

  async function getCachedAudioUrl(
    suraId: number,
    verseNumber: number,
    quality: RecitationQuality
  ): Promise<string | null> {
    if (!('caches' in window)) return null
    try {
      const cache = await caches.open(getCacheName(quality))
      const cacheKey = buildCacheKey(suraId, verseNumber, quality)
      const response = await cache.match(cacheKey)
      if (response) {
        const blob = await response.blob()
        return URL.createObjectURL(blob)
      }
    } catch (err) {
      console.error('[Offline Audio] Cache read error:', err)
    }
    return null
  }

  function buildCacheKey(suraId: number, verseNumber: number, quality: RecitationQuality): string {
    const reciter = quality === 'hiq' ? 'Alafasy_128kbps' : 'Alafasy_64kbps'
    const paddedSura = String(suraId).padStart(3, '0')
    const paddedVerse = String(verseNumber).padStart(3, '0')
    return `https://everyayah.com/data/${reciter}/${paddedSura}${paddedVerse}.mp3`
  }

  // ── Download ──────────────────────────────────────────────────────────────

  async function downloadSura(suraId: number, totalVerses: number): Promise<boolean> {
    if (!('caches' in window)) {
      $q.notify({ type: 'negative', message: 'Offline storage not supported in this browser', position: 'top' })
      return false
    }

    try {
      const cache = await caches.open(getCacheName(selectedQuality.value))
      const quality = selectedQuality.value

      downloadProgress.value.set(suraId, {
        suraId,
        current: 0,
        total: totalVerses,
        status: 'downloading',
        bytesDownloaded: 0,
        totalBytes: 0,
      })

      let successCount = 0
      let failCount = 0
      const BATCH_SIZE = 5

      for (let i = 1; i <= totalVerses; i += BATCH_SIZE) {
        const endVerse = Math.min(i + BATCH_SIZE - 1, totalVerses)
        const batch = []

        for (let verse = i; verse <= endVerse; verse++) {
          const url = buildCacheKey(suraId, verse, quality)
          batch.push(
            fetch(url)
              .then(async (response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`)
                await cache.put(url, response.clone())
                successCount++
                const progress = downloadProgress.value.get(suraId)
                if (progress) {
                  progress.current = successCount
                  downloadProgress.value.set(suraId, { ...progress })
                }
                return true
              })
              .catch((err) => {
                console.error(`[Offline Audio] Failed to download verse ${verse}:`, err)
                failCount++
                return false
              })
          )
        }

        await Promise.all(batch)
        if (endVerse < totalVerses) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      const finalProgress = downloadProgress.value.get(suraId)
      if (finalProgress) {
        finalProgress.status = failCount === 0 ? 'complete' : 'error'
        downloadProgress.value.set(suraId, { ...finalProgress })
      }

      if (failCount === 0) {
        // ✅ Record success in @waelio/realdb
        await markSuraCached(suraId, quality, totalVerses)
        return true
      } else {
        console.warn(`[Offline Audio] Sura ${suraId}: ${successCount} OK, ${failCount} failed`)
        return false
      }
    } catch (err) {
      console.error('[Offline Audio] Download error:', err)
      const progress = downloadProgress.value.get(suraId)
      if (progress) {
        progress.status = 'error'
        downloadProgress.value.set(suraId, { ...progress })
      }
      return false
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function deleteSura(suraId: number, quality: RecitationQuality): Promise<boolean> {
    if (!('caches' in window)) return false

    try {
      const cache = await caches.open(getCacheName(quality))
      const keys = await cache.keys()
      const paddedSura = String(suraId).padStart(3, '0')
      let deletedCount = 0

      for (const request of keys) {
        const match = request.url.match(/\/(\d{3})\d{3}\.mp3/)
        if (match && match[1] === paddedSura) {
          await cache.delete(request)
          deletedCount++
        }
      }

      // Remove from @waelio/realdb
      await unmarkSuraCached(suraId, quality)
      downloadProgress.value.delete(suraId)

      return deletedCount > 0
    } catch (err) {
      console.error('[Offline Audio] Delete error:', err)
      return false
    }
  }

  async function clearAllCache(): Promise<boolean> {
    if (!('caches' in window)) return false

    try {
      await Promise.all([
        caches.delete(getCacheName('regular')),
        caches.delete(getCacheName('hiq')),
      ])

      // Clear RealDB records
      const col = await getSuraCollection()
      const all = await col.findAll()
      await Promise.all(all.map((r) => col.delete(r.id)))

      downloadedSuras.value = new Set()
      downloadProgress.value.clear()
      return true
    } catch (err) {
      console.error('[Offline Audio] Clear cache error:', err)
      return false
    }
  }

  async function getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0

    try {
      let totalSize = 0
      for (const quality of ['regular', 'hiq'] as RecitationQuality[]) {
        const cache = await caches.open(getCacheName(quality))
        const keys = await cache.keys()
        for (const request of keys) {
          const response = await cache.match(request)
          if (response) {
            const blob = await response.blob()
            totalSize += blob.size
          }
        }
      }
      return totalSize
    } catch {
      return 0
    }
  }

  async function loadCachedSurasList(): Promise<void> {
    await loadCachedSurasListForQuality(selectedQuality.value)
  }

  async function loadCachedSurasListForQuality(quality: RecitationQuality): Promise<Set<number>> {
    try {
      const suraIds = await getCachedSurasForQuality(quality)
      if (quality === selectedQuality.value) {
        downloadedSuras.value = suraIds
      }
      return suraIds
    } catch (err) {
      console.error('[Offline Audio] Load cached suras error:', err)
      return new Set()
    }
  }

  async function getOfflineRecitationStatus(
    suraId?: number,
    preferredQuality: RecitationQuality = selectedQuality.value
  ): Promise<OfflineRecitationStatus> {
    const [regularSuras, hiqSuras] = await Promise.all([
      getCachedSurasForQuality('regular'),
      getCachedSurasForQuality('hiq'),
    ])

    return resolveOfflineRecitationStatus({
      suraId,
      preferredQuality,
      cachedSurasByQuality: { regular: regularSuras, hiq: hiqSuras },
    })
  }

  // ── Computed ──────────────────────────────────────────────────────────────

  const qualityInfo = computed(() => QUALITY_INFO[selectedQuality.value])
  const totalDownloadedSuras = computed(() => downloadedSuras.value.size)
  const isAnySuraDownloading = computed(() =>
    Array.from(downloadProgress.value.values()).some((p) => p.status === 'downloading')
  )

  return {
    // State
    selectedQuality,
    downloadProgress,
    isDownloading,
    downloadedSuras,

    // Methods
    setSelectedQualityPreference,
    isSuraCached,
    getCachedAudioUrl,
    downloadSura,
    deleteSura,
    clearAllCache,
    getCacheSize,
    loadCachedSurasList,
    loadCachedSurasListForQuality,
    getOfflineRecitationStatus,

    // Computed
    qualityInfo,
    totalDownloadedSuras,
    isAnySuraDownloading,
    QUALITY_INFO,
  }
}

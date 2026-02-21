import { defineStore } from 'pinia'
import core from '@shared/utils/core'
import { useAuthStore } from './auth.pinia'
import { createBookmark as createBookmarkService, deleteBookmark as deleteBookmarkService, getBookmarks, updateBookmark as updateBookmarkService } from './services/index'

const GUEST_ID_KEY = 'guest_id_v1'
const GUEST_BOOKMARKS_KEY_PREFIX = 'guest_bookmarks_v1_'

function genGuestId() {
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function')
    return (crypto as any).randomUUID()
  return `guest_${Date.now()}_${Math.floor(Math.random() * 100000)}`
}

export const useBookmarksStore = defineStore('bookBook', {
  state: () => ({
    bookmarks: [] as any[], // Changed from string[] to any[] to handle both formats
  }),
  getters: {
    myBookmarks: state => state.bookmarks,
    // Helper getter to get bookmark strings for display
    bookmarkStrings: state => state.bookmarks.map((bm: any) =>
      typeof bm === 'string' ? bm : (bm?.bookmark || ''),
    ),
  },
  actions: {
    _normalizeBookmarkStrings(list: any[]): string[] {
      return (list || [])
        .map((bm: any) => (typeof bm === 'string' ? bm : bm?.bookmark))
        .filter((bm: any): bm is string => typeof bm === 'string' && !!bm)
    },

    async _loadGuestBookmarks() {
      const guestId = await this._getOrCreateGuestId()
      const key = `${GUEST_BOOKMARKS_KEY_PREFIX}${guestId}`
      try {
        const raw = await core.get(key)
        return raw ? (Array.isArray(raw) ? raw : JSON.parse(String(raw))) : []
      }
      catch {
        return []
      }
    },

    async _syncGuestBookmarksToServer() {
      const guestBookmarks = await this._loadGuestBookmarks()
      const guestStrings = this._normalizeBookmarkStrings(guestBookmarks)
      if (!guestStrings.length)
        return

      const serverStrings = new Set(this._normalizeBookmarkStrings(this.bookmarks))
      const missing = guestStrings.filter(bm => !serverStrings.has(bm))
      if (!missing.length)
        return

      let syncedAny = false
      for (const bm of missing) {
        try {
          const response = await createBookmarkService({ bookmark: bm })
          const created = response?.bookmark || response
          const saved = created && (created.value !== undefined) ? created.value : created
          if (saved)
            syncedAny = true
        }
        catch {
          // Keep guest data intact if sync fails
        }
      }

      if (syncedAny) {
        try {
          await this._saveGuestBookmarks([])
        }
        catch { }
        try {
          await this.fetchBookmarks()
        }
        catch { }
      }
    },

    // Initialize bookmarks: if user logged in, load from server. Otherwise load guest local bookmarks.
    async init() {
      const auth = useAuthStore()
      const userId = auth.user?.id || auth.user?._id || auth.user?.value?.id || auth.user?.value?._id
      if (userId) {
        const res = await getBookmarks()
        // normalize possible ref or array of bookmark documents to proper format
        const raw = (res && (res.value !== undefined)) ? res.value : res
        // API returns { bookmarks: [] } format
        const bookmarksList = raw?.bookmarks || raw
        if (Array.isArray(bookmarksList)) {
          this.bookmarks = bookmarksList // Keep full bookmark objects for authenticated users
          await this._syncGuestBookmarksToServer()
        }
        else {
          // Server session may be missing while client auth exists; fallback to guest/local bookmarks
          this.bookmarks = await this._loadGuestBookmarks()
        }
      }
      else {
        this.bookmarks = await this._loadGuestBookmarks()
      }
    },

    async fetchBookmarks() {
      const auth = useAuthStore()
      const userId = auth.user?.id || auth.user?._id || auth.user?.value?.id || auth.user?.value?._id
      if (userId) {
        const res = await getBookmarks()
        const raw = (res && (res.value !== undefined)) ? res.value : res
        // API returns { bookmarks: [] } format
        const bookmarksList = raw?.bookmarks || raw
        if (Array.isArray(bookmarksList)) {
          this.bookmarks = bookmarksList // Keep full bookmark objects for authenticated users
          await this._syncGuestBookmarksToServer()
        }
        else {
          // Keep existing local state if API is unreachable/unauthorized
          if (!this.bookmarks.length)
            this.bookmarks = await this._loadGuestBookmarks()
        }
      }
      else {
        this.bookmarks = await this._loadGuestBookmarks()
      }
    },

    async _getOrCreateGuestId() {
      try {
        let id = await core.get(GUEST_ID_KEY)
        if (!id) {
          id = genGuestId()
          try { await core.set(GUEST_ID_KEY, id) } catch { }
        }
        return String(id || '')
      }
      catch { }
      // If core is unavailable we fallback to generating a guest id but do not attempt
      // to write to localStorage (avoid SSR/local env issues).
      return genGuestId()
    },

    async _saveGuestBookmarks(bookmarks: string[]) {
      const guestId = await this._getOrCreateGuestId()
      if (!guestId)
        return
      const key = `${GUEST_BOOKMARKS_KEY_PREFIX}${guestId}`
      try {
        await core.set(key, bookmarks)
        return
      }
      catch { }
    },

    async createBookmark(bm: string) {
      if (!bm)
        return { ok: false, source: 'none' as const }
      // Check if bookmark already exists
      const existingBookmark = this.bookmarks.find((bookmark: any) =>
        typeof bookmark === 'string' ? bookmark === bm : bookmark?.bookmark === bm,
      )
      if (existingBookmark)
        return { ok: true, source: 'existing' as const }

      const auth = useAuthStore()
      const userId = auth.user?.id || auth.user?._id || auth.user?.value?.id || auth.user?.value?._id
      if (userId) {
        try {
          const response = await createBookmarkService({ bookmark: bm })
          // API returns { ok: true, bookmark: {...} } format
          const created = response?.bookmark || response
          // created may be a ref or raw object; normalize
          const saved = created && (created.value !== undefined) ? created.value : created
          if (!saved) {
            // If server write fails (e.g. missing cookie session), keep local fallback
            this.bookmarks.push(bm)
            this._saveGuestBookmarks(this.bookmarks.map((b: any) => typeof b === 'string' ? b : b?.bookmark).filter(Boolean))
            return { ok: true, source: 'local-fallback' as const }
          }
          // push the saved bookmark object (includes _id for future operations)
          this.bookmarks.push(saved)
          console.log('[Bookmark] Saved to server:', saved)
          // refresh to ensure server-side ids are in sync
          try { await this.fetchBookmarks() }
          catch { }
          return { ok: true, source: 'server' as const }
        }
        catch (err) {
          console.error('[Bookmark] Server save failed:', err)
          // fallback to local push if server fails
          this.bookmarks.push(bm)
          this._saveGuestBookmarks(this.bookmarks.map((b: any) => typeof b === 'string' ? b : b?.bookmark).filter(Boolean))
          return { ok: true, source: 'local-fallback' as const }
        }
      }
      else {
        // Guest: store locally under guest id
        this.bookmarks.push(bm)
        this._saveGuestBookmarks(this.bookmarks.map((b: any) => typeof b === 'string' ? b : b?.bookmark).filter(Boolean))
        return { ok: true, source: 'guest' as const }
      }
    },

    async updateBookmark(id: string, newBm: string) {
      const auth = useAuthStore()
      const userId = auth.user?.id || auth.user?._id || auth.user?.value?.id || auth.user?.value?._id
      if (userId) {
        const updated = await updateBookmarkService(id, newBm)
        const val = (updated && (updated as any).value !== undefined) ? (updated as any).value : updated
        const idx = this.bookmarks.findIndex(b => (typeof b === 'string' ? b === id : (b?._id === id || b?.bookmark === id)))
        if (idx !== -1)
          this.bookmarks[idx] = (val as any)?.bookmark || newBm
      }
      else {
        const idx = this.bookmarks.findIndex(b => b === id)
        if (idx !== -1)
          this.bookmarks[idx] = newBm
        this._saveGuestBookmarks(this.bookmarks)
      }
    },

    async deleteBookmark(id: string) {
      const auth = useAuthStore()
      const userId = auth.user?.id || auth.user?._id || auth.user?.value?.id || auth.user?.value?._id
      if (userId) {
        try {
          // Find the bookmark to delete - could be by MongoDB _id or bookmark string
          const bookmarkToDelete = this.bookmarks.find((bm: any) =>
            typeof bm === 'string' ? bm === id : (bm?._id === id || bm?.bookmark === id),
          )

          if (!bookmarkToDelete) {
            try { const $q = useQuasar(); $q.notify({ message: 'Bookmark not found', type: 'negative' }) }
            catch { }
            return
          }

          // Get the MongoDB _id for the API call
          const mongoId = typeof bookmarkToDelete === 'string' ? null : bookmarkToDelete._id

          if (mongoId) {
            await deleteBookmarkService(mongoId)
            this.bookmarks = this.bookmarks.filter((bm: any) =>
              typeof bm === 'string' ? bm !== id : bm?._id !== mongoId,
            )
          }
          else {
            // Fallback for string-based bookmarks (guests or legacy)
            this.bookmarks = this.bookmarks.filter((bm: any) =>
              typeof bm === 'string' ? bm !== id : bm?.bookmark !== id,
            )
          }

          try { const $q = useQuasar(); $q.notify({ message: 'Bookmark removed', type: 'info' }) }
          catch { }
        }
        catch {
          try { const $q = useQuasar(); $q.notify({ message: 'Failed to remove bookmark', type: 'negative' }) }
          catch { }
        }
      }
      else {
        this.bookmarks = this.bookmarks.filter((bm: any) =>
          typeof bm === 'string' ? bm !== id : bm?.bookmark !== id,
        )
        this._saveGuestBookmarks(this.bookmarks.map((b: any) => typeof b === 'string' ? b : b?.bookmark).filter(Boolean))
      }
    },
  },
})

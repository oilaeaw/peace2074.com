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
        }
        else {
          this.bookmarks = []
        }
      }
      else {
        const guestId = await this._getOrCreateGuestId()
        const key = `${GUEST_BOOKMARKS_KEY_PREFIX}${guestId}`
        try {
          const raw = await core.get(key)
          this.bookmarks = raw ? (Array.isArray(raw) ? raw : JSON.parse(String(raw))) : []
        }
        catch {
          this.bookmarks = []
        }
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
        }
        else {
          this.bookmarks = []
        }
      }
      else {
        const guestId = await this._getOrCreateGuestId()
        const key = `${GUEST_BOOKMARKS_KEY_PREFIX}${guestId}`
        try {
          const raw = await core.get(key)
          this.bookmarks = raw ? (Array.isArray(raw) ? raw : JSON.parse(String(raw))) : []
        }
        catch {
          this.bookmarks = []
        }
      }
    },

    async _getOrCreateGuestId() {
      try {
        let id = await core.get(GUEST_ID_KEY)
        if (!id) {
          id = genGuestId()
          try { await core.set(GUEST_ID_KEY, id) } catch {}
        }
        return String(id || '')
      }
      catch {}
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
      catch {}
    },

    async createBookmark(bm: string) {
      if (!bm)
        return
      // Check if bookmark already exists
      const existingBookmark = this.bookmarks.find((bookmark: any) =>
        typeof bookmark === 'string' ? bookmark === bm : bookmark?.bookmark === bm,
      )
      if (existingBookmark)
        return

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
            console.error('createBookmark: empty response', response)
            return
          }
          // push the saved bookmark object (includes _id for future operations)
          this.bookmarks.push(saved)
          console.log('[Bookmark] Saved to server:', saved)
          // refresh to ensure server-side ids are in sync
          try { await this.fetchBookmarks() }
          catch {}
        }
        catch (err) {
          console.error('[Bookmark] Server save failed:', err)
          // fallback to local push if server fails
          this.bookmarks.push(bm)
        }
      }
      else {
        // Guest: store locally under guest id
        this.bookmarks.push(bm)
        this._saveGuestBookmarks(this.bookmarks.map((b: any) => typeof b === 'string' ? b : b?.bookmark).filter(Boolean))
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
            catch {}
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
          catch {}
        }
        catch {
          try { const $q = useQuasar(); $q.notify({ message: 'Failed to remove bookmark', type: 'negative' }) }
          catch {}
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

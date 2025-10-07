import { defineStore } from 'pinia'
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
        if (Array.isArray(raw)) {
          this.bookmarks = raw // Keep full bookmark objects for authenticated users
        }
        else {
          this.bookmarks = []
        }
      }
      else {
        const guestId = this._getOrCreateGuestId()
        const key = `${GUEST_BOOKMARKS_KEY_PREFIX}${guestId}`
        try {
          const raw = localStorage.getItem(key)
          this.bookmarks = raw ? JSON.parse(raw) : []
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
        if (Array.isArray(raw)) {
          this.bookmarks = raw // Keep full bookmark objects for authenticated users
        }
        else {
          this.bookmarks = []
        }
      }
      else {
        const guestId = this._getOrCreateGuestId()
        const key = `${GUEST_BOOKMARKS_KEY_PREFIX}${guestId}`
        try {
          const raw = localStorage.getItem(key)
          this.bookmarks = raw ? JSON.parse(raw) : []
        }
        catch {
          this.bookmarks = []
        }
      }
    },

    _getOrCreateGuestId() {
      if (typeof localStorage === 'undefined')
        return ''
      let id = localStorage.getItem(GUEST_ID_KEY)
      if (!id) {
        id = genGuestId()
        try { localStorage.setItem(GUEST_ID_KEY, id) }
        catch {}
      }
      return id
    },

    _saveGuestBookmarks(bookmarks: string[]) {
      const guestId = this._getOrCreateGuestId()
      if (!guestId)
        return
      const key = `${GUEST_BOOKMARKS_KEY_PREFIX}${guestId}`
      try { localStorage.setItem(key, JSON.stringify(bookmarks)) }
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
          const created = await createBookmarkService({ bookmark: bm })
          // created may be a ref or raw object; normalize
          const saved = created && (created.value !== undefined) ? created.value : created
          if (!saved) {
            try { const $q = useQuasar(); $q.notify({ message: 'Server did not return a bookmark', type: 'negative' }) }
            catch {}
            console.error('createBookmark: empty response', created)
            return
          }
          // push the saved bookmark object (includes _id for future operations)
          this.bookmarks.push(saved)
          try { const $q = useQuasar(); $q.notify({ message: 'Bookmark saved to server', type: 'positive' }) }
          catch {}
          // refresh to ensure server-side ids are in sync
          try { await this.fetchBookmarks() }
          catch {}
        }
        catch {
          // fallback to local push if server fails
          this.bookmarks.push(bm)
          try { const $q = useQuasar(); $q.notify({ message: 'Saved locally (server unavailable)', type: 'warning' }) }
          catch {}
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
        const idx = this.bookmarks.findIndex(b => b === id || b === updated?.bookmark)
        if (idx !== -1)
          this.bookmarks[idx] = updated?.bookmark || newBm
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

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
    bookmarks: [] as string[],
  }),
  getters: {
    myBookmarks: state => state.bookmarks,
  },
  actions: {
    // Initialize bookmarks: if user logged in, load from server. Otherwise load guest local bookmarks.
    async init() {
      const auth = useAuthStore()
      const userId = auth.user?.id || auth.user?._id || auth.user?.value?.id || auth.user?.value?._id
      if (userId) {
        const res = await getBookmarks()
        this.bookmarks = Array.isArray(res) ? res : res?.value || []
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
        this.bookmarks = Array.isArray(res) ? res : res?.value || []
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
      if (this.bookmarks.includes(bm))
        return
      const auth = useAuthStore()
      const userId = auth.user?.id || auth.user?._id || auth.user?.value?.id || auth.user?.value?._id
      if (userId) {
        try {
          const created = await createBookmarkService({ bookmark: bm, userId })
          this.bookmarks.push(created?.bookmark || bm)
        }
        catch {
          // fallback to local push if server fails
          this.bookmarks.push(bm)
        }
      }
      else {
        // Guest: store locally under guest id
        this.bookmarks.push(bm)
        this._saveGuestBookmarks(this.bookmarks)
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
        await deleteBookmarkService(id)
        this.bookmarks = this.bookmarks.filter(b => b !== id)
      }
      else {
        this.bookmarks = this.bookmarks.filter(b => b !== id)
        this._saveGuestBookmarks(this.bookmarks)
      }
    },
  },
})

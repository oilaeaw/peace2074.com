import { defineStore } from 'pinia'
import { createBookmark as createBookmarkService, deleteBookmark as deleteBookmarkService, getBookmarks, updateBookmark as updateBookmarkService } from './services/index'
import { useUserStore } from './user.pinia'

export const useBookmarksStore = defineStore('bookStore', {
  state: () => ({
    bookmarks: [] as string[],
  }),
  actions: {
    async init() {
      const res = await getBookmarks()
      this.bookmarks = Array.isArray(res) ? res : res?.value || []
    },
    async fetchBookmarks() {
      const res = await getBookmarks()
      this.bookmarks = Array.isArray(res) ? res : res?.value || []
    },
    async createBookmark(bm: string) {
      if (bm && !this.bookmarks.includes(bm)) {
        const userStore = useUserStore()
        const userId = userStore.user?.id || userStore.user?._id
        if (!userId) {
          console.warn('No user ID found, cannot save bookmark to DB.')
          this.bookmarks.push(bm)
          return
        }
        const created = await createBookmarkService({ bookmark: bm, userId })
        this.bookmarks.push(created?.bookmark || bm)
      }
    },
    async updateBookmark(id: string, newBm: string) {
      const updated = await updateBookmarkService(id, newBm)
      const idx = this.bookmarks.findIndex(b => b === id || b === updated?.bookmark)
      if (idx !== -1)
        this.bookmarks[idx] = updated?.bookmark || newBm
    },
    async deleteBookmark(id: string) {
      await deleteBookmarkService(id)
      this.bookmarks = this.bookmarks.filter(b => b !== id)
    },
  },
  getters: {
    myBookmarks: state => state.bookmarks,
  },
})

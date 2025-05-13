import { defineStore } from 'pinia'
import { deleteBookmark, fetchDataBookmarks, saveBookmark } from './services'

export const useBookmarksStore = defineStore('bookStore', {
  state: () => ({
    bookmarks: [] as string[],
  }),
  actions: {
    async init() {
      this.bookmarks = await fetchBookmarks()
    },
    async fetchBookmarks() {
      this.bookmarks = await fetchDataBookmarks()
    },
    async saveBookmark(bm: string) {
      if (bm && !this.bookmarks.includes(bm)) {
        await saveBookmark(bm)
        this.bookmarks.push(bm)
      }
    },
    async deleteBookmark(bm: string) {
      await deleteBookmark(bm)
      this.bookmarks = this.bookmarks.filter(b => b !== bm)
    },
  },
  getters: {
    myBookmarks: state => state.bookmarks,
  },
})

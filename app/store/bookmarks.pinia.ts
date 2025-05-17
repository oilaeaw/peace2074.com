import { defineStore } from 'pinia'

const { $hapi } = useNuxtApp()

export const useBookmarksStore = defineStore('bookStore', {
  state: () => ({
    bookmarks: [] as string[],
  }),
  actions: {
    async init() {
      const res = await $hapi.service('bookmarks').find()
      this.bookmarks = Array.isArray(res) ? res : res.data
    },
    async fetchBookmarks() {
      const res = await $hapi.service('bookmarks').find()
      this.bookmarks = Array.isArray(res) ? res : res.data
    },
    async createBookmark(bm: string) {
      if (bm && !this.bookmarks.includes(bm)) {
        const created = await $hapi.service('bookmarks').create({ bookmark: bm })
        this.bookmarks.push(created.bookmark || bm)
      }
    },
    async updateBookmark(id: string, newBm: string) {
      // id should be the bookmark's unique identifier
      const updated = await $hapi.service('bookmarks').patch(id, { bookmark: newBm })
      const idx = this.bookmarks.findIndex(b => b === id || b === updated.bookmark)
      if (idx !== -1)
        this.bookmarks[idx] = updated.bookmark || newBm
    },
    async deleteBookmark(id: string) {
      await $hapi.service('bookmarks').remove(id)
      this.bookmarks = this.bookmarks.filter(b => b !== id)
    },
  },
  getters: {
    myBookmarks: state => state.bookmarks,
  },
})

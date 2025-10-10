import { defineStore } from 'pinia'

export const useMyLangsStore = defineStore({
  id: 'myLangsStore',
  state: () => ({
    locales: [
      {
        code: 'en',
        name: 'English',
      },
      {
        code: 'ar',
        name: 'Arabic',
      },
      {
        code: 'de',
        name: 'Deutsch',
      },
      {
        code: 'ru',
        name: 'Русский',
      },
    ],
    locale: '',
  }),
  actions: {
    setLocale(lcl: string) {
      this.locale = lcl
    },
  },
  getters: {
    currentLocale: state => state.locale,
  },
})

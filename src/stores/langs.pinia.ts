import { defineStore } from 'pinia'

export const useMyLangsStore = defineStore('myLangsStore', {
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
      {
        code: 'tr',
        name: 'Türkçe',
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

export const useLangsStore = useMyLangsStore

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
        code: 'es',
        name: 'Español',
      },
      {
        code: 'ru',
        name: 'Русский',
      },
      {
        code: 'he',
        name: 'עברית',
      },
      {
        code: 'it',
        name: 'Italiano',
      },
      {
        code: 'tr',
        name: 'Türkçe',
      },
      {
        code: 'uz',
        name: 'Oʻzbekcha',
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

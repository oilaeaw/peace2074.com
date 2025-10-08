import type { LocaleT } from './../../i18n.config'
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
    setLocale(lcl: LocaleT) {
      this.locale = lcl
    },
  },
  getters: {
    locale: state => state.locale,
  },
})

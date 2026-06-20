import { ar, de, en, es, he, it, ru, tr, uz } from './src/locale'

export interface LocaleT {
  code: string
  name?: string
  messages?: Record<string, unknown>
}
export type LocalesT = LocaleT[]

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  locales: [
    {
      code: 'en',
      name: 'English',
      messages: en,
    },
    {
      code: 'ar',
      name: 'Arabic',
      messages: ar,
    },
    {
      code: 'de',
      name: 'Deutsch',
      messages: de,
    },
    {
      code: 'es',
      name: 'Español',
      messages: es,
    },
    {
      code: 'ru',
      name: 'Русский',
      messages: ru,
    },
    {
      code: 'he',
      name: 'עברית',
      messages: he,
    },
    {
      code: 'it',
      name: 'Italiano',
      messages: it,
    },
    {
      code: 'tr',
      name: 'Türkçe',
      messages: tr,
    },
    {
      code: 'uz',
      name: 'Oʻzbekcha',
      messages: uz,
    },
  ],
  messages: {
    en,
    ar,
    de,
    es,
    ru,
    he,
    it,
    tr,
    uz,
  },
}))

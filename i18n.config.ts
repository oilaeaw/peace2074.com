import { ar, de, en, ru } from './app/locale'

export interface LocaleT { code: string, name?: string, messages?: string[] }
export type LocalesT = Locale[]

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
      code: 'ru',
      name: 'Русский',
      messages: ru,
    },
  ],
  messages: {
    en,
    ar,
    de,
    ru,
  },
}))

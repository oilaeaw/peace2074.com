import { ar, en } from './app/locale'

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
  ],
  messages: {
    en,
    ar,
  },
}))

import { ar, de, en, ru } from './app/locale'

export default defineI18nConfig(() => ({
  // Use Composition API
  legacy: false,
  // Default locale
  locale: 'en',
  // Fallback to English when a key is missing in the active locale
  fallbackLocale: 'en',
  // Use nested JSON structure (our locale files are nested)
  flatJson: false,
  // Bundle all messages directly (we are not using lazy loading here)
  messages: { en, ar, de, ru },
}))

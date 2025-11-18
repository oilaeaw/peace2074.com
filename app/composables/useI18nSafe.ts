import { useI18n as useVueI18n } from 'vue-i18n'

/**
 * Safe wrapper for useI18n() that handles SSR/hydration issues
 * Returns an object with a t function that falls back to returning the key if i18n is not available
 */
export function useI18nSafe() {
  let t = (key: string) => key
  let locale = ref('en')

  try {
    const i18n = useVueI18n()
    if (i18n && typeof i18n.t === 'function') {
      t = i18n.t
      locale = computed(() => i18n.locale.value)
    }
  } catch (e) {
    // i18n not available, use fallback
    console.debug('useI18nSafe: i18n not available, using fallback', e)
  }

  return {
    t,
    locale,
  }
}

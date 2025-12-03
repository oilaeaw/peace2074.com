import { defineStore, acceptHMRUpdate } from 'pinia'

export const useLangsStore = defineStore('langs', () => {
  const locales = ref([
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
  ])
  const locale = ref('')

  function setLocale(newLocale: string) {
    locale.value = newLocale
  }

  const currentLocale = computed(() => {
    return locales.value.find(l => l.code === locale.value) || null
  })

  return { locales, locale, setLocale, currentLocale }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLangsStore, import.meta.hot))
}

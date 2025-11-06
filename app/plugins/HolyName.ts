import { defineNuxtPlugin, useFetch, useNuxtApp, useState } from 'nuxt/app'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { data } = await useFetch('/api/holynames/', {
    headers: {
      Accept: 'application/json',
    },
    getCachedData(key) {
      return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
    },
  })

  if (data && data.value) {
    const list = (data.value as any)?.data || []
    useState('HolyNames', () => list)
    nuxtApp.provide('HolyNames', list)
    if (import.meta.client) {
      try {
  const core = (nuxtApp as any).$core || (await import('@shared/utils/core')).default
        void core.set('holybook', list)
      }
      catch {}
    }
  }
})

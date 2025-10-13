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
    useState('HolyNames', () => data.value.data)
    nuxtApp.provide('HolyNames', data.value.data)
    if (import.meta.client) {
      try {
  const core = (nuxtApp as any).$core || (await import('@shared/utils/core')).default
        void core.set('holybook', data.value.data)
      }
      catch {}
    }
  }
})

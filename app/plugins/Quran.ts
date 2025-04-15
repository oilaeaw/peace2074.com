import { defineNuxtPlugin, useFetch, useState } from 'nuxt/app'

const StaticName = 'holybook'

export default defineNuxtPlugin(async (nuxtApp: NuxtApp) => {
  if (import.meta.client) {
    const q2p = useQ2P()
    q2p.setQuran()

    const { data } = await useFetch('/api/quran/', {
      headers: {
        Accept: 'application/json',
      },
      getCachedData(key) {
        return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
      },
    })
    const oldD = localStorage.getItem(StaticName)
    if (JSON.stringify(oldD))
      q2p.setQuran(oldD)

    console.warn('status', status.value)

    if (data && data.value) {
      const readyData = data.value

      useState(StaticName, () => readyData)
      nuxtApp.provide(StaticName, readyData)
      // q2p.setQuran(JSON.stringify(readyData))
      // localStorage.setItem(StaticName, readyData)
    }
  }
})

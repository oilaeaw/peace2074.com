import { defineNuxtPlugin, useFetch, useState } from 'nuxt/app'

const StaticName = 'holybook'

export default defineNuxtPlugin(async (nuxtApp) => {
  if (import.meta.client) {
    const q2p = useQ2P()
    q2p.setUpBook()

    try {
      const { data } = await useFetch('/api/quran/', {
        headers: {
          Accept: 'application/json',
        },
        getCachedData(key) {
          return nuxtApp.payload?.data?.[key] || nuxtApp.static?.data?.[key]
        },
      })

      const oldData = localStorage.getItem(StaticName)
      if (oldData) {
        q2p.setBook(oldData)
      }

      if (data?.value) {
        const readyData = data.value

        useState(StaticName, () => readyData)
        nuxtApp.provide(StaticName, readyData)
        q2p.setBook(JSON.stringify(readyData))
        localStorage.setItem(StaticName, JSON.stringify(readyData))
      }
    }
    catch (error) {
      console.error('Error fetching Quran data:', error)
    }
  }
})

import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

export default defineNuxtPlugin((_nuxtApp) => {
  if (import.meta.client) {
    createPinia().use(PiniaColada)
    // install after pinia
    const savedData = localStorage.getItem(StaticName)
    const q2p = useQ2P()
    if (savedData) {
      q2p.setBook(savedData)
    }
  }
})

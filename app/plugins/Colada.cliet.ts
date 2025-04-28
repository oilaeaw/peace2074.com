import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin((_nuxtApp) => {
  if (import.meta.client) {
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)
    createPinia().use(PiniaColada)
    const q2p = useQ2P()
    q2p.init()
  }
})

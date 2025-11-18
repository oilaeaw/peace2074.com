import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Export internal setup for unit testing without needing defineNuxtPlugin runtime.
export function __coladaSetup(nuxtApp: any) {
  const attempt = () => {
    const config = nuxtApp?.vueApp?.config
    if (!config || !config.globalProperties)
      return false
    const pinia = config.globalProperties.$pinia
    if (!pinia)
      return false
    try {
      import('@pinia/colada').then(({ PiniaColada }) => {
        try { pinia.use(PiniaColada as any) } catch {}
      })
      try { pinia.use(piniaPluginPersistedstate) } catch {}
    }
    catch (e) {
      console.warn('Pinia Colada deferred init failed:', e)
    }
    return true
  }
  if (!attempt()) {
    queueMicrotask(() => attempt())
    setTimeout(() => attempt(), 50)
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.client && import.meta.dev) {
    try {
      __coladaSetup(nuxtApp)
    }
    catch (err) {
      console.warn('Pinia Colada plugin initialization skipped:', err)
    }
  }
})

// The useQ2P composable seems to be from another plugin.
// It's better to keep its initialization separate to avoid complexity.
// If it's still needed, consider initializing it in its own plugin file.

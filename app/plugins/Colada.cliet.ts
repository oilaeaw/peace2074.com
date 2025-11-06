import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.client) {
    try {
      // Create a Pinia instance to ensure plugins are available. We will
      // only install it into the Vue app if no Pinia instance already exists
      // (the @pinia/nuxt module commonly installs Pinia automatically).
      const candidate = createPinia()
      candidate.use(piniaPluginPersistedstate)
  candidate.use(PiniaColada as any)

      // Detect whether a Pinia instance is already provided by the app.
      // We look for a provided object that looks like Pinia (has `use` fn).
      // This is a best-effort detection to avoid trying to set $pinia when
      // it's provided as a read-only getter by Nuxt's Pinia integration.
  const provided = (nuxtApp.vueApp && nuxtApp.vueApp._context && nuxtApp.vueApp._context.provides) || {}
      const existingPinia = Object.values(provided).find((v: any) => v && typeof v.use === 'function')

      if (existingPinia) {
        // Attach plugins to the existing Pinia instance instead of installing a new one
        try {
          existingPinia.use(piniaPluginPersistedstate)
          existingPinia.use(PiniaColada as any)
        }
        catch {
          // non-fatal — plugin may already be installed
        }
      }
      else {
        // No existing Pinia found — safe to install the one we created
  nuxtApp.vueApp.use(candidate)
      }

      // Initialize q2p (quietly) — it's safe to call regardless of Pinia state
      try {
        const q2p = useQ2P()
        q2p.init()
      }
      catch {}
    }
    catch (err) {
      // swallow errors here to avoid breaking app startup — Nuxt's own Pinia
      // integration will provide core store functionality if this plugin fails.
      console.warn('Pinia Colada plugin initialization skipped:', err)
    }
  }
})

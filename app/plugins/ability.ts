import { defineNuxtPlugin } from '#app'
import { useAuthStore } from '~/store/auth.pinia'

export default defineNuxtPlugin((nuxtApp) => {
  try {
    const auth = useAuthStore()
    const ability = auth.ability as any
    // Fallback stub if for some reason the store isn't ready yet
    const safeAbility = ability && typeof ability.can === 'function'
      ? ability
      : { can: () => false }

    // Provide for inject('ability') and $ability in templates.
    // Guard against duplicate provide calls in dev/HMR to avoid
    // "Cannot redefine property: $ability" errors. Use a plugin-scoped flag
    // on nuxtApp to avoid touching vueApp/config when not yet available.
    const FLAG = '__ability_provided__'
    const already = (nuxtApp as any)[FLAG] === true
    if (!already) {
      nuxtApp.provide('ability', safeAbility)
      ;(nuxtApp as any)[FLAG] = true
    }
  }
  catch (e) {
    // As a last resort, provide a no-op ability to prevent template crashes
    const fallback = { can: () => false }
    const FLAG = '__ability_provided__'
    const already = (nuxtApp as any)[FLAG] === true
    if (!already) {
      nuxtApp.provide('ability', fallback)
      ;(nuxtApp as any)[FLAG] = true
    }
  }
})

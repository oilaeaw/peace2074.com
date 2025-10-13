import core from '@shared/utils/core'

export default defineNuxtPlugin((nuxtApp) => {
  // provide as $core so components can access via this.$core or nuxtApp.$core
  // Guard against duplicate plugin registration which can happen during
  // HMR or when the runtime loads plugins multiple times in dev.
  if (!(nuxtApp as any).$core) {
    nuxtApp.provide('core', core)
  }
  return {}
})

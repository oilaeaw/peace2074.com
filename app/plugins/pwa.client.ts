import { Notify } from 'quasar'
import { useI18n as useVueI18n } from 'vue-i18n'

export default defineNuxtPlugin(async () => {
  // Only enable PWA in runs where the Vite PWA plugin is active.
  if (!import.meta.env.VITE_PLUGIN_PWA)
    return

  // Lazily import virtual module to avoid Vite resolution errors when the PWA plugin is disabled.
  const key = 'virtual:pwa-register/vue'
  const mod = await import(/* @vite-ignore */ key).catch(() => null as any)
  if (!mod)
    return
  // Use loose typing here to avoid type resolution errors when the PWA plugin is disabled
  const { useRegisterSW } = mod as any

  // Register the service worker and handle update notifications
  const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegistered(reg: any) {
      // Periodically check for updates while the app is open
      if (reg) {
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000)
      }
    },
    onRegisterError(error: any) {
      console.warn('SW registration failed', error)
    },
  })

  // Helper to safely get i18n
  const getI18n = () => {
    try {
      return useVueI18n()
    } catch (e) {
      return null
    }
  }

  // Show a Quasar notification when the app can work offline
  watch(offlineReady, (ready) => {
    if (ready) {
      const i18n = getI18n()
      const t = i18n?.t || ((key: string) => key)
      Notify.create({
        message: t('button.offline_ready'),
        color: 'positive',
        icon: 'cloud_done',
        timeout: 2500,
      })
    }
  }, { immediate: true })

  // When a new version is available, prompt and reload after activating the new SW
  watch(needRefresh, (refresh) => {
    if (refresh) {
      const i18n = getI18n()
      const t = i18n?.t || ((key: string) => key)
      Notify.create({
        message: t('button.new_content'),
        color: 'primary',
        icon: 'system_update',
        timeout: 0,
        actions: [
          {
            label: t('button.reload'),
            color: 'white',
            handler: () => {
              const doReload = () => window.location.reload()
              if (navigator.serviceWorker?.controller) {
                navigator.serviceWorker.addEventListener('controllerchange', () => doReload(), { once: true })
              }
              updateServiceWorker()
                .catch(() => doReload())
            },
          },
          { label: t('button.close'), color: 'white' },
        ],
      })
    }
  }, { immediate: true })
})

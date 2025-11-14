import { useRegisterSW } from 'virtual:pwa-register/vue'
import { onMounted } from 'vue'
import { Notify } from 'quasar'

export default defineNuxtPlugin(() => {
  // Register the service worker and handle update notifications
  const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegistered(reg) {
      // Periodically check for updates while the app is open
      if (reg) {
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000)
      }
    },
    onRegisterError(error) {
      console.warn('SW registration failed', error)
    },
  })

  // Show a Quasar notification when the app can work offline
  watch(offlineReady, (ready) => {
    if (ready) {
      const { t } = useI18n()
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
      const { t } = useI18n()
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

  // On iOS Safari, ensure we try to update SW on each mount due to update throttling
  onMounted(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => reg?.update().catch(() => {}))
    }
  })
})

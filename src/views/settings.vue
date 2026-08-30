<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import OfflineRecitationManager from '@/components/quran/OfflineRecitationManager.vue'
import { useAthanPlayer, type AthanReciterId } from '@/composables/useAthanPlayer'
import {
  QURAN_TRANSLATORS,
  TRANSLATOR_PREF_KEY,
  readTranslatorIdForLocale,
  persistTranslatorIdForLocale,
  type QuranTranslator,
} from '@shared/data/quran-translators'
import {
  FONT_SIZE_KEY,
  HIGH_CONTRAST_KEY,
  applyFontSize,
  applyHighContrast,
  readFontSizePreference,
  readHighContrastPreference,
} from '@/utils/accessibility-preferences'
import {
  useProfileSettings,
  type QuranHighlightMode,
} from '@/composables/useProfileSettings'
import { settings } from '@/utils/settingsStore'

const NAV_ORDERING_KEY = 'nav-ordering-enabled'
const DRAWER_OPEN_KEY = 'drawer-open-by-default'
const COMPACT_KEY = 'pref-compact-layout'
const MOTION_KEY = 'pref-reduce-motion'
const AUTOPLAY_KEY = 'pref-autoplay-athan'
const AUTOPLAY_PRAYER_KEY = 'pref-autoplay-prayer-times'
const QURAN_TRANSLATION_KEY = 'quran-show-translation'
const NOTIFICATIONS_KEY = 'pref-enable-notifications'
const DARK_MODE_KEY = 'pref-dark-mode'
const CURSOR_TRAIL_KEY = 'pref-cursor-trail-count'

const { t, locale } = useI18n()
const $q = useQuasar()
const { highlightMode, loadProfileSettings, setHighlightMode } =
  useProfileSettings()
const selectedHighlightMode = computed<QuranHighlightMode>({
  get: () => highlightMode.value,
  set: (mode) => {
    void setHighlightMode(mode).catch((error) => {
      console.warn('Failed to save highlight mode:', error)
    })
  },
})

function isNativeRuntime(): boolean {
  if (typeof window === 'undefined') return false
  const protocol = String(window.location.protocol || '')
  return (
    protocol === 'capacitor:' || protocol === 'ionic:' || protocol === 'app:'
  )
}

const enableNotifications = ref(settings.get<boolean>(NOTIFICATIONS_KEY, false))
const navOrderingEnabled = ref(settings.get<boolean>(NAV_ORDERING_KEY, true))
const drawerOpenByDefault = ref(settings.get<boolean>(DRAWER_OPEN_KEY, false))
const compactLayout = ref(settings.get<boolean>(COMPACT_KEY, false))
const reduceMotion = ref(settings.get<boolean>(MOTION_KEY, false))
const autoPlayAthan = ref(settings.get<boolean>(AUTOPLAY_KEY, false))
const autoPlayPrayerTimes = ref(settings.get<boolean>(AUTOPLAY_PRAYER_KEY, true))
const cursorTrailCount = ref(settings.get<number>(CURSOR_TRAIL_KEY, 40))
const showQuranTranslation = ref(settings.get<boolean>(QURAN_TRANSLATION_KEY, true))
const darkMode = ref(settings.get<boolean>(DARK_MODE_KEY, false))
const fontSize = ref(readFontSizePreference())
const highContrast = ref(readHighContrastPreference())
const showOfflineRecitationManager = ref(false)

const {
  reciters,
  selectedReciterId,
  selectedReciter,
  isPlaying: athanIsPlaying,
  isLoading: athanIsLoading,
  toggle: toggleAthanPreview,
  stop: stopAthanPreview,
  setReciter,
} = useAthanPlayer()

const reciterOptions = computed(() =>
  reciters.map((r) => ({ value: r.id, label: r.name, sublabel: r.nameAr }))
)

function onReciterChange(id: AthanReciterId) {
  stopAthanPreview()
  setReciter(id)
}

const apiTranslators = ref<Record<string, QuranTranslator[]> | null>(null)

async function fetchTranslators() {
  try {
    const res = await fetch('/api/quran/translations')
    if (res.ok) {
      const json = await res.json()
      if (json?.translators) apiTranslators.value = json.translators
    }
  } catch {
    // fall back to bundled data
  }
}

const translatorOptions = computed(() => {
  const source = apiTranslators.value ?? QURAN_TRANSLATORS
  return (source[locale.value] || []).map((tr) => ({
    value: tr.id,
    label: tr.name,
  }))
})

const translatorModel = computed({
  get: () => readTranslatorIdForLocale(locale.value),
  set: (id: number) => {
    persistTranslatorIdForLocale(locale.value, id)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('quran-translator-changed', {
          detail: { id, locale: locale.value },
        })
      )
    }
  },
})

watch(locale, (newLocale) => {
  // When the app locale changes, dispatch quran-translator-changed so the
  // Quran page re-fetches with the new locale's default (or stored) translator.
  if (typeof window === 'undefined') return
  const id = readTranslatorIdForLocale(newLocale)
  window.dispatchEvent(
    new CustomEvent('quran-translator-changed', {
      detail: { id, locale: newLocale },
    })
  )
})

watch(navOrderingEnabled, (val) => {
  persistNavOrdering(val)
  broadcastNavOrdering(val)
})

watch(drawerOpenByDefault, (val) => {
  persistDrawerPreference(val)
  broadcastDrawerPreference(val)
})

watch(compactLayout, (val) => {
  persistCompactPreference(val)
  broadcastCompactPreference(val)
})

watch(reduceMotion, (val) => {
  persistReduceMotionPreference(val)
  broadcastReduceMotionPreference(val)
})

watch(autoPlayAthan, (val) => {
  persistAutoplayPreference(val)
  broadcastAutoplayPreference(val)
})

watch(autoPlayPrayerTimes, (val) => {
  persistAutoplayPrayerTimesPreference(val)
  broadcastAutoplayPrayerTimesPreference(val)
})

watch(showQuranTranslation, (val) => {
  persistQuranTranslationPreference(val)
  broadcastQuranTranslationPreference(val)
})

watch(darkMode, (val) => {
  $q.dark.set(val)
  persistDarkModePreference(val)
})

watch(fontSize, (val) => {
  persistFontSizePreference(val)
  applyFontSize(val)
})

watch(highContrast, (val) => {
  persistHighContrastPreference(val)
  applyHighContrast(val)
})

watch(cursorTrailCount, (val) => {
  persistCursorTrailCount(val)
  broadcastCursorTrailCount(val)
})

watch(enableNotifications, async (val) => {
  if (val) {
    const ok = await activateNotifications()
    persistNotificationsPreference(ok)
    if (!ok) {
      enableNotifications.value = false
    }
    return
  }

  // Unsubscribe from push notifications
  await unsubscribeFromPushNotifications()
  persistNotificationsPreference(false)
})

onMounted(async () => {
  // Migrate any legacy plain-text preferences into the encrypted store
  settings.migrateAll([
    NAV_ORDERING_KEY, DRAWER_OPEN_KEY, COMPACT_KEY, MOTION_KEY,
    AUTOPLAY_KEY, AUTOPLAY_PRAYER_KEY, QURAN_TRANSLATION_KEY,
    NOTIFICATIONS_KEY, DARK_MODE_KEY, CURSOR_TRAIL_KEY,
  ])

  applyFontSize(fontSize.value)
  applyHighContrast(highContrast.value)
  await loadProfileSettings()
  fetchTranslators()

  if (!enableNotifications.value) return
  const ok = await activateNotifications()
  persistNotificationsPreference(ok)
  if (!ok) {
    enableNotifications.value = false
  }
})

async function activateNotifications(): Promise<boolean> {
  if (isNativeRuntime()) {
    $q.notify?.({
      type: 'warning',
      message: t('pages.settings.notifications.unavailable'),
    })
    return false
  }

  const granted = await ensureNotificationsPermission()
  if (!granted) {
    return false
  }

  const subscriptionResult = await subscribeToPushNotifications()
  if (!subscriptionResult.ok) {
    $q.notify?.({
      type: 'negative',
      message:
        subscriptionResult.error || t('pages.settings.notifications.error'),
    })
    return false
  }

  await showTestNotification()
  $q.notify?.({
    type: 'positive',
    message: t('pages.settings.notifications.enabled'),
  })

  return true
}

// ─── Encrypted read / persist helpers ────────────────────────────────────────

function readNavOrderingEnabled(): boolean {
  return settings.get<boolean>(NAV_ORDERING_KEY, true)
}
function persistNavOrdering(val: boolean) {
  settings.set(NAV_ORDERING_KEY, val)
}

function readCompactPreference(): boolean {
  return settings.get<boolean>(COMPACT_KEY, false)
}
function persistCompactPreference(val: boolean) {
  settings.set(COMPACT_KEY, val)
}

function readReduceMotionPreference(): boolean {
  return settings.get<boolean>(MOTION_KEY, false)
}
function persistReduceMotionPreference(val: boolean) {
  settings.set(MOTION_KEY, val)
}

function readAutoplayAthanPreference(): boolean {
  return settings.get<boolean>(AUTOPLAY_KEY, false)
}
function persistAutoplayPreference(val: boolean) {
  settings.set(AUTOPLAY_KEY, val)
}

function readAutoplayPrayerTimesPreference(): boolean {
  return settings.get<boolean>(AUTOPLAY_PRAYER_KEY, true)
}
function persistAutoplayPrayerTimesPreference(val: boolean) {
  settings.set(AUTOPLAY_PRAYER_KEY, val)
}

function readQuranTranslationPreference(): boolean {
  return settings.get<boolean>(QURAN_TRANSLATION_KEY, true)
}
function persistQuranTranslationPreference(val: boolean) {
  settings.set(QURAN_TRANSLATION_KEY, val)
}

function readNotificationsPreference(): boolean {
  return settings.get<boolean>(NOTIFICATIONS_KEY, false)
}
function persistNotificationsPreference(val: boolean) {
  settings.set(NOTIFICATIONS_KEY, val)
}

function readDarkModePreference(): boolean {
  return settings.get<boolean>(DARK_MODE_KEY, false)
}
function persistDarkModePreference(val: boolean) {
  settings.set(DARK_MODE_KEY, val)
}

function persistFontSizePreference(val: number) {
  settings.set(FONT_SIZE_KEY, val)
}

function persistHighContrastPreference(val: boolean) {
  settings.set(HIGH_CONTRAST_KEY, val)
}

function readCursorTrailCount(): number {
  return settings.get<number>(CURSOR_TRAIL_KEY, 40)
}
function persistCursorTrailCount(val: number) {
  settings.set(CURSOR_TRAIL_KEY, val)
}

function readDrawerOpenPreference(): boolean {
  return settings.get<boolean>(DRAWER_OPEN_KEY, false)
}
function persistDrawerPreference(val: boolean) {
  settings.set(DRAWER_OPEN_KEY, val)
}

// ─── Broadcast helpers — notify app-wide listeners ────────────────────────────

function broadcastNavOrdering(val: boolean) {
  window.dispatchEvent(new CustomEvent('nav-ordering-changed', { detail: { enabled: val } }))
}
function broadcastDrawerPreference(val: boolean) {
  window.dispatchEvent(new CustomEvent('drawer-preference-changed', { detail: { open: val } }))
}
function broadcastCompactPreference(val: boolean) {
  window.dispatchEvent(new CustomEvent('compact-layout-changed', { detail: { enabled: val } }))
}
function broadcastReduceMotionPreference(val: boolean) {
  window.dispatchEvent(new CustomEvent('reduce-motion-changed', { detail: { enabled: val } }))
}
function broadcastAutoplayPreference(val: boolean) {
  window.dispatchEvent(new CustomEvent('autoplay-athan-changed', { detail: { enabled: val } }))
}
function broadcastAutoplayPrayerTimesPreference(val: boolean) {
  window.dispatchEvent(new CustomEvent('autoplay-prayer-times-changed', { detail: { enabled: val } }))
}
function broadcastQuranTranslationPreference(val: boolean) {
  window.dispatchEvent(new CustomEvent('quran-translation-visibility-changed', { detail: { enabled: val } }))
}
function broadcastCursorTrailCount(val: number) {
  window.dispatchEvent(new CustomEvent('cursor-trail-count-changed', { detail: { count: val } }))
}

// ─── Broadcast helpers & notifications ──────────────────────────────────────

async function ensureNotificationsPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    $q.notify?.({
      type: 'warning',
      message: t('pages.settings.notifications.unavailable'),
    })
    return false
  }
  const current = Notification.permission
  if (current === 'granted') return true
  if (current === 'denied') {
    $q.notify?.({
      type: 'negative',
      message: t('pages.settings.notifications.denied'),
    })
    return false
  }
  try {
    const result = await Notification.requestPermission()
    if (result === 'granted') return true
    $q.notify?.({
      type: 'warning',
      message: t('pages.settings.notifications.denied'),
    })
    return false
  } catch {
    $q.notify?.({
      type: 'negative',
      message: t('pages.settings.notifications.error'),
    })
    return false
  }
}

async function showTestNotification(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (isNativeRuntime()) return false

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      if (reg?.showNotification) {
        await reg.showNotification(
          t('pages.settings.notifications.testTitle'),
          {
            body: t('pages.settings.notifications.testBody'),
            icon: '/android-chrome-192x192.png',
            tag: 'peace2074-notification-test',
          }
        )
        return true
      }
    }

    if (
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      // Fallback to immediate notification in supported desktop browsers
      new Notification(t('pages.settings.notifications.testTitle'), {
        body: t('pages.settings.notifications.testBody'),
        icon: '/android-chrome-192x192.png',
        tag: 'peace2074-notification-test',
      })
      return true
    }
  } catch (err) {
    console.warn('Notification test failed', err)
  }

  return false
}

type PushSubscriptionResult = {
  ok: boolean
  error?: string
}

async function subscribeToPushNotifications(): Promise<PushSubscriptionResult> {
  if (isNativeRuntime()) {
    return {
      ok: false,
      error: t('pages.settings.notifications.unavailable'),
    }
  }

  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[Push] Service Worker not supported')
    return {
      ok: false,
      error: t('pages.settings.notifications.unavailable'),
    }
  }

  if (!('PushManager' in window)) {
    return {
      ok: false,
      error: t('pages.settings.notifications.unavailable'),
    }
  }

  if (!window.isSecureContext) {
    return {
      ok: false,
      error: t('pages.settings.notifications.unavailable'),
    }
  }

  try {
    // Ensure service worker is registered
    let registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    }

    // Wait for service worker ready promise (guarantees an active worker)
    const activeRegistration = await navigator.serviceWorker.ready
    if (activeRegistration) {
      registration = activeRegistration
    }

    // If active worker is still installing/waiting, wait for it to activate
    if (!registration.active) {
      const pendingWorker = registration.installing || registration.waiting
      if (pendingWorker) {
        await new Promise<void>((resolve) => {
          const onState = () => {
            if (pendingWorker.state === 'activated' || pendingWorker.state === 'redundant') {
              pendingWorker.removeEventListener('statechange', onState)
              resolve()
            }
          }
          pendingWorker.addEventListener('statechange', onState)
        })
        const updated = await navigator.serviceWorker.getRegistration()
        if (updated?.active) registration = updated
      }
    }

    if (!registration.active) {
      return {
        ok: false,
        error: t('pages.settings.notifications.unavailable'),
      }
    }

    // Get VAPID public key from server
    const keyRes = await fetch('/api/push/public-key', {
      credentials: 'include',
    })
    const keyData = await keyRes.json().catch(() => ({}))

    if (!keyRes.ok || !keyData?.ok || !keyData?.publicKey) {
      const errorMessage =
        keyData?.error || `Failed to load push public key (${keyRes.status})`
      console.error('[Push]', errorMessage)
      return { ok: false, error: errorMessage }
    }

    // Convert base64 VAPID key to Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey)

    // Reuse existing subscription if present
    let subscription = await registration.pushManager.getSubscription()

    // Subscribe to push notifications
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      })
    }

    // Send subscription to server
    const subRes = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ subscription }),
    })

    const subData = await subRes.json().catch(() => ({}))

    if (!subRes.ok || !subData?.ok) {
      const errorMessage =
        subData?.error || `Failed to save subscription (${subRes.status})`
      console.error('[Push]', errorMessage)
      return { ok: false, error: errorMessage }
    }

    console.log('[Push] Successfully subscribed to push notifications')
    return { ok: true }
  } catch (err) {
    console.error('[Push] Subscription error:', err)

    const message =
      err instanceof Error
        ? err.message
        : t('pages.settings.notifications.error')

    return { ok: false, error: message }
  }
}

async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (isNativeRuntime()) {
    return true
  }

  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return true
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) return true

    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return true

    // Unsubscribe from push
    await subscription.unsubscribe()

    // Remove from server
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    })

    console.log('[Push] Unsubscribed from push notifications')
    return true
  } catch (err) {
    console.error('[Push] Unsubscribe error:', err)
    return false
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function onPullRefresh(done?: () => void) {
  reloadApp()
  if (done) done()
}

async function reloadApp() {
  $q.notify({
    type: 'info',
    message: t('pages.settings.clearingCache'),
    timeout: 3000,
    position: 'top',
  })

  try {
    // 1. Unregister ALL service workers (not just update — full nuke)
    if (!isNativeRuntime() && 'serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(
        regs.map(async (reg) => {
          // Tell any waiting SW to activate immediately
          reg.waiting?.postMessage({ type: 'SKIP_WAITING' })
          await reg.unregister()
        })
      )
      console.log(`[Settings] Unregistered ${regs.length} service worker(s)`)
    }

    // 2. Delete browser caches (preserve offline recitation audio)
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      const cachesToDelete = cacheNames.filter((name) => !name.startsWith('quran-audio-offline'))
      await Promise.all(cachesToDelete.map((name) => caches.delete(name)))
      console.log(
        `[Settings] Deleted ${cachesToDelete.length} cache(s) (${cacheNames.length - cachesToDelete.length} offline recitation cache(s) preserved)`
      )
    }

    // 3. Clear localStorage (preserve critical user settings)
    if (typeof window !== 'undefined' && window.localStorage) {
      const criticalKeys = [
        'app-locale',
        'theme-mode',
        'pref-athan-reciter',
        NAV_ORDERING_KEY,
        DRAWER_OPEN_KEY,
        COMPACT_KEY,
        MOTION_KEY,
        AUTOPLAY_KEY,
        AUTOPLAY_PRAYER_KEY,
        QURAN_TRANSLATION_KEY,
        NOTIFICATIONS_KEY,
        DARK_MODE_KEY,
        FONT_SIZE_KEY,
        HIGH_CONTRAST_KEY,
        CURSOR_TRAIL_KEY,
        'peace2074-audio',
        'peace2074-offline-suras-v1',
        'quran-offline-recitation-quality',
      ]
      const saved: Record<string, string> = {}
      criticalKeys.forEach((key) => {
        const val = window.localStorage.getItem(key)
        if (val !== null) saved[key] = val
      })
      window.localStorage.clear()
      Object.entries(saved).forEach(([key, val]) => {
        window.localStorage.setItem(key, val)
      })
      console.log('[Settings] Cleared localStorage (critical settings preserved)')
    }

    // 4. Clear sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear()
    }
  } catch (err) {
    console.error('[Settings] Error during cache clear:', err)
  }

  // 5. Hard reload — bypasses HTTP cache, fetches fresh from server
  window.location.reload()
}
</script>

<template>
  <q-page class="q-pa-md settings-page">
    <component
      :is="isNativeRuntime() ? 'div' : 'q-pull-to-refresh'"
      @refresh="onPullRefresh"
    >
      <div class="page-header q-mb-md">
        <h1 class="text-h4 q-mb-xs">{{ t('pages.settings.title') }}</h1>
        <div class="text-subtitle2 page-subtitle">
          {{ t('pages.settings.subtitle') }}
        </div>
      </div>

      <div class="grid">
        <q-card class="glassy-card">
          <q-card-section class="q-gutter-md">
            <div class="text-h6 q-mb-sm">
              {{ t('pages.settings.display.title') }}
            </div>
            <div class="text-body2 section-desc q-mb-md">
              {{ t('pages.settings.display.desc') }}
            </div>
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t('pages.settings.display.compact') }}
                </div>
                <div class="text-caption setting-hint">
                  {{ t('pages.settings.display.compactHint') }}
                </div>
              </div>
              <q-toggle
                v-model="compactLayout"
                color="primary"
                :aria-label="t('pages.settings.display.compact')"
              />
            </div>
            <q-separator spaced />
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t('pages.settings.display.motion') }}
                </div>
                <div class="text-caption setting-hint">
                  {{ t('pages.settings.display.motionHint') }}
                </div>
              </div>
              <q-toggle
                v-model="reduceMotion"
                color="primary"
                :aria-label="t('pages.settings.display.motion')"
              />
            </div>
            <q-separator spaced />
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t('pages.settings.display.darkMode') }}
                </div>
                <div class="text-caption setting-hint">
                  {{ t('pages.settings.display.darkModeHint') }}
                </div>
              </div>
              <q-toggle
                v-model="darkMode"
                color="primary"
                :aria-label="t('pages.settings.display.darkMode')"
              />
            </div>
            <q-separator spaced />
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t('pages.settings.display.translation') }}
                </div>
                <div class="text-caption setting-hint">
                  {{ t('pages.settings.display.translationHint') }}
                </div>
              </div>
              <q-toggle
                v-model="showQuranTranslation"
                color="primary"
                :aria-label="t('pages.settings.display.translation')"
              />
            </div>
            <div
              v-if="showQuranTranslation && translatorOptions.length > 0"
              class="setting-row q-mt-sm"
            >
              <div style="flex: 1">
                <div class="text-subtitle1">
                  {{ t('pages.settings.display.translator') }}
                </div>
                <div class="text-caption setting-hint">
                  {{ t('pages.settings.display.translatorHint') }}
                </div>
                <q-select
                  v-model="translatorModel"
                  :options="translatorOptions"
                  emit-value
                  map-options
                  dense
                  outlined
                  color="primary"
                  class="q-mt-sm"
                  style="max-width: 320px"
                  :aria-label="t('pages.settings.display.translator')"
                />
              </div>
            </div>
            <q-separator spaced />
            <div class="setting-row">
              <div style="flex: 1">
                <div class="text-subtitle1">
                  {{ t('pages.preferences.quran.highlightMode') }}
                </div>
                <div class="text-caption setting-hint">
                  {{ t('pages.preferences.quran.hint') }}
                </div>
                <q-btn-toggle
                  v-model="selectedHighlightMode"
                  class="q-mt-sm"
                  :options="[
                    {
                      label: t('pages.preferences.quran.highlightWord'),
                      value: 'word',
                    },
                    {
                      label: t('pages.preferences.quran.highlightSentence'),
                      value: 'ayah',
                    },
                  ]"
                  color="primary"
                  toggle-color="primary"
                  unelevated
                  outline
                />
              </div>
            </div>
            <q-separator spaced />
            <!-- Cursor trail diamonds count -->
            <div class="setting-row" style="align-items: flex-start; flex-direction: column; gap: 0.5rem">
              <div style="width: 100%">
                <div class="text-subtitle1" style="display:flex; align-items:center; gap: 0.5rem">
                  💎 Cursor Trail Diamonds
                  <q-badge color="primary" outline style="font-size:0.9rem; padding: 2px 8px">{{ cursorTrailCount === 0 ? 'Off' : cursorTrailCount }}</q-badge>
                </div>
                <div class="text-caption setting-hint">Number of floating diamonds following your cursor (0 = disabled)</div>
              </div>
              <q-slider
                v-model="cursorTrailCount"
                :min="0"
                :max="80"
                :step="5"
                color="primary"
                label
                :label-value="cursorTrailCount === 0 ? 'Off' : cursorTrailCount"
                style="width: 100%; padding: 0 8px"
                :markers="20"
                snap
              />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="glassy-card">
          <q-card-section class="q-gutter-md">
            <div class="text-h6 q-mb-sm">
              {{ t('pages.settings.accessibility.title') }}
            </div>
            <div class="text-body2 section-desc q-mb-md">
              {{ t('pages.settings.accessibility.desc') }}
            </div>
            <div class="setting-row">
              <div class="q-mb-sm" style="flex: 1">
                <div class="text-subtitle1">
                  {{ t('pages.settings.accessibility.fontSize') }}
                </div>
                <div class="text-caption setting-hint">
                  {{ t('pages.settings.accessibility.fontSizeHint') }}
                </div>
              </div>
            </div>
            <q-slider
              v-model="fontSize"
              :min="0"
              :max="3"
              :step="1"
              snap
              markers
              label
              color="primary"
              :label-value="
                t(`pages.settings.accessibility.fontSizes.${fontSize}`)
              "
              class="q-mb-md"
            />
            <q-separator spaced />
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t('pages.settings.accessibility.highContrast') }}
                </div>
                <div class="text-caption setting-hint">
                  {{ t('pages.settings.accessibility.highContrastHint') }}
                </div>
              </div>
              <q-toggle
                v-model="highContrast"
                color="primary"
                :aria-label="t('pages.settings.accessibility.highContrast')"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="glassy-card">
          <q-card-section class="q-gutter-md">
            <div class="text-h6 q-mb-sm">
              {{ t('pages.settings.navigation.title') }}
            </div>
            <div class="text-body2 section-desc q-mb-md">
              {{ t('pages.settings.navigation.desc') }}
            </div>
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t('pages.settings.navigation.enableOrdering') }}
                </div>
                <div class="text-caption setting-hint">
                  {{ t('pages.settings.navigation.enableOrderingHint') }}
                </div>
              </div>
              <q-toggle
                v-model="navOrderingEnabled"
                color="primary"
                :aria-label="t('pages.settings.navigation.enableOrdering')"
              />
            </div>
            <q-separator spaced />
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t('pages.settings.navigation.drawerDefault') }}
                </div>
                <div class="text-caption setting-hint">
                  {{ t('pages.settings.navigation.drawerDefaultHint') }}
                </div>
              </div>
              <q-toggle
                v-model="drawerOpenByDefault"
                color="primary"
                :aria-label="t('pages.settings.navigation.drawerDefault')"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="glassy-card">
          <q-card-section class="q-gutter-md">
            <div class="text-h6 q-mb-sm">
              {{ t('pages.settings.notifications.title') }}
            </div>
            <div class="text-body2 section-desc q-mb-md">
              {{ t('pages.settings.notifications.desc') }}
            </div>
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t('pages.settings.notifications.enable') }}
                </div>
                <div class="text-caption setting-hint">
                  {{ t('pages.settings.notifications.enableHint') }}
                </div>
              </div>
              <q-toggle
                v-model="enableNotifications"
                color="primary"
                :aria-label="t('pages.settings.notifications.enable')"
              />
            </div>
            <q-banner
              dense
              rounded
              class="q-mt-md hint-banner settings-status-banner"
              :class="{ 'is-enabled': enableNotifications }"
            >
              {{
                enableNotifications
                  ? t('pages.settings.notifications.enabled')
                  : t('pages.settings.notifications.enableHint')
              }}
            </q-banner>
          </q-card-section>
        </q-card>

        <q-card class="glassy-card">
          <q-card-section class="q-gutter-md">
            <div class="text-h6 q-mb-sm">
              {{ t('pages.settings.audio.title') }}
            </div>
            <div class="text-body2 section-desc q-mb-md">
              {{ t('pages.settings.audio.desc') }}
            </div>
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t('pages.settings.audio.autoPlay') }}
                </div>
                <div class="text-caption setting-hint">
                  {{ t('pages.settings.audio.autoPlayHint') }}
                </div>
              </div>
              <q-toggle
                v-model="autoPlayAthan"
                color="primary"
                :aria-label="t('pages.settings.audio.autoPlay')"
              />
            </div>
            <q-separator spaced />
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t('pages.settings.audio.autoPlayPrayerTimes') }}
                </div>
                <div class="text-caption setting-hint">
                  {{ t('pages.settings.audio.autoPlayPrayerTimesHint') }}
                </div>
              </div>
              <q-toggle
                v-model="autoPlayPrayerTimes"
                color="primary"
                :aria-label="t('pages.settings.audio.autoPlayPrayerTimes')"
              />
            </div>
            <q-separator spaced />
            <!-- Athan Reciter Selection -->
            <div>
              <div class="text-subtitle1 q-mb-xs">Athan Reciter</div>
              <div class="text-caption setting-hint q-mb-sm">
                Choose your preferred Athan voice. Click ▶ to preview.
              </div>
              <div class="row items-center q-gutter-sm no-wrap">
                <q-select
                  :model-value="selectedReciterId"
                  :options="reciterOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  outlined
                  dense
                  class="col"
                  label="Reciter"
                  aria-label="Select Athan reciter"
                  @update:model-value="onReciterChange"
                >
                  <template #option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption class="text-right" style="direction:rtl">{{ scope.opt.sublabel }}</q-item-label>
                      </q-item-section>
                      <q-item-section side v-if="scope.opt.value === selectedReciterId">
                        <q-icon name="check" color="primary" />
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-btn
                  :icon="athanIsPlaying ? 'stop' : 'play_arrow'"
                  :loading="athanIsLoading"
                  :color="athanIsPlaying ? 'negative' : 'primary'"
                  round
                  unelevated
                  size="md"
                  :aria-label="athanIsPlaying ? 'Stop preview' : 'Preview athan'"
                  @click="toggleAthanPreview"
                />
              </div>
              <div v-if="selectedReciter" class="text-caption q-mt-xs text-right" style="direction:rtl">
                {{ selectedReciter.nameAr }}
              </div>
            </div>
            <q-separator spaced />
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t('offline.title') }}
                </div>
                <div class="text-caption setting-hint">
                  {{ t('offline.subtitle') }}
                </div>
              </div>
              <q-btn
                color="primary"
                outline
                icon="download"
                :label="t('offline.title')"
                @click="showOfflineRecitationManager = true"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="glassy-card">
          <q-card-section class="q-gutter-sm">
            <div class="text-h6 q-mb-sm">
              {{ t('pages.settings.refresh.title') }}
            </div>
            <div class="text-body2 section-desc">
              {{ t('pages.settings.refresh.desc') }}
            </div>
            <q-btn
              color="primary"
              unelevated
              :label="t('button.reload')"
              @click="reloadApp"
            />
          </q-card-section>
        </q-card>
      </div>

      <q-dialog v-model="showOfflineRecitationManager" maximized>
        <OfflineRecitationManager
          @close="showOfflineRecitationManager = false"
        />
      </q-dialog>
    </component>
  </q-page>
</template>

<style scoped>
.settings-page {
  max-width: 1100px;
  margin: 0 auto;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.page-subtitle {
  color: #5f6b7a;
}

.section-desc {
  color: #5f6b7a;
}

.setting-hint {
  color: #64748b;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.glassy-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  color: #1f2937;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

.hint-banner {
  background: rgba(148, 163, 184, 0.12);
  color: #475569;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.settings-status-banner.is-enabled {
  background: rgba(22, 163, 74, 0.12);
  color: #166534;
  border-color: rgba(22, 163, 74, 0.24);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

:global(body.body--dark) .settings-page .page-subtitle,
:global(body.body--dark) .settings-page .section-desc,
:global(body.body--dark) .settings-page .setting-hint {
  color: rgba(255, 255, 255, 0.76) !important;
}

:global(body.body--dark) .settings-page {
  background: #000;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
}

:global(body.body--dark) .settings-page .text-h4,
:global(body.body--dark) .settings-page .text-h6,
:global(body.body--dark) .settings-page .text-subtitle1,
:global(body.body--dark) .settings-page .text-body2,
:global(body.body--dark) .settings-page .text-caption {
  color: inherit;
}

:global(body.body--dark) .settings-page .glassy-card {
  background: rgba(5, 5, 5, 0.96);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.58);
  color: #fff;
}

:global(body.body--dark) .settings-page .hint-banner {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.12);
}

:global(body.body--dark) .settings-page .settings-status-banner.is-enabled {
  background: rgba(34, 197, 94, 0.18);
  color: #dcfce7;
  border-color: rgba(34, 197, 94, 0.28);
}

:global(body.body--dark) .settings-page :deep(.q-separator) {
  background: rgba(255, 255, 255, 0.12);
}
</style>

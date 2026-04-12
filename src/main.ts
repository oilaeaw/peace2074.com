import { createApp, watch } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import App from './App.vue'
import router from '@/router'
import { initFaLibrary, FontAwesomeIcon } from '@/plugins/font-awesome'
import pinia from '@/plugins/pinia'
import i18n from './i18n'
import localeMessages from './locale'
import registerQuasar from '@/plugins/quasar'
import { useAuthStore } from '@/stores/auth.pinia'
import { Dark } from 'quasar'
import { useLocalStorage } from '@/composables/useUStore'
import '@/assets/app.scss'

const isClient = typeof window !== 'undefined'

type MainImportMeta = ImportMeta & {
  readonly env: {
    VITE_NITRO_BASE?: string
  }
}

type ThemeMode = 'system' | 'light' | 'dark'
type ThemeModeChangedDetail = {
  mode?: ThemeMode
}
type RouteMetaKey = 'title' | 'titleKey'
type GtagParams = Record<string, string | number | boolean | undefined>
type GtagFunction = (
  command: 'event',
  eventName: string,
  params?: GtagParams
) => void
type AppLocale = keyof typeof localeMessages

const env = (import.meta as MainImportMeta).env
const localStore = useLocalStorage()
const THEME_MODE_KEY = 'pref-theme-mode'
const DEFAULT_NITRO_PORT = 3000
const DEFAULT_MOBILE_API_BASE = 'https://peace2074.com/api'
const AVAILABLE_LOCALES = Object.keys(localeMessages) as AppLocale[]
let themeMediaQuery: MediaQueryList | null = null

const app = createApp(App)

initFaLibrary()
app.use(pinia)
app.use(router)
app.use(i18n)

// Register Quasar via centralized plugin
registerQuasar(app)

function computeNitroBase() {
  if (!isClient) return '/api'

  const { protocol, hostname } = window.location
  const configured = env.VITE_NITRO_BASE

  if (configured && typeof configured === 'string') {
    return configured.replace(/\/$/, '')
  }

  if (
    protocol === 'capacitor:' ||
    protocol === 'ionic:' ||
    protocol === 'app:'
  ) {
    return DEFAULT_MOBILE_API_BASE
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:${DEFAULT_NITRO_PORT}`
  }

  return '/api'
}

function resolveNitroUrl(path: string) {
  const base = computeNitroBase()
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

function isGoogleOAuthRecoveryUrl(url: URL) {
  return Boolean(
    url.searchParams.get('code') &&
    url.searchParams.get('state') &&
    url.searchParams.get('iss') === 'https://accounts.google.com'
  )
}

function forwardGoogleOAuthRedirectIfNeeded() {
  if (!isClient) return false

  const currentUrl = new URL(window.location.href)
  if (!isGoogleOAuthRecoveryUrl(currentUrl)) {
    return false
  }

  const callbackUrl = new URL(
    resolveNitroUrl('/auth/google/callback'),
    window.location.origin
  )
  callbackUrl.search = currentUrl.search
  window.location.replace(callbackUrl.toString())
  return true
}

async function bootstrapAuthState() {
  if (!isClient) return true
  if (forwardGoogleOAuthRedirectIfNeeded()) return false

  const authStore = useAuthStore()
  await authStore.hydrateSession()

  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/'
  if (currentPath === '/dashboard') {
    await router.replace('/')
  }

  return true
}

function applyThemeMode(mode: ThemeMode) {
  if (!isClient) return
  if (mode === 'system') {
    if (!themeMediaQuery && 'matchMedia' in window) {
      themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      themeMediaQuery.addEventListener('change', (event) => {
        const storedMode = localStore.get<ThemeMode>(THEME_MODE_KEY, 'system')
        if (storedMode === 'system') {
          Dark.set(event.matches)
        }
      })
    }
    // Default to light mode instead of system preference
    Dark.set(false)
    return
  }
  Dark.set(mode === 'dark')
}

// Initialize theme mode (system/light/dark) with fallback to legacy dark toggle
if (isClient) {
  const storedMode = localStore.get<ThemeMode>(THEME_MODE_KEY, 'light')
  if (storedMode && storedMode !== 'system') {
    applyThemeMode(storedMode)
  } else {
    // Always default to light mode
    Dark.set(false)
  }
  window.addEventListener('theme-mode-changed', (event: Event) => {
    const detail = (event as CustomEvent<ThemeModeChangedDetail>).detail
    const mode = detail?.mode || 'system'
    applyThemeMode(mode)
  })
}

const LOCALE_STORAGE_KEY = 'app-locale'
const DEFAULT_LOCALE: AppLocale = 'en'

function getAvailableLocales(): AppLocale[] {
  return [...AVAILABLE_LOCALES]
}

function normalizeLocale(
  localeValue: string | null | undefined,
  availableLocales: AppLocale[]
): AppLocale | null {
  if (!localeValue) return null

  const normalized = String(localeValue).trim().toLowerCase().replace('_', '-')
  if (!normalized) return null

  // Legacy language codes used by some browsers
  const legacyMap: Record<string, string> = {
    iw: 'he',
    in: 'id',
    ji: 'yi',
  }

  const normalizedBase = normalized.split('-')[0]
  const mapped = legacyMap[normalizedBase] || normalizedBase
  return availableLocales.includes(mapped as AppLocale)
    ? (mapped as AppLocale)
    : null
}

function persistLocale(localeValue: AppLocale) {
  if (!isClient || !localeValue) return
  try {
    window.localStorage?.setItem(LOCALE_STORAGE_KEY, localeValue)
  } catch {
    /* noop */
  }
}

function resolveInitialLocale(): AppLocale {
  if (!isClient) return DEFAULT_LOCALE
  try {
    const availableLocales = getAvailableLocales()
    const persisted = window.localStorage?.getItem(LOCALE_STORAGE_KEY)
    const normalizedPersisted = normalizeLocale(persisted, availableLocales)
    if (normalizedPersisted) {
      return normalizedPersisted
    }

    const preferredLanguages = window.navigator.languages
    const preferredList = preferredLanguages.length
      ? preferredLanguages
      : [window.navigator.language]

    for (const lang of preferredList) {
      const normalized = normalizeLocale(lang, availableLocales)
      if (normalized) {
        return normalized
      }
    }
  } catch {
    /* noop */
  }
  return DEFAULT_LOCALE
}

const targetLocale = resolveInitialLocale()
const globalLocale = i18n.global.locale

globalLocale.value = targetLocale
persistLocale(targetLocale)

function applyDirFromLocale(localeValue: string) {
  if (!isClient) return
  const normalizedLocale = (localeValue || DEFAULT_LOCALE)
    .split('-')[0]
    .toLowerCase()
  const rtl = ['ar', 'he'].includes(normalizedLocale)
  document.documentElement.setAttribute('lang', normalizedLocale)
  document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr')
  document.body.setAttribute('dir', rtl ? 'rtl' : 'ltr')
}

applyDirFromLocale(targetLocale)

app.component('FontAwesomeIcon', FontAwesomeIcon)

// Dynamic document.title from route meta and i18n
function getStringRouteMeta(
  to: RouteLocationNormalizedLoaded,
  key: RouteMetaKey
) {
  const value = to.meta[key]
  return typeof value === 'string' ? value : undefined
}

function updateTitleForRoute(to: RouteLocationNormalizedLoaded) {
  const base = 'PEACE2074'
  const metaTitle = getStringRouteMeta(to, 'title')
  const titleKey = getStringRouteMeta(to, 'titleKey')
  let title = base

  if (titleKey) {
    try {
      const translated = i18n.global.t(titleKey)
      if (translated && typeof translated === 'string') {
        title = `${translated} | ${base}`
      }
    } catch {
      /* noop */
    }
  } else if (metaTitle) {
    title = `${metaTitle} | ${base}`
  }
  document.title = title
}

const SEO_BASE_URL = 'https://peace2074.com'
const DEFAULT_DESCRIPTION =
  'Multi-language Islamic knowledge platform featuring Quran, Tasbeeh, and more'
const PAGEVIEW_DEDUPE_MS = 1200
let lastTrackedPageView = {
  key: '',
  at: 0,
}

function getGtag(): GtagFunction | null {
  if (!isClient) return null

  const gtagCandidate: unknown = window.gtag
  return typeof gtagCandidate === 'function'
    ? (gtagCandidate as GtagFunction)
    : null
}

function isQuranDetailPath(path: string): boolean {
  return /^\/quran\/\d+$/.test(path)
}

function trackPageViewForRoute(
  to: RouteLocationNormalizedLoaded,
  source: 'router_after_each' | 'router_ready'
) {
  if (!isClient) return

  const gtag = getGtag()
  if (!gtag) return

  const pagePath = `${to?.path || window.location.pathname}${window.location.search || ''}`
  // Quran detail pages emit richer, component-level page views with real sura names.
  if (isQuranDetailPath(to?.path || window.location.pathname)) return

  const pageTitle = document.title || 'PEACE2074'
  const dedupeKey = `${pagePath}|${pageTitle}`
  const now = Date.now()
  if (
    lastTrackedPageView.key === dedupeKey &&
    now - lastTrackedPageView.at < PAGEVIEW_DEDUPE_MS
  ) {
    return
  }

  lastTrackedPageView = { key: dedupeKey, at: now }

  gtag('event', 'page_view', {
    page_title: pageTitle,
    page_location: window.location.href,
    page_path: pagePath,
    source,
  })
}

function upsertMetaTag(
  attr: 'name' | 'property',
  key: string,
  content: string
) {
  if (!isClient || !content) return
  const selector = `meta[${attr}="${key}"]`
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  if (!isClient || !href) return
  let link = document.head.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }

  link.setAttribute('href', href)
}

function resolveCanonical(to: RouteLocationNormalizedLoaded): string {
  const path = (to.fullPath || to.path || '/').split('#')[0].split('?')[0]
  const normalizedPath =
    path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
  return `${SEO_BASE_URL}${normalizedPath || '/'}`
}

function updateSeoMetaForRoute(to: RouteLocationNormalizedLoaded) {
  const currentTitle = document.title || 'PEACE2074'
  const canonical = resolveCanonical(to)
  const section = currentTitle.replace(/\s*\|\s*PEACE2074\s*$/i, '').trim()
  const description =
    section && section !== 'PEACE2074'
      ? `${section} on PEACE2074 — ${DEFAULT_DESCRIPTION}`
      : DEFAULT_DESCRIPTION

  upsertMetaTag('name', 'description', description)
  upsertMetaTag('name', 'robots', 'index,follow,max-image-preview:large')
  upsertMetaTag(
    'name',
    'googlebot',
    'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
  )
  upsertMetaTag(
    'name',
    'bingbot',
    'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
  )
  upsertMetaTag('property', 'og:type', 'website')
  upsertMetaTag('property', 'og:site_name', 'PEACE2074')
  upsertMetaTag('property', 'og:title', currentTitle)
  upsertMetaTag('property', 'og:description', description)
  upsertMetaTag('property', 'og:url', canonical)
  upsertMetaTag(
    'property',
    'og:image',
    `${SEO_BASE_URL}/android-chrome-512x512.png`
  )
  upsertMetaTag('property', 'og:image:alt', 'PEACE2074 logo')
  upsertMetaTag('name', 'twitter:card', 'summary_large_image')
  upsertMetaTag('name', 'twitter:title', currentTitle)
  upsertMetaTag('name', 'twitter:description', description)
  upsertMetaTag(
    'name',
    'twitter:image',
    `${SEO_BASE_URL}/android-chrome-512x512.png`
  )
  upsertCanonical(canonical)
}

router.afterEach((to) => {
  updateTitleForRoute(to)
  updateSeoMetaForRoute(to)
  trackPageViewForRoute(to, 'router_after_each')
})

router.isReady().then(() => {
  updateTitleForRoute(router.currentRoute.value)
  updateSeoMetaForRoute(router.currentRoute.value)
  trackPageViewForRoute(router.currentRoute.value, 'router_ready')
})

// Update title immediately on locale change
watch(globalLocale, () => {
  const normalized =
    normalizeLocale(globalLocale.value, getAvailableLocales()) || DEFAULT_LOCALE

  if (normalized !== globalLocale.value) {
    globalLocale.value = normalized
    return
  }

  persistLocale(normalized)
  updateTitleForRoute(router.currentRoute.value)
  updateSeoMetaForRoute(router.currentRoute.value)
  applyDirFromLocale(normalized)
})

// Register PWA Service Worker and prompt user to refresh when update is available
if (isClient && 'serviceWorker' in navigator && import.meta.env.PROD) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      const updateSW = registerSW({
        immediate: true,
        onOfflineReady() {
          import('quasar').then(({ Notify }) => {
            Notify.create({
              message: i18n.global.t('general.offline_ready'),
              color: 'positive',
              icon: 'cloud_done',
              timeout: 3000,
              position: 'top',
            })
          })
        },
        onNeedRefresh() {
          // Notify user that an update is available
          import('quasar').then(({ Notify }) => {
            Notify.create({
              message: i18n.global.t('general.updateAvailable'),
              color: 'primary',
              icon: 'refresh',
              timeout: 0, // Don't auto-dismiss
              position: 'top',
              actions: [
                {
                  label: i18n.global.t('general.update'),
                  color: 'white',
                  handler: () => {
                    updateSW(true) // Reload and activate new service worker
                  },
                },
                {
                  label: i18n.global.t('general.later'),
                  color: 'white',
                  flat: true,
                },
              ],
            })
          })
        },
        onRegisterError(error: unknown) {
          console.error('PWA service worker registration failed', error)
        },
      })
    })
    .catch((e) => {
      console.warn('PWA registration skipped', e)
    })
}

// Netlify Identity has been replaced with custom OAuth (Google/Apple).
// See: apps/nitro-api/server/routes/auth/*

// Mount the app once (removed duplicate mounts)
void bootstrapAuthState().then((shouldMount) => {
  if (shouldMount) {
    app.mount('#app')
  }
})

import { createApp, watch, nextTick } from 'vue'
import App from './App.vue'
import router from '@/router'
import { initFaLibrary, FontAwesomeIcon } from '@/plugins/font-awesome'
import pinia from '@/plugins/pinia'
import i18n from './i18n'
import registerQuasar from '@/plugins/quasar'
import { useAuthStore } from '@/stores/auth.pinia'
import { Dark } from 'quasar'
import { useLocalStorage } from '@/composables/useUStore'
import '@/assets/app.scss'

const isClient = typeof window !== 'undefined'
const env = (import.meta as ImportMeta & { env?: { VITE_NITRO_BASE?: string } }).env || {}
const localStore = useLocalStorage()
const THEME_MODE_KEY = 'pref-theme-mode'
const DARK_MODE_KEY = 'pref-dark-mode'
const DEFAULT_NITRO_PORT = 3000
const DEFAULT_MOBILE_API_BASE = 'https://peace2074.com/api'
type ThemeMode = 'system' | 'light' | 'dark'
let themeMediaQuery: MediaQueryList | null = null

const app = createApp(App)

initFaLibrary()
app.use(pinia)
app.use(router)
app.use(i18n)

// Register Quasar via centralized plugin
registerQuasar(app as any)

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
  window.addEventListener('theme-mode-changed', ((event: Event) => {
    const detail = (event as CustomEvent).detail || {}
    const mode = (detail.mode as ThemeMode) || 'system'
    applyThemeMode(mode)
  }) as EventListener)
}

const LOCALE_STORAGE_KEY = 'app-locale'
const DEFAULT_LOCALE = 'en'

function getAvailableLocales(): string[] {
  try {
    const globalI18n: any = i18n.global as any

    if (
      Array.isArray(globalI18n?.availableLocales) &&
      globalI18n.availableLocales.length
    ) {
      return globalI18n.availableLocales.map((locale: string) =>
        String(locale).toLowerCase()
      )
    }

    const messages = globalI18n?.messages
    if (messages && typeof messages === 'object') {
      const keys = Object.keys(messages)
      if (keys.length) {
        return keys.map((locale: string) => String(locale).toLowerCase())
      }
    }
  } catch {
    /* noop */
  }
  return [DEFAULT_LOCALE]
}

function normalizeLocale(
  localeValue: string | null | undefined,
  availableLocales: string[]
): string | null {
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
  return availableLocales.includes(mapped) ? mapped : null
}

function persistLocale(localeValue: string) {
  if (!isClient || !localeValue) return
  try {
    window.localStorage?.setItem(LOCALE_STORAGE_KEY, localeValue)
  } catch {
    /* noop */
  }
}

function resolveInitialLocale(): string {
  if (!isClient) return DEFAULT_LOCALE
  try {
    const availableLocales = getAvailableLocales()
    const persisted = window.localStorage?.getItem(LOCALE_STORAGE_KEY)
    const normalizedPersisted = normalizeLocale(persisted, availableLocales)
    if (normalizedPersisted) {
      return normalizedPersisted
    }

    const preferredList =
      Array.isArray(window.navigator.languages) &&
        window.navigator.languages.length
        ? window.navigator.languages
        : [window.navigator.language]

    for (const lang of preferredList) {
      const normalized = normalizeLocale(lang, availableLocales)
      if (normalized) {
        return normalized
      }
    }
  } catch (e) {
    /* noop */
  }
  return DEFAULT_LOCALE
}

const targetLocale = resolveInitialLocale()
try {
  const globalLocale: any = i18n.global.locale
  if (
    globalLocale &&
    typeof globalLocale === 'object' &&
    'value' in globalLocale
  ) {
    globalLocale.value = targetLocale
  } else {
    ; (i18n.global as any).locale = targetLocale
  }
} catch {
  /* noop */
}
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
function updateTitleForRoute(to: any) {
  const base = 'PEACE2074'
  const metaTitle = (to.meta && (to.meta as any).title) as string | undefined
  const titleKey = (to.meta && (to.meta as any).titleKey) as string | undefined
  let title = base
  if (titleKey) {
    try {
      const translated = (i18n.global as any).t(titleKey)
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

function isQuranDetailPath(path: string): boolean {
  return /^\/quran\/\d+$/.test(path)
}

function trackPageViewForRoute(
  to: any,
  source: 'router_after_each' | 'router_ready'
) {
  if (!isClient) return
  const gtag = (window as any)?.gtag
  if (typeof gtag !== 'function') return

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

function resolveCanonical(to: any): string {
  const path = (to.fullPath || to.path || '/').split('#')[0].split('?')[0]
  const normalizedPath =
    path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
  return `${SEO_BASE_URL}${normalizedPath || '/'}`
}

function updateSeoMetaForRoute(to: any) {
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
try {
  const localeRef: any = (i18n.global as any).locale
  if (localeRef && typeof localeRef === 'object' && 'value' in localeRef) {
    watch(localeRef, () => {
      const normalized =
        normalizeLocale(localeRef.value, getAvailableLocales()) ||
        DEFAULT_LOCALE
      if (normalized !== localeRef.value) {
        localeRef.value = normalized
      }
      persistLocale(normalized)
      updateTitleForRoute(router.currentRoute.value)
      updateSeoMetaForRoute(router.currentRoute.value)
      applyDirFromLocale(normalized)
    })
  }
} catch (e) {
  /* noop */
}

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

// Initialize Netlify Identity after DOM is ready
if (isClient) {
  const getPostLoginPath = () => {
    const redirect = String(
      router.currentRoute.value?.query?.redirect || ''
    ).trim()
    if (
      redirect.startsWith('/') &&
      !redirect.startsWith('//') &&
      redirect !== '/login' &&
      redirect !== '/signup'
    ) {
      return redirect
    }

    if (window.document?.referrer) {
      try {
        const ref = new URL(window.document.referrer)
        if (ref.origin === window.location.origin) {
          const refPath = `${ref.pathname}${ref.search}${ref.hash}`
          if (
            refPath.startsWith('/') &&
            refPath !== '/login' &&
            refPath !== '/signup'
          ) {
            return refPath
          }
        }
      } catch {
        /* noop */
      }
    }

    return '/'
  }

  // NOTE: Netlify Identity has been replaced with custom OAuth (Google/Apple)
  // See: apps/nitro-api/server/routes/auth/*
  // If you need to re-enable Netlify Identity, uncomment the code below
  // and disable the custom OAuth routes.
  /*
  const initNetlifyIdentity = () => {
    import('netlify-identity-widget').then(({ default: netlifyIdentity }) => {
      netlifyIdentity.init()
      // Modal will be injected into document.body by default

      // Sync auth state with Pinia store
      netlifyIdentity.on('init', (user: any) => {
        if (user) {
          const authStore = (pinia as any)._s.get('auth')
          if (authStore) {
            authStore.setUser({
              id: user.id,
              email: user.email,
              username: user.user_metadata?.full_name || user.email?.split('@')[0],
              role: user.app_metadata?.roles?.[0] || 'user',
              first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
              last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || ''
            })
          }
        }
      })

      netlifyIdentity.on('login', (user: any) => {
        const authStore = (pinia as any)._s.get('auth')
        if (authStore && user) {
          authStore.setUser({
            id: user.id,
            email: user.email,
            username: user.user_metadata?.full_name || user.email?.split('@')[0],
            role: user.app_metadata?.roles?.[0] || 'user',
            first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
            last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || ''
          })
        }
        router.push(getPostLoginPath())
        netlifyIdentity.close()
      })

      netlifyIdentity.on('logout', () => {
        const authStore = (pinia as any)._s.get('auth')
        if (authStore) {
          authStore.logout()
        }
      })
    }).catch((error) => {
      console.warn('Netlify Identity initialization skipped', error)
    })
  }

  // Call after app mount to ensure DOM is ready
  app.mount("#app")

  // Defer non-critical auth widget init to idle time to reduce startup work.
  nextTick(() => {
    const schedule = (window as any).requestIdleCallback as
      | ((cb: () => void, options?: { timeout: number }) => number)
      | undefined

    if (typeof schedule === 'function') {
      schedule(() => initNetlifyIdentity(), { timeout: 2500 })
    } else {
      window.setTimeout(() => initNetlifyIdentity(), 2000)
    }
  })
  */

  // Custom OAuth is now active - no need for Netlify Identity widget
}

// Mount the app once (removed duplicate mounts)
void bootstrapAuthState().then((shouldMount) => {
  if (shouldMount) {
    app.mount('#app')
  }
})

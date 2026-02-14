import { createApp, watch, nextTick } from "vue";
import App from "./App.vue";
import router from "@/router";
import { initFaLibrary, FontAwesomeIcon } from "@/plugins/font-awesome";
import pinia from "@/plugins/pinia";
import i18n from "./i18n";
import registerQuasar from '@/plugins/quasar'
import netlifyIdentity from 'netlify-identity-widget'
import { Dark } from 'quasar'
import { useLocalStorage } from '@/composables/useUStore'
import '@/assets/app.scss'

const isClient = typeof window !== 'undefined'
const localStore = useLocalStorage()
const THEME_MODE_KEY = 'pref-theme-mode'
const DARK_MODE_KEY = 'pref-dark-mode'
type ThemeMode = 'system' | 'light' | 'dark'
let themeMediaQuery: MediaQueryList | null = null

const app = createApp(App);

initFaLibrary();

app.use(pinia);
app.use(router);
app.use(i18n);

// Register Quasar via centralized plugin
registerQuasar(app as any);

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

function resolveInitialLocale(): string {
  if (!isClient) return 'en'
  try {
    const availableLocales = Object.keys((i18n.global as any).messages || {})
    const persisted = window.localStorage?.getItem(LOCALE_STORAGE_KEY)
    if (persisted && availableLocales.includes(persisted)) {
      return persisted
    }
    const preferredList = Array.isArray(window.navigator.languages) && window.navigator.languages.length
      ? window.navigator.languages
      : [window.navigator.language]
    for (const lang of preferredList) {
      const normalized = lang?.toLowerCase()?.split('-')[0]
      if (normalized && availableLocales.includes(normalized)) {
        return normalized
      }
    }
  } catch (e) {
    /* noop */
  }
  return 'en'
}

const targetLocale = resolveInitialLocale()
try {
  const globalLocale: any = i18n.global.locale
  if (globalLocale && typeof globalLocale === 'object' && 'value' in globalLocale) {
    globalLocale.value = targetLocale
  } else {
    (i18n.global as any).locale = targetLocale
  }
} catch {
  /* noop */
}

function applyDirFromLocale(localeValue: string) {
  if (!isClient) return
  const rtl = ['ar', 'he'].includes((localeValue || '').split('-')[0].toLowerCase())
  document.documentElement.setAttribute('lang', (localeValue || 'en').split('-')[0].toLowerCase())
  document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr')
  document.body.setAttribute('dir', rtl ? 'rtl' : 'ltr')
}

applyDirFromLocale(targetLocale)

app.component("FontAwesomeIcon", FontAwesomeIcon);

// Dynamic document.title from route meta and i18n
function updateTitleForRoute(to: any) {
  const base = "PEACE2074";
  const metaTitle = (to.meta && (to.meta as any).title) as string | undefined;
  const titleKey = (to.meta && (to.meta as any).titleKey) as string | undefined;
  let title = base;
  if (titleKey) {
    try {
      const translated = (i18n.global as any).t(titleKey);
      if (translated && typeof translated === "string") {
        title = `${translated} | ${base}`;
      }
    } catch {
      /* noop */
    }
  } else if (metaTitle) {
    title = `${metaTitle} | ${base}`;
  }
  document.title = title;
}

const SEO_BASE_URL = 'https://peace2074.com'
const DEFAULT_DESCRIPTION = 'Multi-language Islamic knowledge platform featuring Quran, Tasbeeh, and more'

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string) {
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
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

function resolveCanonical(to: any): string {
  const path = (to.fullPath || to.path || '/').split('#')[0].split('?')[0]
  const normalizedPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
  return `${SEO_BASE_URL}${normalizedPath || '/'}`
}

function updateSeoMetaForRoute(to: any) {
  const currentTitle = document.title || 'PEACE2074'
  const canonical = resolveCanonical(to)
  const section = currentTitle.replace(/\s*\|\s*PEACE2074\s*$/i, '').trim()
  const description = section && section !== 'PEACE2074'
    ? `${section} on PEACE2074 — ${DEFAULT_DESCRIPTION}`
    : DEFAULT_DESCRIPTION

  upsertMetaTag('name', 'description', description)
  upsertMetaTag('name', 'robots', 'index,follow,max-image-preview:large')
  upsertMetaTag('property', 'og:type', 'website')
  upsertMetaTag('property', 'og:site_name', 'PEACE2074')
  upsertMetaTag('property', 'og:title', currentTitle)
  upsertMetaTag('property', 'og:description', description)
  upsertMetaTag('property', 'og:url', canonical)
  upsertMetaTag('property', 'og:image', `${SEO_BASE_URL}/android-chrome-512x512.png`)
  upsertMetaTag('property', 'og:image:alt', 'PEACE2074 logo')
  upsertMetaTag('name', 'twitter:card', 'summary_large_image')
  upsertMetaTag('name', 'twitter:title', currentTitle)
  upsertMetaTag('name', 'twitter:description', description)
  upsertMetaTag('name', 'twitter:image', `${SEO_BASE_URL}/android-chrome-512x512.png`)
  upsertCanonical(canonical)
}

router.afterEach((to) => {
  updateTitleForRoute(to)
  updateSeoMetaForRoute(to)
});

updateTitleForRoute(router.currentRoute.value)
updateSeoMetaForRoute(router.currentRoute.value)

// Update title immediately on locale change
try {
  const localeRef: any = (i18n.global as any).locale;
  if (localeRef && typeof localeRef === 'object' && 'value' in localeRef) {
    watch(localeRef, () => {
      updateTitleForRoute(router.currentRoute.value);
      updateSeoMetaForRoute(router.currentRoute.value)
      applyDirFromLocale(localeRef.value)
    });
  }
} catch (e) {
  /* noop */
}

// Register PWA Service Worker and force-refresh clients when a new build is available
if (isClient && 'serviceWorker' in navigator && import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        updateSW(true);
      },
      onRegisterError(error) {
        console.error('PWA service worker registration failed', error);
      },
    });
  }).catch(e => {
    console.warn('PWA registration skipped', e);
  });
}

// Initialize Netlify Identity after DOM is ready
if (isClient) {
  const initNetlifyIdentity = () => {
    netlifyIdentity.init()
    // Modal will be injected into document.body by default

    // Sync auth state with Pinia store
    netlifyIdentity.on('init', user => {
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

    netlifyIdentity.on('login', user => {
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
      netlifyIdentity.close()
    })

    netlifyIdentity.on('logout', () => {
      const authStore = (pinia as any)._s.get('auth')
      if (authStore) {
        authStore.logout()
      }
    })
  }

  // Call after app mount to ensure DOM is ready
  app.mount("#app")

  // Wait for Vue to finish rendering before initializing Netlify Identity
  nextTick(() => {
    if (initNetlifyIdentity) {
      initNetlifyIdentity()
    }
  })
} else {
  app.mount("#app")
}

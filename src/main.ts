import { createApp, watch } from "vue";
import App from "./App.vue";
import router from "@/router";
import { initFaLibrary, FontAwesomeIcon } from "@/plugins/font-awesome";
import pinia from "@/plugins/pinia";
import i18n from "./i18n";
import registerQuasar from '@/plugins/quasar'
import { registerSW } from "virtual:pwa-register";

const app = createApp(App);

initFaLibrary();

app.use(pinia);
app.use(router);
app.use(i18n);

const LOCALE_STORAGE_KEY = 'app-locale'

function resolveInitialLocale(): string {
  if (typeof window === 'undefined') return 'en'
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
  if (typeof document === 'undefined') return
  const rtl = ['ar', 'he'].includes((localeValue || '').split('-')[0].toLowerCase())
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

router.afterEach((to) => updateTitleForRoute(to));

// Update title immediately on locale change
try {
  const localeRef: any = (i18n.global as any).locale;
  if (localeRef && typeof localeRef === 'object' && 'value' in localeRef) {
    watch(localeRef, () => {
      updateTitleForRoute(router.currentRoute.value);
      applyDirFromLocale(localeRef.value)
    });
  }
} catch (e) {
  /* noop */
}

// Register Quasar via centralized plugin
registerQuasar(app as any);

// Register PWA Service Worker and force-refresh clients when a new build is available
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateSW(true);
    },
    onRegisterError(error) {
      console.error('PWA service worker registration failed', error);
    },
  });
}

app.mount("#app");

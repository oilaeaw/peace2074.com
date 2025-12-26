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

import type { RouteLocationNormalized } from 'vue-router'
import { createRouter, createWebHistory } from "vue-router";
import i18n from '@/i18n'
import { useAuthStore } from "@/stores/auth.pinia";
import {
  buildLocalePath,
  normalizeLocale,
  persistLocale,
} from '@/utils/locale-routing'
import { routes } from "./routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

function resolveRouteLocale(route: Pick<RouteLocationNormalized, 'params'>) {
  const rawLocale = Array.isArray(route.params.locale)
    ? route.params.locale[0]
    : route.params.locale

  return normalizeLocale(typeof rawLocale === 'string' ? rawLocale : null)
}

// Global navigation guard for authentication
router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();
  const routeLocale = resolveRouteLocale(to)
  const fromLocale = resolveRouteLocale(from)

  if (routeLocale) {
    if (i18n.global.locale.value !== routeLocale) {
      i18n.global.locale.value = routeLocale
    }
    persistLocale(routeLocale)
  } else if (fromLocale) {
    const localizedPath = buildLocalePath(to.path, fromLocale, {
      forcePrefix: true,
    })

    if (localizedPath !== to.path) {
      return {
        path: localizedPath,
        query: { ...from.query, ...to.query },
        hash: to.hash,
        replace: true,
      }
    }
  }

  // Preserve Quran query parameters across navigations and recover from Chrome trimming
  if (to.path.startsWith('/quran') && typeof window !== 'undefined') {
    let savedParams: Record<string, string> = {}
    try {
      const savedJson = sessionStorage.getItem('quran-url-params')
      if (savedJson) savedParams = JSON.parse(savedJson)
    } catch {
      /* noop */
    }

    const hasNewParams = Object.keys(to.query).length > 0
    if (hasNewParams) {
      sessionStorage.setItem('quran-url-params', JSON.stringify({ ...savedParams, ...to.query }))
    } else if (Object.keys(savedParams).length > 0) {
      return {
        path: to.path,
        query: { ...savedParams, ...from.query },
        hash: to.hash,
        replace: true,
      }
    }
  }

  const requiresAuth = Boolean(to.meta.requiresAuth)

  if (!authStore.hydrated) {
    if (requiresAuth) {
      await authStore.hydrateSession();
    } else {
      void authStore.hydrateSession();
    }
  }

  // Check if route requires authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    const loginPath = routeLocale || fromLocale
      ? buildLocalePath('/login', routeLocale || fromLocale, {
        forcePrefix: true,
      })
      : '/login'

    // Redirect to login with return path
    return { path: loginPath, query: { redirect: to.fullPath } };
  }

  return true;
});

export default router;

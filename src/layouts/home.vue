<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-avatar square size="32px" class="q-mr-sm">
          <img src="/logo.svg" alt="PEACE2074" class="app-logo" />
        </q-avatar>
        <q-toolbar-title>
          <RouterLink
            to="/"
            class="link"
            style="color: inherit; text-decoration: none; font-weight: 700"
          >
            {{ t('general.SiteTitle') }}
          </RouterLink>
        </q-toolbar-title>
        <q-space />
        <nav class="nav">
          <RouterLink to="/" class="link">
            <span>{{ t('appShell.nav.home') }}</span>
          </RouterLink>
          <RouterLink to="/quran" class="link">
            <span>{{ t('appShell.nav.quran') }}</span>
          </RouterLink>
          <div class="lang">
            <label for="lang" class="q-mr-xs"
              >{{ t('general.languages') }}:</label
            >
            <select id="lang" @change="onLangChange($event)" :value="locale">
              <option v-for="l in langs" :key="l.value" :value="l.value">
                {{ l.flag }} {{ t(`general.languageNames.${l.value}`) }}
              </option>
            </select>
          </div>
        </nav>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <RouterView />
    </q-page-container>

    <q-footer class="app-footer q-pa-sm">
      <div class="footer-inner">
        <div class="footer-brand">
          <img class="decor" src="/assets/decor-bottom.svg" alt="decor" />
          <span
            >© {{ currentYear }} {{ t('general.SiteTitle') }} · v{{
              appVersion
            }}</span
          >
        </div>
        <nav class="footer-links" aria-label="Footer links">
          <RouterLink to="/quran" class="footer-link">{{
            t('appShell.nav.quran')
          }}</RouterLink>
          <RouterLink to="/terms" class="footer-link">{{
            t('terms_and_conditions')
          }}</RouterLink>
          <RouterLink to="/privacy" class="footer-link">{{
            t('privacy_policy')
          }}</RouterLink>
          <RouterLink to="/contact" class="footer-link">{{
            t('appShell.nav.contact')
          }}</RouterLink>
        </nav>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  AVAILABLE_LOCALES,
  buildLocalePath,
  normalizeLocale,
  persistLocale,
} from '@/utils/locale-routing'

const { locale, t } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()

declare const __APP_VERSION__: string

const appVersionRaw = __APP_VERSION__ || '0.0.0'
const appVersion =
  appVersionRaw.split('.').length >= 2
    ? appVersionRaw.split('.').slice(0, 2).join('.')
    : appVersionRaw
const currentYear = new Date().getFullYear()

const languageCodes = AVAILABLE_LOCALES

const languageFlags: Record<string, string> = {
  en: '🇺🇸',
  ar: '🇸🇦',
  de: '🇩🇪',
  es: '🇪🇸',
  ru: '🇷🇺',
  he: '🇮🇱',
  it: '🇮🇹',
  tr: '🇹🇷',
}

const langs = computed(() => {
  locale.value
  return languageCodes.map((code) => ({
    value: code,
    label: `${languageFlags[code] || ''} ${t(`general.languageNames.${code}`)}`,
    flag: languageFlags[code],
  }))
})

function onLangChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  const normalized = normalizeLocale(val, languageCodes)
  if (!normalized) return

  locale.value = normalized
  persistLocale(normalized)

  void router
    .replace({
      path: buildLocalePath(route.path, normalized, { forcePrefix: true }),
      query: route.query,
      hash: route.hash,
    })
    .catch(() => {})
}
</script>

<style scoped>
.q-toolbar-title {
  font-weight: 700;
}
.nav {
  display: flex;
  gap: 8px;
  align-items: center;
}

.q-avatar__content {
  vertical-align: middle;
}
.link {
  text-decoration: none;
}
.lang select {
  padding: 4px 6px;
  border-radius: 6px;
}
.app-footer {
  background: rgba(9, 14, 27, 0.92);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.footer-links {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.footer-link {
  color: rgba(255, 255, 255, 0.78);
  text-decoration: none;
  font-size: 0.86rem;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #ffffff;
}
.decor {
  height: 16px;
  opacity: 0.6;
}
</style>

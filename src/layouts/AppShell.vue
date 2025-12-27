<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="app-header text-white">
      <q-toolbar class="app-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          color="white"
          @click="leftDrawer = !leftDrawer"
          aria-label="Toggle menu"
        />
        <q-avatar square size="36px" class="q-ml-sm brand-logo">
          <img src="/logo.svg" alt="PEACE2074" />
        </q-avatar>
        <q-toolbar-title>
          <RouterLink to="/" class="brand-link">{{ t('general.SiteTitle') }}</RouterLink>
        </q-toolbar-title>

        <q-input
          dense
          round
          dark
          :placeholder="t('appShell.searchPlaceholder')"
          class="search glassy-field"
          v-model="search"
          debounce="300"
        />

        <q-btn
          dense
          round
          color="primary"
          icon="volume_up"
          class="q-ml-md"
          @click="playAthan"
          :aria-label="t('appShell.playAthan')"
        />

        <q-select
          dense
          outlined
          dark
          :options="langs"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          v-model="localeValue"
          class="glassy-field"
          style="max-width:140px; margin-left:12px"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawer" show-if-above bordered>
      <q-list>
        <q-item clickable v-ripple to="/">
          <q-item-section>{{ t('appShell.nav.home') }}</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/quran">
          <q-item-section>{{ t('appShell.nav.quran') }}</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/tasbeeh">
          <q-item-section>{{ t('appShell.nav.tasbeeh') }}</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-ripple to="/contact">
          <q-item-section>{{ t('appShell.nav.contact') }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <RouterView />
    </q-page-container>

    <q-footer class="text-center q-pa-sm">
      <div class="footer">
        <img class="decor" src="/assets/decor-bottom.svg" alt="decor" />
        <span>© 2025 {{ t('general.SiteTitle') }}</span>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import athanSrc from '@/assets/audio/Athan.mp3'

const leftDrawer = ref(false)
const search = ref('')
const LOCALE_STORAGE_KEY = 'app-locale'
const { locale, t } = useI18n({ useScope: 'global' })
const localeValue = ref(locale.value)
const langs = [
  { label: 'English', value: 'en' },
  { label: 'العربية', value: 'ar' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Русский', value: 'ru' },
  { label: 'עברית', value: 'he' },
]

watch(localeValue, (v) => {
  if (!v || locale.value === v) return
  locale.value = v
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, v)
    } catch {}
  }
})

watch(locale, (v) => {
  if (!v || localeValue.value === v) return
  localeValue.value = v
})

// Global Athan player - accessible from every page via header button
const athanAudio = typeof Audio !== 'undefined' ? new Audio(athanSrc) : null

function playAthan () {
  if (!athanAudio) return
  try {
    athanAudio.currentTime = 0
    void athanAudio.play().catch(() => {})
  } catch {}
}
</script>

<style scoped>
.app-header {
  background: radial-gradient(circle at top, #1f2937, #0b1120 60%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.app-toolbar {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.brand-logo {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  padding: 4px;
}

.brand-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));
}

.brand-link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.search { max-width: 360px; margin-left: 12px; }

.glassy-field :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  color: #fff;
}

.glassy-field :deep(.q-field__native),
.glassy-field :deep(.q-field__input),
.glassy-field :deep(.q-field__marginal) {
  color: #fff;
}

.glassy-field :deep(.q-field__native::placeholder) {
  color: rgba(255, 255, 255, 0.65);
}

.footer { display:flex; align-items:center; justify-content:center; gap:8px }
.decor { height: 16px; opacity: 0.6 }
</style>
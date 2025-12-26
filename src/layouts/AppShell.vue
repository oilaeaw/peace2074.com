<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawer = !leftDrawer" aria-label="Toggle menu" />
        <q-avatar square size="36px" class="q-ml-sm">
          <img src="/logo.svg" alt="PEACE2074" />
        </q-avatar>
        <q-toolbar-title>
          <RouterLink to="/" class="brand-link">{{ t('general.SiteTitle') }}</RouterLink>
        </q-toolbar-title>

        <q-input
          dense
          round
          :placeholder="t('appShell.searchPlaceholder')"
          class="search"
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
          :options="langs"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          v-model="localeValue"
          style="max-width:120px; margin-left:12px"
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
.search { max-width: 360px; margin-left: 12px; }
.footer { display:flex; align-items:center; justify-content:center; gap:8px }
.decor { height: 16px; opacity: 0.6 }
.brand-link { color: inherit; text-decoration: none; font-weight: 600; }
</style>
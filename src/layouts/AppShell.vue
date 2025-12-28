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

        <div class="search-wrapper" ref="searchRef">
          <q-input
            dense
            round
            dark
            :placeholder="t('appShell.searchPlaceholder')"
            class="search glassy-field"
            v-model="search"
            debounce="300"
            clearable
            @clear="clearSearch"
            @focus="menuOpen = true"
            @keyup.esc="clearSearch"
          />
          <q-menu
            v-model="menuOpen"
            :fit="true"
            anchor="bottom left"
            self="top left"
            transition-show="jump-down"
            transition-hide="jump-up"
            :offset="[0, 6]"
            persistent
          >
            <q-list style="min-width: 320px; max-height: 320px" class="search-results">
              <q-item v-if="searchLoading">
                <q-item-section avatar>
                  <q-spinner color="primary" size="24px" />
                </q-item-section>
                <q-item-section>{{ t('general.fetchingUpdates') || 'Searching…' }}</q-item-section>
              </q-item>
              <q-item
                v-for="item in searchResults"
                :key="item.id"
                clickable
                v-ripple
                @click="goToResult(item)"
              >
                <q-item-section>
                  <div class="text-weight-medium">{{ item.title }}</div>
                  <div class="text-caption text-grey-5">{{ item.subtitle }}</div>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="primary" outline>{{ item.type === 'sura' ? 'Quran' : 'Page' }}</q-badge>
                </q-item-section>
              </q-item>
              <q-item v-if="!searchResults.length">
                <q-item-section>{{ search ? t('notfound') : t('appShell.searchPlaceholder') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <q-btn
          dense
          round
          color="primary"
          :icon="isAthanPlaying ? 'pause' : 'volume_up'"
          class="q-ml-md"
          @click="toggleAthan"
          :aria-label="isAthanPlaying ? t('appShell.pauseAthan') || t('appShell.playAthan') : t('appShell.playAthan')"
        />
        <q-btn
          v-if="isAthanPlaying"
          dense
          round
          color="negative"
          icon="stop"
          class="q-ml-sm"
          @click="stopAthan"
          :aria-label="t('appShell.stopAthan') || 'Stop Athan'"
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
        <q-item clickable v-ripple to="/chat">
          <q-item-section>{{ t('appShell.nav.chat') }}</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/support">
          <q-item-section>{{ t('appShell.nav.support') }}</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/settings">
          <q-item-section>{{ t('appShell.nav.settings') }}</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/preferences">
          <q-item-section>{{ t('appShell.nav.preferences') }}</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/login">
          <q-item-section>{{ t('appShell.nav.login') || 'Login' }}</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/blog">
          <q-item-section>{{ t('appShell.nav.blog') }}</q-item-section>
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

    <SupportAIWidget />

    <q-footer class="text-center q-pa-sm">
      <div class="footer">
        <img class="decor" src="/assets/decor-bottom.svg" alt="decor" />
        <span>© 2025 {{ t('general.SiteTitle') }} · v{{ appVersion }}</span>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAthanPlayer } from '@/composables/useAthanPlayer'
import { useSiteSearch } from '@/composables/useSiteSearch'
import SupportAIWidget from '@/components/common/SupportAIWidget.vue'

declare const __APP_VERSION__: string

const leftDrawer = ref(false)
const search = ref('')
const LOCALE_STORAGE_KEY = 'app-locale'
const { locale, t } = useI18n({ useScope: 'global' })
const localeValue = ref(locale.value)
const router = useRouter()
const langs = [
  { label: 'English', value: 'en' },
  { label: 'العربية', value: 'ar' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Русский', value: 'ru' },
  { label: 'עברית', value: 'he' },
]

const menuOpen = ref(false)
const searchRef = ref(null)
const { results: searchResults, loading: searchLoading, search: runSearch } = useSiteSearch(locale)

watch(search, (q) => {
  runSearch(q)
  menuOpen.value = !!q && (!!searchResults.value.length || q.length > 0)
})

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
const { toggle: toggleAthan, stop: stopAthan, isPlaying: isAthanPlaying } = useAthanPlayer()

const appVersion = __APP_VERSION__ || '0.0.0'

function goToResult(item: any) {
  router.push(item.path)
  clearSearch()
}

function clearSearch() {
  search.value = ''
  runSearch('')
  menuOpen.value = false
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

.search-wrapper { position: relative; }

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
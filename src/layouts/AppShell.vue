<template>
  <q-layout view="hHh LpR fFf" class="app-layout">
    <q-header elevated :reveal="!isNativeRuntime" class="app-header text-white">
      <q-toolbar class="app-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          color="white"
          :aria-label="t('appShell.toggleMenu')"
          @click="leftDrawer = !leftDrawer"
        />
        <q-avatar square size="36px" class="q-ml-sm brand-logo">
          <img src="/logo.svg" alt="PEACE2074" class="app-logo" />
        </q-avatar>
        <q-toolbar-title class="app-toolbar-title">
          <RouterLink to="/" class="brand-link">{{
            t('general.SiteTitle')
          }}</RouterLink>
        </q-toolbar-title>

        <q-btn
          dense
          round
          color="white"
          text-color="dark"
          icon="search"
          class="search-trigger"
          :aria-label="t('appShell.searchPlaceholder')"
          @click="openSearchDialog"
        />

        <q-btn
          dense
          round
          color="primary"
          :icon="isAthanPlaying ? 'pause' : 'volume_up'"
          :aria-label="
            isAthanPlaying
              ? t('appShell.pauseAthan') || t('appShell.playAthan')
              : t('appShell.playAthan')
          "
          @click="toggleAthan"
        />
        <q-btn
          v-if="isAthanPlaying"
          dense
          round
          color="negative"
          icon="stop"
          :aria-label="t('appShell.stopAthan')"
          @click="stopAthan"
        />

        <q-select
          :key="`lang-select-${locale}`"
          v-model="localeModel"
          dense
          outlined
          dark
          :options="langs"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          class="glassy-field locale-select"
        >
          <template #selected>
            <span>{{ languageFlags[localeModel] }}</span>
          </template>
          <template #option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <span class="text-h6">{{ scope.opt.flag }}</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{
                  scope.opt.label.replace(scope.opt.flag, '').trim()
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- User Profile Button -->
        <q-btn
          dense
          round
          :color="isAuthenticated ? 'positive' : 'white'"
          :icon="isAuthenticated ? 'account_circle' : 'login'"
        >
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item v-if="isAuthenticated">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" icon="person" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{
                    authUser?.username || t('user')
                  }}</q-item-label>
                  <q-item-label caption>{{ authUser?.email }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator v-if="isAuthenticated" />

              <q-item
                v-if="!isAuthenticated"
                v-ripple
                clickable
                @click="$router.push('/login')"
              >
                <q-item-section avatar>
                  <q-icon name="login" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ t('appShell.nav.login') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-if="!isAuthenticated"
                v-ripple
                clickable
                @click="$router.push('/signup')"
              >
                <q-item-section avatar>
                  <q-icon name="person_add" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ t('auth.signUp') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-if="isAuthenticated"
                v-close-popup
                v-ripple
                clickable
                @click="$router.push('/profile')"
              >
                <q-item-section avatar>
                  <q-icon name="account_circle" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{
                    t('pages.preferences.profile.title')
                  }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-if="isAuthenticated"
                v-ripple
                clickable
                @click="handleLogout"
              >
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ t('appShell.nav.logout') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawer" :show-if-above="!isNativeRuntime" bordered>
      <q-list>
        <q-item
          v-for="item in orderedNavItems"
          :key="item.key"
          v-ripple
          clickable
          :to="item.to"
          :draggable="navOrderingEnabled"
          :class="{
            dragging: draggingKey === item.key,
            'drag-disabled': !navOrderingEnabled,
          }"
          @dragstart="onDragStart(item.key, $event)"
          @dragover.prevent="onDragOver(item.key, $event)"
          @drop.prevent="onDrop(item.key, $event)"
          @dragend="onDragEnd"
        >
          <q-item-section avatar>
            <q-icon name="drag_indicator" />
          </q-item-section>
          <q-item-section>{{ t(item.labelKey) }}</q-item-section>
          <q-item-section side>
            <q-btn
              dense
              flat
              round
              :icon="item.pinned ? 'push_pin' : 'push_pin'"
              :color="item.pinned ? 'amber' : 'grey-6'"
              :disable="!navOrderingEnabled"
              :aria-label="
                item.pinned ? t('appShell.unpin') : t('appShell.pin')
              "
              @click.stop="togglePin(item.key)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-dialog
      v-model="searchDialogOpen"
      :maximized="$q.screen.lt.sm"
      @hide="clearSearch"
    >
      <q-card class="search-dialog-card">
        <q-card-section class="row items-center justify-between q-pb-sm">
          <div class="text-subtitle1 text-weight-medium">
            {{ t('appShell.searchPlaceholder') }}
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="searchDialogOpen = false"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="search"
            dense
            outlined
            autofocus
            :placeholder="t('appShell.searchPlaceholder')"
            class="search"
            debounce="300"
            clearable
            @clear="clearSearch"
            @keyup.esc="searchDialogOpen = false"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none search-dialog-results">
          <q-list>
            <q-item v-if="searchLoading">
              <q-item-section avatar>
                <q-spinner color="primary" size="24px" />
              </q-item-section>
              <q-item-section>{{ t('general.searching') }}</q-item-section>
            </q-item>

            <q-item
              v-for="item in searchResults"
              :key="item.id"
              v-ripple
              clickable
              @click="goToResult(item)"
            >
              <q-item-section>
                <div class="text-weight-medium">{{ item.title }}</div>
                <div class="text-caption text-grey-7">{{ item.subtitle }}</div>
              </q-item-section>
              <q-item-section side>
                <q-badge color="primary" outline>{{
                  item.type === 'sura'
                    ? t('appShell.resultType.sura')
                    : t('appShell.resultType.page')
                }}</q-badge>
              </q-item-section>
            </q-item>

            <q-item v-if="!searchLoading && !searchResults.length">
              <q-item-section>
                {{ search ? t('notfound') : t('appShell.searchPlaceholder') }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-page-container>
      <RouterView v-slot="{ Component }">
        <keep-alive :include="['QuranDetail']">
          <component :is="Component" />
        </keep-alive>
      </RouterView>
    </q-page-container>

    <SupportAIWidget v-if="showLazyWidgets" />
    <ConsentBanner v-if="showLazyWidgets" />

    <q-footer class="app-footer q-pa-sm" elevated :reveal="!isNativeRuntime">
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
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  defineAsyncComponent,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAthanPlayer } from '@/composables/useAthanPlayer'
import { useSiteSearch } from '@/composables/useSiteSearch'
import { useAuthStore } from '@/stores/auth.pinia'
import {
  AVAILABLE_LOCALES,
  buildLocalePath,
  normalizeLocale,
  persistLocale,
} from '@/utils/locale-routing'
const SupportAIWidget = defineAsyncComponent(
  () => import('@/components/common/SupportAIWidget.vue')
)
const ConsentBanner = defineAsyncComponent(
  () => import('@/components/common/ConsentBanner.vue')
)

declare const __APP_VERSION__: string

const NAV_STORAGE_KEY = 'nav-items-v1'
const NAV_ORDERING_KEY = 'nav-ordering-enabled'
const DRAWER_OPEN_KEY = 'drawer-open-by-default'
const COMPACT_KEY = 'pref-compact-layout'
const MOTION_KEY = 'pref-reduce-motion'
const AUTOPLAY_KEY = 'pref-autoplay-athan'

const leftDrawer = ref(readDrawerPreference())
const search = ref('')
const { locale, t } = useI18n({ useScope: 'global' })
const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const authUser = computed(() => authStore._user)
const languageCodes = AVAILABLE_LOCALES

const localeModel = computed({
  get: () => locale.value,
  set: (value: string) => {
    if (!value) return
    const normalized = normalizeLocale(value, languageCodes)
    if (!normalized) return

    locale.value = normalized
    persistLocale(normalized)

    const localizedPath = buildLocalePath(route.path, normalized, {
      forcePrefix: true,
    })

    if (localizedPath === route.path) return

    void router
      .replace({
        path: localizedPath,
        query: route.query,
        hash: route.hash,
      })
      .catch(() => {})
  },
})

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

const defaultNavItems = [
  { key: 'home', labelKey: 'appShell.nav.home', to: '/' },
  { key: 'quran', labelKey: 'appShell.nav.quran', to: '/quran' },
  { key: 'holynames', labelKey: 'appShell.nav.holynames', to: '/holynames' },
  { key: 'tasbeeh', labelKey: 'appShell.nav.tasbeeh', to: '/tasbeeh' },
  { key: 'miracles', labelKey: 'appShell.nav.miracles', to: '/miracles' },
  { key: 'chat', labelKey: 'appShell.nav.chat', to: '/chat' },
  { key: 'support', labelKey: 'appShell.nav.support', to: '/support' },
  { key: 'settings', labelKey: 'appShell.nav.settings', to: '/settings' },
  {
    key: 'preferences',
    labelKey: 'appShell.nav.preferences',
    to: '/preferences',
  },
  { key: 'admin', labelKey: 'navigation.AdminPage', to: '/admin' },
  { key: 'login', labelKey: 'appShell.nav.login', to: '/login' },
  { key: 'blog', labelKey: 'appShell.nav.blog', to: '/blog' },
  { key: 'deploys', labelKey: 'appShell.nav.deploys', to: '/deploys' },
  { key: 'contact', labelKey: 'appShell.nav.contact', to: '/contact' },
]

type NavItem = (typeof defaultNavItems)[number] & { pinned?: boolean }
const navItems = ref<NavItem[]>(restoreNavState())
const draggingKey = ref<string | null>(null)
const navOrderingEnabled = ref(readOrderingEnabled())
const compactLayout = ref(readCompactPreference())
const reduceMotion = ref(readReduceMotionPreference())
const autoPlayAthan = ref(readAutoplayPreference())
const currentYear = new Date().getFullYear()
const isNativeRuntime =
  typeof window !== 'undefined'
    ? ['capacitor:', 'ionic:', 'app:'].includes(
        String(window.location.protocol || '')
      )
    : false

const searchDialogOpen = ref(false)
const showLazyWidgets = ref(false)
const {
  results: searchResults,
  loading: searchLoading,
  search: runSearch,
} = useSiteSearch(locale)

watch(search, (q) => {
  runSearch(q)
})

watch(
  navItems,
  (items) => {
    saveNavState(items)
  },
  { deep: true }
)

onMounted(() => {
  window.addEventListener('storage', onStorage)
  window.addEventListener(
    'nav-ordering-changed',
    onNavOrderingChanged as EventListener
  )
  window.addEventListener(
    'drawer-preference-changed',
    onDrawerPreferenceChanged as EventListener
  )
  window.addEventListener(
    'compact-layout-changed',
    onCompactChanged as EventListener
  )
  window.addEventListener(
    'reduce-motion-changed',
    onReduceMotionChanged as EventListener
  )
  window.addEventListener(
    'autoplay-athan-changed',
    onAutoplayChanged as EventListener
  )

  applyCompact(compactLayout.value)
  applyReduceMotion(reduceMotion.value)
  applyAutoplay(autoPlayAthan.value)

  // Defer optional widgets until after first paint to shrink initial payload
  requestAnimationFrame(() => {
    showLazyWidgets.value = true
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', onStorage)
  window.removeEventListener(
    'nav-ordering-changed',
    onNavOrderingChanged as EventListener
  )
  window.removeEventListener(
    'drawer-preference-changed',
    onDrawerPreferenceChanged as EventListener
  )
  window.removeEventListener(
    'compact-layout-changed',
    onCompactChanged as EventListener
  )
  window.removeEventListener(
    'reduce-motion-changed',
    onReduceMotionChanged as EventListener
  )
  window.removeEventListener(
    'autoplay-athan-changed',
    onAutoplayChanged as EventListener
  )
})

// Global Athan player - accessible from every page via header button
const {
  toggle: toggleAthan,
  stop: stopAthan,
  isPlaying: isAthanPlaying,
} = useAthanPlayer()

const appVersionRaw = __APP_VERSION__ || '0.0.0'
const appVersion =
  appVersionRaw.split('.').length >= 2
    ? appVersionRaw.split('.').slice(0, 2).join('.')
    : appVersionRaw

function goToResult(item: any) {
  router.push(item.path)
  searchDialogOpen.value = false
  clearSearch()
}

function clearSearch() {
  search.value = ''
  runSearch('')
}

function openSearchDialog() {
  searchDialogOpen.value = true
}

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}

function togglePin(key: string) {
  const idx = navItems.value.findIndex((i) => i.key === key)
  if (idx === -1) return
  const current = navItems.value[idx]
  const updated: NavItem = { ...current, pinned: !current.pinned }
  navItems.value.splice(idx, 1)
  if (updated.pinned) {
    navItems.value.unshift(updated)
  } else {
    const pinnedSlice = navItems.value.filter((i) => i.pinned)
    const unpinnedSlice = navItems.value.filter((i) => !i.pinned)
    navItems.value.splice(
      0,
      navItems.value.length,
      ...pinnedSlice,
      updated,
      ...unpinnedSlice
    )
  }
}

function moveToTop(key: string) {
  const idx = navItems.value.findIndex((i) => i.key === key)
  if (idx === -1) return
  const [item] = navItems.value.splice(idx, 1)
  navItems.value.unshift({ ...item, pinned: item.pinned })
}

function onDragStart(key: string, ev: DragEvent) {
  if (!navOrderingEnabled.value) return
  draggingKey.value = key
  if (ev.dataTransfer) {
    ev.dataTransfer.effectAllowed = 'move'
    ev.dataTransfer.setData('text/plain', key)
  }
}

function onDragOver(key: string, ev: DragEvent) {
  if (!navOrderingEnabled.value) return
  ev.preventDefault()
  if (!draggingKey.value || draggingKey.value === key) return
  const from = navItems.value.findIndex((i) => i.key === draggingKey.value)
  const to = navItems.value.findIndex((i) => i.key === key)
  if (from === -1 || to === -1) return
  const [item] = navItems.value.splice(from, 1)
  navItems.value.splice(to, 0, item)
}

function onDrop(key: string, ev: DragEvent) {
  if (!navOrderingEnabled.value) return
  ev.preventDefault()
  draggingKey.value = null
}

function onDragEnd() {
  draggingKey.value = null
}

function onStorage(e: StorageEvent) {
  if (e.key === NAV_ORDERING_KEY && e.newValue !== null) {
    navOrderingEnabled.value = e.newValue === 'true'
  }
  if (e.key === DRAWER_OPEN_KEY && e.newValue !== null) {
    leftDrawer.value = e.newValue === 'true'
  }
  if (e.key === COMPACT_KEY && e.newValue !== null) {
    compactLayout.value = e.newValue === 'true'
    applyCompact(compactLayout.value)
  }
  if (e.key === MOTION_KEY && e.newValue !== null) {
    reduceMotion.value = e.newValue === 'true'
    applyReduceMotion(reduceMotion.value)
  }
  if (e.key === AUTOPLAY_KEY && e.newValue !== null) {
    autoPlayAthan.value = e.newValue === 'true'
    applyAutoplay(autoPlayAthan.value)
  }
  if (e.key === NAV_STORAGE_KEY && e.newValue) {
    try {
      const parsed: NavItem[] = JSON.parse(e.newValue)
      if (Array.isArray(parsed)) {
        navItems.value = parsed
      }
    } catch {}
  }
}

function onNavOrderingChanged(ev: CustomEvent) {
  if (typeof ev.detail?.enabled === 'boolean') {
    navOrderingEnabled.value = ev.detail.enabled
  }
}

function onDrawerPreferenceChanged(ev: CustomEvent) {
  if (typeof ev.detail?.open === 'boolean') {
    leftDrawer.value = ev.detail.open
  }
}

function onCompactChanged(ev: CustomEvent) {
  if (typeof ev.detail?.enabled === 'boolean') {
    compactLayout.value = ev.detail.enabled
    applyCompact(compactLayout.value)
  }
}

function onReduceMotionChanged(ev: CustomEvent) {
  if (typeof ev.detail?.enabled === 'boolean') {
    reduceMotion.value = ev.detail.enabled
    applyReduceMotion(reduceMotion.value)
  }
}

function onAutoplayChanged(ev: CustomEvent) {
  if (typeof ev.detail?.enabled === 'boolean') {
    autoPlayAthan.value = ev.detail.enabled
    applyAutoplay(autoPlayAthan.value)
  }
}

function readOrderingEnabled(): boolean {
  try {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(NAV_ORDERING_KEY)
      if (stored === null) return true
      return stored === 'true'
    }
  } catch {}
  return true
}

function readDrawerPreference(): boolean {
  try {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(DRAWER_OPEN_KEY)
      if (stored === null) return false
      return stored === 'true'
    }
  } catch {}
  return false
}

function readCompactPreference(): boolean {
  try {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(COMPACT_KEY)
      if (stored === null) return false
      return stored === 'true'
    }
  } catch {}
  return false
}

function readReduceMotionPreference(): boolean {
  try {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(MOTION_KEY)
      if (stored === null) return false
      return stored === 'true'
    }
  } catch {}
  return false
}

function readAutoplayPreference(): boolean {
  try {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(AUTOPLAY_KEY)
      if (stored === null) return false
      return stored === 'true'
    }
  } catch {}
  return false
}

function applyCompact(enabled: boolean) {
  if (typeof document === 'undefined') return
  document.body.classList.toggle('is-compact', enabled)
  document.documentElement.classList.toggle('is-compact', enabled)
}

function applyReduceMotion(enabled: boolean) {
  if (typeof document === 'undefined') return
  document.body.classList.toggle('reduce-motion', enabled)
  document.documentElement.classList.toggle('reduce-motion', enabled)
}

function applyAutoplay(enabled: boolean) {
  if (!enabled) return
  try {
    if (!isAthanPlaying.value) {
      toggleAthan()
    }
  } catch {}
}

function restoreNavState(): NavItem[] {
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(NAV_STORAGE_KEY)
      if (raw) {
        const saved: NavItem[] = JSON.parse(raw)
        if (Array.isArray(saved)) {
          const defaultsMap = new Map(defaultNavItems.map((i) => [i.key, i]))
          const restored: NavItem[] = []
          for (const savedItem of saved) {
            const base = defaultsMap.get(savedItem.key)
            if (base) {
              restored.push({ ...base, pinned: !!savedItem.pinned })
              defaultsMap.delete(savedItem.key)
            }
          }
          defaultsMap.forEach((value) => restored.push({ ...value }))
          return restored
        }
      }
    }
  } catch {}
  return [...defaultNavItems]
}

function saveNavState(items: NavItem[]) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(items))
    }
  } catch {}
}

const orderedNavItems = computed(() => {
  // Filter out login link when user is authenticated
  const filteredItems = navItems.value.filter((item) => {
    if (item.key === 'login' && isAuthenticated.value) {
      return false
    }
    return true
  })

  const pinned = filteredItems.filter((i) => i.pinned)
  const rest = filteredItems.filter((i) => !i.pinned)
  return [...pinned, ...rest]
})
</script>

<style scoped>
.app-layout {
  background:
    radial-gradient(circle at top, rgba(16, 185, 129, 0.08), transparent 34%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  color: #0f172a;
}

.app-layout :deep(.q-page-container),
.app-layout :deep(.q-page) {
  background: transparent;
  color: inherit;
}

.app-header {
  background: radial-gradient(circle at top, #1f2937, #0b1120 60%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: env(safe-area-inset-top);
}

.app-toolbar {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  flex-wrap: nowrap;
  gap: 8px;
  min-width: 0;
}

.app-toolbar-title {
  min-width: 0;
  overflow: hidden;
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
}

.brand-link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search {
  width: 100%;
}

.search-trigger {
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.22);
}

.search-dialog-card {
  width: min(680px, 92vw);
  max-height: min(80vh, 720px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
}

.search-dialog-results {
  overflow-y: auto;
}

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

.locale-select {
  max-width: 160px;
  min-width: 120px;
}

:global(body.body--dark) .app-layout {
  background: #000;
  color: #f8fafc;
}

@media (max-width: 760px) {
  .app-toolbar {
    flex-wrap: wrap;
    row-gap: 8px;
  }

  .app-toolbar-title {
    flex: 1 1 auto;
  }

  .locale-select {
    min-width: 76px;
    max-width: 92px;
  }
}

.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-bottom: env(safe-area-inset-bottom);
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
  padding-bottom: env(safe-area-inset-bottom);
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
.q-drawer .q-item.dragging {
  opacity: 0.6;
}
.q-drawer .q-item {
  cursor: grab;
}
.q-drawer .q-item.dragging {
  cursor: grabbing;
}
.q-drawer .q-item.drag-disabled {
  cursor: not-allowed;
}
</style>

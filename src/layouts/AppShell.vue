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
          :aria-label="t('appShell.toggleMenu')"
        />
        <q-avatar square size="36px" class="q-ml-sm brand-logo">
          <img src="/logo.svg" alt="PEACE2074" class="app-logo" />
        </q-avatar>
        <q-toolbar-title>
          <RouterLink to="/" class="brand-link">{{ t("general.SiteTitle") }}</RouterLink>
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
                <q-item-section>{{
                  t("general.searching")
                }}</q-item-section>
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
                  <q-badge color="primary" outline>{{
                    item.type === "sura" ? t("appShell.resultType.sura") : t("appShell.resultType.page")
                  }}</q-badge>
                </q-item-section>
              </q-item>
              <q-item v-if="!searchResults.length">
                <q-item-section>{{
                  search ? t("notfound") : t("appShell.searchPlaceholder")
                }}</q-item-section>
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
          :aria-label="
            isAthanPlaying
              ? t('appShell.pauseAthan') || t('appShell.playAthan')
              : t('appShell.playAthan')
          "
        />
        <q-btn
          v-if="isAthanPlaying"
          dense
          round
          color="negative"
          icon="stop"
          class="q-ml-sm"
          @click="stopAthan"
          :aria-label="t('appShell.stopAthan')"
        />

        <q-select
          :key="`lang-select-${locale}`"
          dense
          outlined
          dark
          :options="langs"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          v-model="localeModel"
          class="glassy-field"
          style="max-width: 140px; margin-left: 12px"
        />

        <!-- User Profile Button -->
        <q-btn
          dense
          round
          :color="isAuthenticated ? 'positive' : 'white'"
          :icon="isAuthenticated ? 'account_circle' : 'login'"
          class="q-ml-sm"
        >
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item v-if="isAuthenticated">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" icon="person" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ authUser?.username || t('user') }}</q-item-label>
                  <q-item-label caption>{{ authUser?.email }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator v-if="isAuthenticated" />
              
              <q-item clickable v-ripple @click="$router.push('/login')" v-if="!isAuthenticated">
                <q-item-section avatar>
                  <q-icon name="login" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ t('appShell.nav.login') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="handleLogout" v-if="isAuthenticated">
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

    <q-drawer v-model="leftDrawer" show-if-above bordered>
      <q-list>
        <q-item
          v-for="item in orderedNavItems"
          :key="item.key"
          clickable
          v-ripple
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
              @click.stop="togglePin(item.key)"
              :aria-label="item.pinned ? t('appShell.unpin') : t('appShell.pin')"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <RouterView />
    </q-page-container>

    <SupportAIWidget v-if="showLazyWidgets" />
    <ConsentBanner v-if="showLazyWidgets" />

    <q-footer class="text-center q-pa-sm">
      <div class="footer">
        <img class="decor" src="/assets/decor-bottom.svg" alt="decor" />
        <span>© 2025 {{ t("general.SiteTitle") }} · v{{ appVersion }}</span>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useAthanPlayer } from "@/composables/useAthanPlayer";
import { useSiteSearch } from "@/composables/useSiteSearch";
import { useAuthStore } from "@/stores/auth.pinia";
const SupportAIWidget = defineAsyncComponent(() => import("@/components/common/SupportAIWidget.vue"));
const ConsentBanner = defineAsyncComponent(() => import("@/components/common/ConsentBanner.vue"));

declare const __APP_VERSION__: string;

const LOCALE_STORAGE_KEY = "app-locale";
const NAV_STORAGE_KEY = "nav-items-v1";
const NAV_ORDERING_KEY = "nav-ordering-enabled";
const DRAWER_OPEN_KEY = "drawer-open-by-default";
const COMPACT_KEY = "pref-compact-layout";
const MOTION_KEY = "pref-reduce-motion";
const AUTOPLAY_KEY = "pref-autoplay-athan";

const leftDrawer = ref(readDrawerPreference());
const search = ref("");
const { locale, t } = useI18n({ useScope: "global" });
const router = useRouter();
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const authUser = computed(() => authStore._user);
const languageCodes = ["en", "ar", "de", "ru", "he", "tr"] as const;

const localeModel = computed({
  get: () => locale.value,
  set: (value: string) => {
    if (!value) return;
    const normalized = String(value).trim().toLowerCase().split('-')[0];
    if (!languageCodes.includes(normalized as (typeof languageCodes)[number])) return;
    locale.value = normalized;
    if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, normalized);
      } catch {}
    }
  },
});

const langs = computed(() => {
  locale.value;
  return languageCodes.map((code) => ({
    value: code,
    label: t(`general.languageNames.${code}`),
  }));
});

const defaultNavItems = [
  { key: "home", labelKey: "appShell.nav.home", to: "/" },
  { key: "quran", labelKey: "appShell.nav.quran", to: "/quran" },
  { key: "holynames", labelKey: "appShell.nav.holynames", to: "/holynames" },
  { key: "tasbeeh", labelKey: "appShell.nav.tasbeeh", to: "/tasbeeh" },
  { key: "miracles", labelKey: "appShell.nav.miracles", to: "/miracles" },
  { key: "chat", labelKey: "appShell.nav.chat", to: "/chat" },
  { key: "support", labelKey: "appShell.nav.support", to: "/support" },
  { key: "settings", labelKey: "appShell.nav.settings", to: "/settings" },
  { key: "preferences", labelKey: "appShell.nav.preferences", to: "/preferences" },
  { key: "admin", labelKey: "navigation.AdminPage", to: "/admin" },
  { key: "login", labelKey: "appShell.nav.login", to: "/login" },
  { key: "blog", labelKey: "appShell.nav.blog", to: "/blog" },
  { key: "contact", labelKey: "appShell.nav.contact", to: "/contact" },
];

type NavItem = typeof defaultNavItems[number] & { pinned?: boolean };
const navItems = ref<NavItem[]>(restoreNavState());
const draggingKey = ref<string | null>(null);
const navOrderingEnabled = ref(readOrderingEnabled());
const compactLayout = ref(readCompactPreference());
const reduceMotion = ref(readReduceMotionPreference());
const autoPlayAthan = ref(readAutoplayPreference());

const menuOpen = ref(false);
const searchRef = ref(null);
const showLazyWidgets = ref(false);
const {
  results: searchResults,
  loading: searchLoading,
  search: runSearch,
} = useSiteSearch(locale);

watch(search, (q) => {
  runSearch(q);
  menuOpen.value = !!q && (!!searchResults.value.length || q.length > 0);
});

watch(
  navItems,
  (items) => {
    saveNavState(items);
  },
  { deep: true }
);

onMounted(() => {
  window.addEventListener("storage", onStorage);
  window.addEventListener("nav-ordering-changed", onNavOrderingChanged as EventListener);
  window.addEventListener(
    "drawer-preference-changed",
    onDrawerPreferenceChanged as EventListener
  );
  window.addEventListener("compact-layout-changed", onCompactChanged as EventListener);
  window.addEventListener(
    "reduce-motion-changed",
    onReduceMotionChanged as EventListener
  );
  window.addEventListener("autoplay-athan-changed", onAutoplayChanged as EventListener);

  applyCompact(compactLayout.value);
  applyReduceMotion(reduceMotion.value);
  applyAutoplay(autoPlayAthan.value);

  // Defer optional widgets until after first paint to shrink initial payload
  requestAnimationFrame(() => {
    showLazyWidgets.value = true;
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("storage", onStorage);
  window.removeEventListener(
    "nav-ordering-changed",
    onNavOrderingChanged as EventListener
  );
  window.removeEventListener(
    "drawer-preference-changed",
    onDrawerPreferenceChanged as EventListener
  );
  window.removeEventListener("compact-layout-changed", onCompactChanged as EventListener);
  window.removeEventListener(
    "reduce-motion-changed",
    onReduceMotionChanged as EventListener
  );
  window.removeEventListener(
    "autoplay-athan-changed",
    onAutoplayChanged as EventListener
  );
});

// Global Athan player - accessible from every page via header button
const {
  toggle: toggleAthan,
  stop: stopAthan,
  isPlaying: isAthanPlaying,
} = useAthanPlayer();

const appVersion = __APP_VERSION__ || "0.0.0";

function goToResult(item: any) {
  router.push(item.path);
  clearSearch();
}

function clearSearch() {
  search.value = "";
  runSearch("");
  menuOpen.value = false;
}

async function handleLogout() {
  await authStore.logout();
  router.push("/");
}

function togglePin(key: string) {
  const idx = navItems.value.findIndex((i) => i.key === key);
  if (idx === -1) return;
  const current = navItems.value[idx];
  const updated: NavItem = { ...current, pinned: !current.pinned };
  navItems.value.splice(idx, 1);
  if (updated.pinned) {
    navItems.value.unshift(updated);
  } else {
    const pinnedSlice = navItems.value.filter((i) => i.pinned);
    const unpinnedSlice = navItems.value.filter((i) => !i.pinned);
    navItems.value.splice(
      0,
      navItems.value.length,
      ...pinnedSlice,
      updated,
      ...unpinnedSlice
    );
  }
}

function moveToTop(key: string) {
  const idx = navItems.value.findIndex((i) => i.key === key);
  if (idx === -1) return;
  const [item] = navItems.value.splice(idx, 1);
  navItems.value.unshift({ ...item, pinned: item.pinned });
}

function onDragStart(key: string, ev: DragEvent) {
  if (!navOrderingEnabled.value) return;
  draggingKey.value = key;
  if (ev.dataTransfer) {
    ev.dataTransfer.effectAllowed = "move";
    ev.dataTransfer.setData("text/plain", key);
  }
}

function onDragOver(key: string, ev: DragEvent) {
  if (!navOrderingEnabled.value) return;
  ev.preventDefault();
  if (!draggingKey.value || draggingKey.value === key) return;
  const from = navItems.value.findIndex((i) => i.key === draggingKey.value);
  const to = navItems.value.findIndex((i) => i.key === key);
  if (from === -1 || to === -1) return;
  const [item] = navItems.value.splice(from, 1);
  navItems.value.splice(to, 0, item);
}

function onDrop(key: string, ev: DragEvent) {
  if (!navOrderingEnabled.value) return;
  ev.preventDefault();
  draggingKey.value = null;
}

function onDragEnd() {
  draggingKey.value = null;
}

function onStorage(e: StorageEvent) {
  if (e.key === NAV_ORDERING_KEY && e.newValue !== null) {
    navOrderingEnabled.value = e.newValue === "true";
  }
  if (e.key === DRAWER_OPEN_KEY && e.newValue !== null) {
    leftDrawer.value = e.newValue === "true";
  }
  if (e.key === COMPACT_KEY && e.newValue !== null) {
    compactLayout.value = e.newValue === "true";
    applyCompact(compactLayout.value);
  }
  if (e.key === MOTION_KEY && e.newValue !== null) {
    reduceMotion.value = e.newValue === "true";
    applyReduceMotion(reduceMotion.value);
  }
  if (e.key === AUTOPLAY_KEY && e.newValue !== null) {
    autoPlayAthan.value = e.newValue === "true";
    applyAutoplay(autoPlayAthan.value);
  }
  if (e.key === NAV_STORAGE_KEY && e.newValue) {
    try {
      const parsed: NavItem[] = JSON.parse(e.newValue);
      if (Array.isArray(parsed)) {
        navItems.value = parsed;
      }
    } catch {}
  }
}

function onNavOrderingChanged(ev: CustomEvent) {
  if (typeof ev.detail?.enabled === "boolean") {
    navOrderingEnabled.value = ev.detail.enabled;
  }
}

function onDrawerPreferenceChanged(ev: CustomEvent) {
  if (typeof ev.detail?.open === "boolean") {
    leftDrawer.value = ev.detail.open;
  }
}

function onCompactChanged(ev: CustomEvent) {
  if (typeof ev.detail?.enabled === "boolean") {
    compactLayout.value = ev.detail.enabled;
    applyCompact(compactLayout.value);
  }
}

function onReduceMotionChanged(ev: CustomEvent) {
  if (typeof ev.detail?.enabled === "boolean") {
    reduceMotion.value = ev.detail.enabled;
    applyReduceMotion(reduceMotion.value);
  }
}

function onAutoplayChanged(ev: CustomEvent) {
  if (typeof ev.detail?.enabled === "boolean") {
    autoPlayAthan.value = ev.detail.enabled;
    applyAutoplay(autoPlayAthan.value);
  }
}

function readOrderingEnabled(): boolean {
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(NAV_ORDERING_KEY);
      if (stored === null) return true;
      return stored === "true";
    }
  } catch {}
  return true;
}

function readDrawerPreference(): boolean {
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(DRAWER_OPEN_KEY);
      if (stored === null) return false;
      return stored === "true";
    }
  } catch {}
  return false;
}

function readCompactPreference(): boolean {
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(COMPACT_KEY);
      if (stored === null) return false;
      return stored === "true";
    }
  } catch {}
  return false;
}

function readReduceMotionPreference(): boolean {
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(MOTION_KEY);
      if (stored === null) return false;
      return stored === "true";
    }
  } catch {}
  return false;
}

function readAutoplayPreference(): boolean {
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(AUTOPLAY_KEY);
      if (stored === null) return false;
      return stored === "true";
    }
  } catch {}
  return false;
}

function applyCompact(enabled: boolean) {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("is-compact", enabled);
  document.documentElement.classList.toggle("is-compact", enabled);
}

function applyReduceMotion(enabled: boolean) {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("reduce-motion", enabled);
  document.documentElement.classList.toggle("reduce-motion", enabled);
}

function applyAutoplay(enabled: boolean) {
  if (!enabled) return;
  try {
    if (!isAthanPlaying.value) {
      toggleAthan();
    }
  } catch {}
}

function restoreNavState(): NavItem[] {
  try {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(NAV_STORAGE_KEY);
      if (raw) {
        const saved: NavItem[] = JSON.parse(raw);
        if (Array.isArray(saved)) {
          const defaultsMap = new Map(defaultNavItems.map((i) => [i.key, i]));
          const restored: NavItem[] = [];
          for (const savedItem of saved) {
            const base = defaultsMap.get(savedItem.key);
            if (base) {
              restored.push({ ...base, pinned: !!savedItem.pinned });
              defaultsMap.delete(savedItem.key);
            }
          }
          defaultsMap.forEach((value) => restored.push({ ...value }));
          return restored;
        }
      }
    }
  } catch {}
  return [...defaultNavItems];
}

function saveNavState(items: NavItem[]) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(items));
    }
  } catch {}
}

const orderedNavItems = computed(() => {
  // Filter out login link when user is authenticated
  const filteredItems = navItems.value.filter((item) => {
    if (item.key === "login" && isAuthenticated.value) {
      return false;
    }
    return true;
  });
  
  const pinned = filteredItems.filter((i) => i.pinned);
  const rest = filteredItems.filter((i) => !i.pinned);
  return [...pinned, ...rest];
});
</script>

<style scoped>
.app-header {
  background: radial-gradient(circle at top, #1f2937, #0b1120 60%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: env(safe-area-inset-top);
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
}

.brand-link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.search {
  max-width: 360px;
  margin-left: 12px;
}

.search-wrapper {
  position: relative;
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

.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-bottom: env(safe-area-inset-bottom);
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

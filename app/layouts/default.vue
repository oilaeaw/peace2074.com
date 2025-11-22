<script lang="ts" setup>
import { useTimeAgo } from '@vueuse/core'
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t, te } = useI18n();
const route = useRoute();

// `useAuth` returns a reactive object. We should not destructure it in <script setup>
// to ensure that reactivity is preserved and it works correctly with SSR.
const auth = useAuth();

// Computed properties will safely access the auth state when it becomes available.
const isAuthenticated = computed(() => auth.status.value === 'authenticated');
const username = computed(() => auth.data.value?.user?.name || auth.data.value?.user?.email || '');

const toggleLeftDrawer = ref(false);
const toggleRightDrawer = ref(false);
// Tooltip state used by QTooltip in the footer
const showing = ref(false);

// Build timestamp handling (replaces moment + __DATE__ placeholder).
// Prefer an injected build time if provided (can be set via VITE_BUILD_TIME env at build).
const buildEpoch = (import.meta as any).env?.VITE_BUILD_TIME || Date.now();
const buildDate = new Date(typeof buildEpoch === 'string' ? Number(buildEpoch) || buildEpoch : buildEpoch);
function formatBuildDate(d: Date) {
  // Replicates: ddd MMM DD, YYYY [at] HH:mm (24h)
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${weekday} ${month} ${day}, ${year} at ${hours}:${minutes}`;
}
const BuildTime = formatBuildDate(buildDate);
const timeAgo = useTimeAgo(buildDate);

function toggleDrawer() {
  toggleLeftDrawer.value = !toggleLeftDrawer.value;
}
function toggleRight() {
  toggleRightDrawer.value = !toggleRightDrawer.value;
}

/**
 * Resolves a meta value (like title or description) by trying a list of
 * potential i18n keys. Falls back to the original value if no key is found.
 * @param {string | undefined} value - The meta value from the route.
 * @param {string[]} candidates - An array of i18n key candidates to try.
 * @param {string} fallbackKey - The i18n key to use if the value is missing.
 */
function resolveMeta(value: string | undefined, candidates: string[], fallbackKey: string): string {
  if (!value) return t(fallbackKey);
  for (const c of candidates) {
    if (te(c)) return t(c);
  }
  return value;
}

// Set head reactively. It will automatically update when the route or locale changes.
useHead({
  title: computed(() => resolveMeta(route.meta.title as string, [
    `pages.${String(route.name)}.pageTitle`,
    `meta.${String(route.name)}.title`,
  ], 'general.SiteTitle')),
  meta: [
    { name: "description", content: computed(() => resolveMeta(route.meta.description as string, [`meta.${String(route.name)}`], 'meta.home')) },
    { property: "og:description", content: computed(() => resolveMeta(route.meta.description as string, [`meta.${String(route.name)}`], 'meta.home')) },
  ],
});
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-green-9 text-white" height-hint="98">
      <q-toolbar>
        <q-btn
          dense
          flat
          round
          icon="menu"
          class="q-mx-md bg-green-9 text-white"
          @click="toggleDrawer"
        />
        <q-toolbar-title>
          <nuxt-link :title="t('general.SiteTitle')" to="/">
            {{ t("general.SiteTitle") }}
          </nuxt-link>
        </q-toolbar-title>
        <!-- Wrap authentication-dependent UI in <ClientOnly> to prevent SSR errors -->
        <ClientOnly>
          <AuthStatus />
        </ClientOnly>

        <q-space />
        <q-btn
          dense
          flat
          round
          icon="menu"
          class="q-mx-md bg-green-9 text-white"
          @click="toggleRight"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="toggleLeftDrawer"
      :min-width="250"
      :width="300"
      side="left"
      bordered
    >
      <Suspense>
        <LeftDrawerContent />
        <template #fallback>
          <q-skeleton class="q-ma-md" height="80vh" />
        </template>
      </Suspense>
    </q-drawer>

    <q-drawer
      v-model="toggleRightDrawer"
      side="right"
      :width="300"
      bordered
      :overlay="true"
      class="bg-green-9 text-white"
    >
      <Suspense>
        <RightDrawerContent />
        <template #fallback>
          <q-skeleton class="q-ma-md" height="80vh" />
        </template>
      </Suspense>
    </q-drawer>

    <q-page-container>
      <!-- Centered, max-width container to keep the app stable and prevent wobbling -->
      <div class="app-container">
        <slot />
      </div>

      <q-page-scroller position="bottom" :scroll-offset="20" :offset="[0, 0]">
        <q-btn fab icon="keyboard_arrow_up" color="green" />
      </q-page-scroller>
    </q-page-container>

    <q-footer reveal class="bg-green-9">
      <q-toolbar class="bg-green-4 text-white">
        <q-btn
          flat
          round
          dense
          icon="assignment_ind"
          :class="{ 'cursor-pointer': !isAuthenticated }"
          :to="isAuthenticated ? '/account' : '/auth/login'"
        >
          <q-tooltip v-model="showing">
            {{ username || t('auth') }}
          </q-tooltip>
        </q-btn>
        <q-toolbar-title>
          <nuxt-link :title="t('general.SiteTitle')" to="/" />
        </q-toolbar-title>
        <div class="q-mx-auto text-center text-white">
          Built at: {{ BuildTime }} ({{ timeAgo }})
        </div>
        <q-space />
        
        <Footer />
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<style scoped>
.app-container {
clear: both;
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
}

/* Center pages that opt-in with the `.islamic-design` class */
:deep(.islamic-design) {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important; /* horizontal */
  justify-content: center !important; /* vertical */
  text-align: center !important;
  min-height: 100%;
  width: 100%;
}
:deep(.islamic-design > *) {
  margin-left: auto;
  margin-right: auto;
}

/* Reduce horizontal padding on small screens while keeping content readable */
@media (max-width: 640px) {
  .app-container {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
}
</style>

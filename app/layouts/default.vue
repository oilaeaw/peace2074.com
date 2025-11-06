<script lang="ts" setup>
import { useTimeAgo } from '@vueuse/core'
import moment from "moment"
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useAuthStore } from "@app/store/auth.pinia";

const { t, te, locale } = useI18n();
const route = useRoute();
const _q2p = useQ2P();

// Use the auth store and compute a safe username string (handles null user)
const auth = useAuthStore();
const isAuthenticated = computed(() => auth.isAuthenticated);
const username = computed(() => {
  const u = auth.user;
  if (!u) return "";
  // user object might be nested (from server responses) or flat
  if (u.user) {
    const fn = u.user.first_name || "";
    const ln = u.user.last_name || "";
    const full = `${fn} ${ln}`.trim();
    if (full) return full;
    return u.user.username || u.user.email || "";
  }
  return u.username || u.name || u.email || "";
});

onMounted(() => {
  useQ2P().init();
});
const toggleLeftDrawer = ref(false);
const toggleRightDrawer = ref(false);
// Tooltip state used by QTooltip in the footer
const showing = ref(false);

// use $q.dark.toggle() directly where needed
const date = "__DATE__";
const timeAgo = useTimeAgo(date);
const BuildTime: string = moment(date).format("ddd MMM DD, YYYY [at] HH:mm");

function toggleDrawer() {
  toggleLeftDrawer.value = !toggleLeftDrawer.value;
}
function toggleRight() {
  toggleRightDrawer.value = !toggleRightDrawer.value;
}

// Dynamic, localized page title: use route meta.title if present and resolve via i18n.
function resolveTitle(metaTitle: any) {
  // metaTitle may be undefined or a string. Try multiple candidate keys.
  if (!metaTitle) return t("general.SiteTitle");
  const raw = String(metaTitle);
  const candidates = [
    raw,
    raw.toLowerCase(),
    raw.toLowerCase().replace(/\s+/g, "_"),
    `${raw.toLowerCase()}.title`,
    `${raw}.title`,
    `pages.${route.name}.pageTitle`,
  ];
  for (const c of candidates) {
    try {
      if (te(c)) return t(c);
    } catch {
      // ignore
    }
  }
  // If no i18n key found, return the raw meta title string
  return raw;
}

// Resolve meta descriptions similarly. metaDesc can be an i18n key or raw string.
function resolveDescription(metaDesc: any) {
  if (!metaDesc) return t("general.SiteTitle");
  const raw = String(metaDesc);
  const candidates = [
    raw,
    raw.toLowerCase(),
    `${raw}.description`,
    `meta.${raw}`,
    `meta.${route.name}`,
  ];
  for (const c of candidates) {
    try {
      if (te(c)) return t(c);
    } catch {
      // ignore
    }
  }
  return raw;
}

// Set head initially and update when route or locale changes.
useHead({
  title: resolveTitle(route.meta.title),
  meta: [
    { name: "description", content: resolveDescription(route.meta.description) },
    { property: "og:description", content: resolveDescription(route.meta.description) },
  ],
});
watch([() => route.fullPath, () => locale.value], () => {
  useHead({
    title: resolveTitle(route.meta.title),
    meta: [
      { name: "description", content: resolveDescription(route.meta.description) },
      { property: "og:description", content: resolveDescription(route.meta.description) },
    ],
  });
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
        <div class="q-mr-md">
          {{
            isAuthenticated ? t("welcome_back", { name: username }) : t("welcome_guest")
          }}
        </div>

        <q-btn
          v-if="isAuthenticated"
          dense
          flat
          round
          icon="logout"
          class="q-mx-md"
          :title="t('logout')"
          @click="auth.logout()"
        />
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
      <q-list bordered class="q-pa-lg text-green-9">
        <fahras />
      </q-list>
    </q-drawer>

    <q-drawer
      v-model="toggleRightDrawer"
      side="right"
      :width="300"
      bordered
      :overlay="true"
      class="bg-green-9 text-white"
    >
      <q-list bordered class="q-pa-lg bg-green-9 text-white">
        <!-- Quick navigation -->
        <q-item v-ripple clickable :to="{ path: '/chat', query: { room: 'general' } }">
          <q-item-section>
            <q-icon name="forum" class="q-mr-sm" />
            <span>Chat Room</span>
          </q-item-section>
        </q-item>
        <q-item v-ripple clickable to="/chat">
          <q-item-section>
            <q-icon name="chat" class="q-mr-sm" />
            <span>Chat</span>
          </q-item-section>
        </q-item>
        <q-separator spaced color="white" />
        <q-item v-ripple clickable to="/terms">
          <q-item-section>
            <q-icon name="gavel" class="q-mr-sm" />
            <span>{{ t("terms_and_conditions") }}</span>
          </q-item-section>
        </q-item>
        <q-item v-ripple clickable to="/privacy">
          <q-item-section>
            <q-icon name="privacy_tip" class="q-mr-sm" />
            <span>{{ t("privacy_policy") }}</span>
          </q-item-section>
        </q-item>
                <q-item v-ripple clickable to="/contact">
          <q-item-section>
            <q-icon name="privacy_tip" class="q-mr-sm" />
            <span>{{ t("contact") }}</span>
          </q-item-section>
        </q-item>
        <template v-if="isAuthenticated">
          <q-item v-ripple clickable to="/auth/profile">
            <q-item-section>
              <q-icon name="person" class="q-mr-sm" />
              <span>{{ t("profile.title") || "Profile" }}</span>
            </q-item-section>
          </q-item>
          <q-item v-ripple clickable to="/account/settings">
            <q-item-section>
              <q-icon name="settings" class="q-mr-sm" />
              <span>{{ t("settings.title") || "Settings" }}</span>
            </q-item-section>
          </q-item>
        </template>
        <q-item v-else v-ripple clickable to="/auth/authenticate">
          <q-item-section>
            <q-icon name="person" class="q-mr-sm" />
            <span>{{ t("auth") }}</span>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <!-- Centered, max-width container to keep the app stable and prevent wobbling -->
      <div class="app-container q-pa-md">
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
          class="cursor"
          to="/auth/authenticate"
        >
          <q-tooltip v-model="showing">
            {{ username }}
          </q-tooltip>
        </q-btn>
        <q-toolbar-title>
          <nuxt-link :title="t('general.SiteTitle')" to="/" />
        </q-toolbar-title>
        <div class="q-mx-auto text-center text-white">
          Built at: {{ BuildTime }} ({{ timeAgo }})
        </div>
        <q-space />
        <q-btn flat round dense icon="apps" class="q-mr-xs" />
        <q-btn flat round dense icon="more_vert" />
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<style scoped>
.app-container {
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
}

/* Reduce horizontal padding on small screens while keeping content readable */
@media (max-width: 640px) {
  .app-container {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
}
</style>

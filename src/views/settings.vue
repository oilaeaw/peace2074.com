<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";

const NAV_ORDERING_KEY = "nav-ordering-enabled";
const DRAWER_OPEN_KEY = "drawer-open-by-default";
const COMPACT_KEY = "pref-compact-layout";
const MOTION_KEY = "pref-reduce-motion";
const AUTOPLAY_KEY = "pref-autoplay-athan";
const NOTIFICATIONS_KEY = "pref-enable-notifications";

const { t } = useI18n();
const $q = useQuasar();

const enableNotifications = ref(readNotificationsPreference());
const navOrderingEnabled = ref(readNavOrderingEnabled());
const drawerOpenByDefault = ref(readDrawerOpenPreference());
const compactLayout = ref(readCompactPreference());
const reduceMotion = ref(readReduceMotionPreference());
const autoPlayAthan = ref(readAutoplayAthanPreference());

watch(navOrderingEnabled, (val) => {
  persistNavOrdering(val);
  broadcastNavOrdering(val);
});

watch(drawerOpenByDefault, (val) => {
  persistDrawerPreference(val);
  broadcastDrawerPreference(val);
});

watch(compactLayout, (val) => {
  persistCompactPreference(val);
  broadcastCompactPreference(val);
});

watch(reduceMotion, (val) => {
  persistReduceMotionPreference(val);
  broadcastReduceMotionPreference(val);
});

watch(autoPlayAthan, (val) => {
  persistAutoplayPreference(val);
  broadcastAutoplayPreference(val);
});

watch(enableNotifications, async (val) => {
  if (val) {
    const granted = await ensureNotificationsPermission();
    if (!granted) {
      enableNotifications.value = false;
      persistNotificationsPreference(false);
      return;
    }

    // Attempt a service-worker-backed notification for mobile Safari/Android
    const shown = await showTestNotification();
    if (!shown) {
      // Fall back to in-app toast so the user gets feedback
      $q.notify?.({
        type: "info",
        message:
          t("pages.settings.notifications.unavailable") ||
          "Your browser does not support mobile push-style notifications; you'll still get in-app alerts.",
      });
    }
  }
  persistNotificationsPreference(val);
});

function readNavOrderingEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = window.localStorage.getItem(NAV_ORDERING_KEY);
  if (stored === null) return true;
  return stored === "true";
}

function persistNavOrdering(val: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NAV_ORDERING_KEY, String(val));
}

function broadcastNavOrdering(val: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("nav-ordering-changed", { detail: { enabled: val } })
  );
}

function readCompactPreference(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(COMPACT_KEY);
  if (stored === null) return false;
  return stored === "true";
}

function persistCompactPreference(val: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPACT_KEY, String(val));
}

function broadcastCompactPreference(val: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("compact-layout-changed", { detail: { enabled: val } })
  );
}

function readReduceMotionPreference(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(MOTION_KEY);
  if (stored === null) return false;
  return stored === "true";
}

function persistReduceMotionPreference(val: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MOTION_KEY, String(val));
}

function broadcastReduceMotionPreference(val: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("reduce-motion-changed", { detail: { enabled: val } })
  );
}

function readAutoplayAthanPreference(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(AUTOPLAY_KEY);
  if (stored === null) return false;
  return stored === "true";
}

function persistAutoplayPreference(val: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTOPLAY_KEY, String(val));
}

function broadcastAutoplayPreference(val: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("autoplay-athan-changed", { detail: { enabled: val } })
  );
}

function readNotificationsPreference(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(NOTIFICATIONS_KEY);
  if (stored === null) return false;
  return stored === "true";
}

function persistNotificationsPreference(val: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NOTIFICATIONS_KEY, String(val));
}

async function ensureNotificationsPermission(): Promise<boolean> {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    $q.notify?.({
      type: "warning",
      message:
        t("pages.settings.notifications.unavailable") || "Notifications not supported.",
    });
    return false;
  }
  const current = Notification.permission;
  if (current === "granted") return true;
  if (current === "denied") {
    $q.notify?.({
      type: "negative",
      message:
        t("pages.settings.notifications.denied") ||
        "Notifications are blocked in your browser settings.",
    });
    return false;
  }
  try {
    const result = await Notification.requestPermission();
    if (result === "granted") return true;
    $q.notify?.({
      type: "warning",
      message:
        t("pages.settings.notifications.denied") ||
        "Notifications permission was not granted.",
    });
    return false;
  } catch (e) {
    $q.notify?.({
      type: "negative",
      message:
        t("pages.settings.notifications.error") || "Could not enable notifications.",
    });
    return false;
  }
}

async function showTestNotification(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg?.showNotification) {
        await reg.showNotification(
          t("pages.settings.notifications.testTitle") || "Notifications enabled",
          {
            body:
              t("pages.settings.notifications.testBody") ||
              "We'll use your browser's notification system when available.",
            icon: "/192x192.png",
            tag: "peace2074-notification-test",
          }
        );
        return true;
      }
    }

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      // Fallback to immediate notification in supported desktop browsers
      // eslint-disable-next-line no-new
      new Notification(
        t("pages.settings.notifications.testTitle") || "Notifications enabled",
        {
          body:
            t("pages.settings.notifications.testBody") ||
            "We'll use your browser's notification system when available.",
          icon: "/192x192.png",
          tag: "peace2074-notification-test",
        }
      );
      return true;
    }
  } catch (err) {
    console.warn("Notification test failed", err);
  }

  return false;
}

function readDrawerOpenPreference(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(DRAWER_OPEN_KEY);
  if (stored === null) return false;
  return stored === "true";
}

function persistDrawerPreference(val: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAWER_OPEN_KEY, String(val));
}

function broadcastDrawerPreference(val: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("drawer-preference-changed", { detail: { open: val } })
  );
}

function onPullRefresh(done?: () => void) {
  reloadApp();
  if (done) done();
}

async function reloadApp() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      regs.forEach((r) => r.update().catch(() => {}));
    }
  } catch {}
  window.location.reload();
}
</script>

<template>
  <q-page class="q-pa-md settings-page">
    <q-pull-to-refresh @refresh="onPullRefresh">
      <div class="page-header q-mb-md">
        <h1 class="text-h4 q-mb-xs">{{ t("pages.settings.title") }}</h1>
        <div class="text-subtitle2 text-grey-6">{{ t("pages.settings.subtitle") }}</div>
      </div>

      <div class="grid">
        <q-card class="glassy-card">
          <q-card-section>
            <div class="text-h6 q-mb-sm">{{ t("pages.settings.display.title") }}</div>
            <div class="text-body2 text-grey-7 q-mb-md">
              {{ t("pages.settings.display.desc") }}
            </div>
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t("pages.settings.display.compact") }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ t("pages.settings.display.compactHint") }}
                </div>
              </div>
              <q-toggle
                v-model="compactLayout"
                color="primary"
                :aria-label="t('pages.settings.display.compact')"
              />
            </div>
            <q-separator spaced />
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">{{ t("pages.settings.display.motion") }}</div>
                <div class="text-caption text-grey-6">
                  {{ t("pages.settings.display.motionHint") }}
                </div>
              </div>
              <q-toggle
                v-model="reduceMotion"
                color="primary"
                :aria-label="t('pages.settings.display.motion')"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="glassy-card">
          <q-card-section>
            <div class="text-h6 q-mb-sm">{{ t("pages.settings.navigation.title") }}</div>
            <div class="text-body2 text-grey-7 q-mb-md">
              {{ t("pages.settings.navigation.desc") }}
            </div>
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t("pages.settings.navigation.enableOrdering") }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ t("pages.settings.navigation.enableOrderingHint") }}
                </div>
              </div>
              <q-toggle
                v-model="navOrderingEnabled"
                color="primary"
                :aria-label="t('pages.settings.navigation.enableOrdering')"
              />
            </div>
            <q-separator spaced />
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t("pages.settings.navigation.drawerDefault") }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ t("pages.settings.navigation.drawerDefaultHint") }}
                </div>
              </div>
              <q-toggle
                v-model="drawerOpenByDefault"
                color="primary"
                :aria-label="t('pages.settings.navigation.drawerDefault')"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="glassy-card">
          <q-card-section>
            <div class="text-h6 q-mb-sm">
              {{ t("pages.settings.notifications.title") }}
            </div>
            <div class="text-body2 text-grey-7 q-mb-md">
              {{ t("pages.settings.notifications.desc") }}
            </div>
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">
                  {{ t("pages.settings.notifications.enable") }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ t("pages.settings.notifications.enableHint") }}
                </div>
              </div>
              <q-toggle
                v-model="enableNotifications"
                color="primary"
                :aria-label="t('pages.settings.notifications.enable')"
              />
            </div>
            <q-banner dense rounded class="q-mt-md" color="grey-3" text-color="grey-8">
              {{ t("pages.settings.notifications.comingSoon") }}
            </q-banner>
          </q-card-section>
        </q-card>

        <q-card class="glassy-card">
          <q-card-section>
            <div class="text-h6 q-mb-sm">{{ t("pages.settings.audio.title") }}</div>
            <div class="text-body2 text-grey-7 q-mb-md">
              {{ t("pages.settings.audio.desc") }}
            </div>
            <div class="setting-row">
              <div>
                <div class="text-subtitle1">{{ t("pages.settings.audio.autoPlay") }}</div>
                <div class="text-caption text-grey-6">
                  {{ t("pages.settings.audio.autoPlayHint") }}
                </div>
              </div>
              <q-toggle
                v-model="autoPlayAthan"
                color="primary"
                :aria-label="t('pages.settings.audio.autoPlay')"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="glassy-card">
          <q-card-section class="q-gutter-sm">
            <div class="text-h6 q-mb-sm">{{ t("pages.settings.refresh.title") }}</div>
            <div class="text-body2 text-grey-7">
              {{ t("pages.settings.refresh.desc") }}
            </div>
            <q-btn
              color="primary"
              unelevated
              :label="t('button.reload')"
              @click="reloadApp"
            />
          </q-card-section>
        </q-card>
      </div>
    </q-pull-to-refresh>
  </q-page>
</template>

<style scoped>
.settings-page {
  max-width: 1100px;
  margin: 0 auto;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.glassy-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
</style>

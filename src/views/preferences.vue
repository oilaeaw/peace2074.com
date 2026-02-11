<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useAuthStore } from "@/stores/auth.pinia";
import { useStorageRef } from "@/composables/useUStore";

const { t } = useI18n();
const $q = useQuasar();
const authStore = useAuthStore();

const THEME_MODE_KEY = "pref-theme-mode";
const DARK_MODE_KEY = "pref-dark-mode";
type ThemeMode = "system" | "light" | "dark";

const themeModeStore = useStorageRef<ThemeMode>(THEME_MODE_KEY, "system");
const themeMode = computed<ThemeMode>({
  get: () => themeModeStore.value.value,
  set: (mode) => themeModeStore.set(mode),
});
const darkModeStore = useStorageRef<boolean>(DARK_MODE_KEY, false);
const themeMediaQuery = ref<MediaQueryList | null>(null);

const isAuthenticated = computed(() => authStore.isAuthenticated);

const displayName = ref("");
const rememberLastPage = ref(true);
const showTransliteration = ref(false);
const emailUpdates = ref(false);

// Password change fields
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const isChangingPassword = ref(false);

// Production always uses /api, dev can use local Nitro
const NITRO_BASE = import.meta.env.DEV
  ? (import.meta.env.VITE_NITRO_BASE || "http://localhost:3000")
  : "/api";

const themeModeOptions = computed(() => [
  { label: t("pages.preferences.appearance.themeOptions.system"), value: "system" },
  { label: t("pages.preferences.appearance.themeOptions.light"), value: "light" },
  { label: t("pages.preferences.appearance.themeOptions.dark"), value: "dark" },
]);

function applyThemeMode(mode: ThemeMode) {
  if (mode === "system") {
    const prefersDark = themeMediaQuery.value?.matches ?? false;
    $q.dark.set(prefersDark);
    return;
  }
  const isDark = mode === "dark";
  $q.dark.set(isDark);
  darkModeStore.set(isDark);
}

function handleSystemThemeChange(event: MediaQueryListEvent) {
  if (themeMode.value !== "system") return;
  $q.dark.set(event.matches);
}

onMounted(() => {
  if (typeof window !== "undefined" && "matchMedia" in window) {
    themeMediaQuery.value = window.matchMedia("(prefers-color-scheme: dark)");
    themeMediaQuery.value.addEventListener("change", handleSystemThemeChange);
  }
  applyThemeMode(themeMode.value);
});

onBeforeUnmount(() => {
  if (themeMediaQuery.value) {
    themeMediaQuery.value.removeEventListener("change", handleSystemThemeChange);
  }
});

watch(themeMode, (mode) => {
  applyThemeMode(mode);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("theme-mode-changed", { detail: { mode } }));
  }
});

function generateStrongPassword() {
  const length = 16;
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%&*-+=";
  
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = "";
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  password = password.split('').sort(() => Math.random() - 0.5).join('');
  
  return password;
}

function suggestPassword() {
  const generated = generateStrongPassword();
  newPassword.value = generated;
  confirmPassword.value = generated;
  showNewPassword.value = true;
  showConfirmPassword.value = true;
  
  $q.notify({
    type: "info",
    message: t("pages.preferences.security.passwordGenerated"),
    position: "top",
    timeout: 2000,
  });
}

async function handleChangePassword() {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    $q.notify({
      type: "negative",
      message: t("pages.preferences.security.errors.allFieldsRequired"),
      position: "top",
    });
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    $q.notify({
      type: "negative",
      message: t("pages.preferences.security.errors.passwordMismatch"),
      position: "top",
    });
    return;
  }

  if (newPassword.value.length < 8) {
    $q.notify({
      type: "negative",
      message: t("pages.preferences.security.errors.passwordTooShort"),
      position: "top",
    });
    return;
  }

  isChangingPassword.value = true;

  try {
    const response = await fetch(`${NITRO_BASE}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to change password");
    }

    $q.notify({
      type: "positive",
      message: t("pages.preferences.security.passwordChanged"),
      position: "top",
    });

    // Clear fields
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
  } catch (error: any) {
    $q.notify({
      type: "negative",
      message: error.message || t("pages.preferences.security.errors.changeFailed"),
      position: "top",
    });
  } finally {
    isChangingPassword.value = false;
  }
}
</script>

<template>
  <q-page class="q-pa-md prefs-page">
    <div class="page-header q-mb-md">
      <h1 class="text-h4 q-mb-xs">{{ t("pages.preferences.title") }}</h1>
      <div class="text-subtitle2 text-grey-6">{{ t("pages.preferences.subtitle") }}</div>
    </div>

    <div class="grid">
      <q-card class="glassy-card">
        <q-card-section class="q-gutter-md">
          <div class="text-h6">{{ t("pages.preferences.profile.title") }}</div>
          <q-input
            v-model="displayName"
            :label="t('pages.preferences.profile.displayName')"
            outlined
            dense
          />
          <q-toggle
            v-model="emailUpdates"
            color="primary"
            :label="t('pages.preferences.profile.emailUpdates')"
          />
          <q-banner dense rounded class="q-mt-sm" color="grey-3" text-color="grey-8">
            {{ t("pages.preferences.profile.hint") }}
          </q-banner>
        </q-card-section>
      </q-card>

      <q-card class="glassy-card">
        <q-card-section class="q-gutter-md">
          <div class="text-h6">{{ t("pages.preferences.quran.title") }}</div>
          <q-toggle
            v-model="showTransliteration"
            color="primary"
            :label="t('pages.preferences.quran.transliteration')"
          />
          <q-toggle
            v-model="rememberLastPage"
            color="primary"
            :label="t('pages.preferences.quran.remember')"
          />
          <q-banner dense rounded class="q-mt-sm" color="grey-3" text-color="grey-8">
            {{ t("pages.preferences.quran.hint") }}
          </q-banner>
        </q-card-section>
      </q-card>

      <q-card class="glassy-card">
        <q-card-section class="q-gutter-md">
          <div class="text-h6">{{ t("pages.preferences.appearance.title") }}</div>
          <q-btn-toggle
            v-model="themeMode"
            :options="themeModeOptions"
            color="primary"
            toggle-color="primary"
            unelevated
            outline
          />
          <q-banner dense rounded class="q-mt-sm" color="grey-3" text-color="grey-8">
            {{ t("pages.preferences.appearance.hint") }}
          </q-banner>
        </q-card-section>
      </q-card>

      <!-- Password Change Section -->
      <q-card class="glassy-card" v-if="isAuthenticated">
        <q-card-section class="q-gutter-md">
          <div class="text-h6">{{ t("pages.preferences.security.title") }}</div>
          
          <q-input
            v-model="currentPassword"
            :type="showCurrentPassword ? 'text' : 'password'"
            :label="t('pages.preferences.security.currentPassword')"
            outlined
            dense
          >
            <template v-slot:append>
              <q-icon
                :name="showCurrentPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showCurrentPassword = !showCurrentPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            :label="t('pages.preferences.security.newPassword')"
            outlined
            dense
          >
            <template v-slot:append>
              <q-icon
                :name="showNewPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showNewPassword = !showNewPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            :label="t('pages.preferences.security.confirmPassword')"
            outlined
            dense
          >
            <template v-slot:append>
              <q-icon
                :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>

          <div class="row q-gutter-sm">
            <q-btn
              outline
              color="secondary"
              icon="auto_awesome"
              :label="t('pages.preferences.security.generatePassword')"
              @click="suggestPassword"
              class="col"
            />
          </div>

          <q-btn
            color="primary"
            :label="t('pages.preferences.security.changePasswordBtn')"
            @click="handleChangePassword"
            :loading="isChangingPassword"
            :disable="!currentPassword || !newPassword || !confirmPassword"
          />

          <q-banner dense rounded class="q-mt-sm" color="grey-3" text-color="grey-8">
            {{ t("pages.preferences.security.hint") }}
          </q-banner>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.prefs-page {
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
</style>

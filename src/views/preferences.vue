<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.pinia'
import { useStorageRef } from '@/composables/useUStore'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const $q = useQuasar()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const THEME_MODE_KEY = 'pref-theme-mode'
const DARK_MODE_KEY = 'pref-dark-mode'
type ThemeMode = 'system' | 'light' | 'dark'

const themeModeStore = useStorageRef<ThemeMode>(THEME_MODE_KEY, 'light')
const themeMode = computed<ThemeMode>({
  get: () => themeModeStore.value.value,
  set: (mode) => themeModeStore.set(mode),
})
const darkModeStore = useStorageRef<boolean>(DARK_MODE_KEY, false)
const themeMediaQuery = ref<MediaQueryList | null>(null)

// Quran recitation highlight mode — shared with the reader page via same storage key
const HIGHLIGHT_MODE_KEY = 'quran-highlight-mode'
const highlightModeStore = useStorageRef<'word' | 'ayah'>(
  HIGHLIGHT_MODE_KEY,
  'word'
)
const highlightMode = computed<'word' | 'ayah'>({
  get: () => highlightModeStore.value.value ?? 'word',
  set: (mode) => highlightModeStore.set(mode),
})

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isProfileRoute = computed(() => route.name === 'Profile')
const pageTitle = computed(() =>
  isProfileRoute.value
    ? t('pages.preferences.profile.title')
    : t('pages.preferences.title')
)
const accountDeletionUsername = computed(() =>
  String(authStore.user?.username || '').trim()
)
const accountDeletionEmail = computed(() =>
  String(authStore.user?.email || '').trim()
)
const accountDeletionIdentifier = computed(
  () => accountDeletionUsername.value || accountDeletionEmail.value
)

const displayName = ref('')
const rememberLastPage = ref(true)
const showTransliteration = ref(false)
const emailUpdates = ref(false)

// Password change fields
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isChangingPassword = ref(false)
const deleteAccountConfirm = ref('')
const deleteAccountPassword = ref('')
const showDeletePassword = ref(false)
const isDeletingAccount = ref(false)

// Production always uses /api, dev can use local Nitro
const NITRO_BASE = import.meta.env.DEV
  ? import.meta.env.VITE_NITRO_BASE || 'http://localhost:3000'
  : '/api'

const themeModeOptions = computed(() => [
  {
    label: t('pages.preferences.appearance.themeOptions.system'),
    value: 'system',
  },
  {
    label: t('pages.preferences.appearance.themeOptions.light'),
    value: 'light',
  },
  { label: t('pages.preferences.appearance.themeOptions.dark'), value: 'dark' },
])

function applyThemeMode(mode: ThemeMode) {
  // Keep this behavior aligned with the app bootstrap in src/main.ts.
  // The app currently treats "system" as the light fallback instead of
  // following OS dark mode automatically.
  if (mode === 'system') {
    $q.dark.set(false)
    darkModeStore.set(false)
    return
  }
  const isDark = mode === 'dark'
  $q.dark.set(isDark)
  darkModeStore.set(isDark)
}

function handleSystemThemeChange() {
  if (themeMode.value !== 'system') return
  $q.dark.set(false)
  darkModeStore.set(false)
}

onMounted(() => {
  if (typeof window !== 'undefined' && 'matchMedia' in window) {
    themeMediaQuery.value = window.matchMedia('(prefers-color-scheme: dark)')
    themeMediaQuery.value.addEventListener('change', handleSystemThemeChange)
  }
  applyThemeMode(themeMode.value)
})

onBeforeUnmount(() => {
  if (themeMediaQuery.value) {
    themeMediaQuery.value.removeEventListener('change', handleSystemThemeChange)
  }
})

watch(themeMode, (mode) => {
  applyThemeMode(mode)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('theme-mode-changed', { detail: { mode } })
    )
  }
})

function generateStrongPassword() {
  const length = 16
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lowercase = 'abcdefghjkmnpqrstuvwxyz'
  const numbers = '23456789'
  const symbols = '!@#$%&*-+='

  const allChars = uppercase + lowercase + numbers + symbols
  let password = ''

  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')

  return password
}

function suggestPassword() {
  const generated = generateStrongPassword()
  newPassword.value = generated
  confirmPassword.value = generated
  showNewPassword.value = true
  showConfirmPassword.value = true

  $q.notify({
    type: 'info',
    message: t('pages.preferences.security.passwordGenerated'),
    position: 'top',
    timeout: 2000,
  })
}

async function getResponseErrorMessage(response: Response, fallback: string) {
  const raw = await response.text().catch(() => '')

  if (!raw) {
    return fallback
  }

  try {
    const parsed = JSON.parse(raw)
    return parsed?.statusMessage || parsed?.message || fallback
  } catch {
    return raw
  }
}

function confirmAccountDeletion() {
  return new Promise<boolean>((resolve) => {
    let settled = false
    const finish = (value: boolean) => {
      if (settled) return
      settled = true
      resolve(value)
    }

    $q.dialog({
      title: t('pages.preferences.security.deleteAccount.confirmDialogTitle'),
      message: t(
        'pages.preferences.security.deleteAccount.confirmDialogMessage'
      ),
      ok: {
        label: t('pages.preferences.security.deleteAccount.action'),
        color: 'negative',
        unelevated: true,
      },
      cancel: {
        label: t('cancel'),
        flat: true,
      },
    })
      .onOk(() => finish(true))
      .onCancel(() => finish(false))
      .onDismiss(() => finish(false))
  })
}

async function handleDeleteAccount() {
  const confirmText = deleteAccountConfirm.value.trim()

  if (!confirmText) {
    $q.notify({
      type: 'negative',
      message: t('pages.preferences.security.errors.confirmationRequired'),
      position: 'top',
    })
    return
  }

  if (
    confirmText !== accountDeletionUsername.value &&
    confirmText !== accountDeletionEmail.value
  ) {
    $q.notify({
      type: 'negative',
      message: t('pages.preferences.security.errors.confirmationMismatch'),
      position: 'top',
    })
    return
  }

  const confirmed = await confirmAccountDeletion()
  if (!confirmed) {
    return
  }

  isDeletingAccount.value = true

  try {
    const response = await fetch(`${NITRO_BASE}/auth/delete-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        confirmText,
        currentPassword: deleteAccountPassword.value.trim(),
      }),
    })

    if (!response.ok) {
      throw new Error(
        await getResponseErrorMessage(
          response,
          t('pages.preferences.security.errors.deleteFailed')
        )
      )
    }

    authStore.clearUserState({ notify: false })
    deleteAccountConfirm.value = ''
    deleteAccountPassword.value = ''
    showDeletePassword.value = false

    $q.notify({
      type: 'positive',
      message: t('pages.preferences.security.deleteAccount.success'),
      position: 'top',
    })

    await router.replace('/')
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message:
        error.message || t('pages.preferences.security.errors.deleteFailed'),
      position: 'top',
    })
  } finally {
    isDeletingAccount.value = false
  }
}

async function handleChangePassword() {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    $q.notify({
      type: 'negative',
      message: t('pages.preferences.security.errors.allFieldsRequired'),
      position: 'top',
    })
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    $q.notify({
      type: 'negative',
      message: t('pages.preferences.security.errors.passwordMismatch'),
      position: 'top',
    })
    return
  }

  if (newPassword.value.length < 8) {
    $q.notify({
      type: 'negative',
      message: t('pages.preferences.security.errors.passwordTooShort'),
      position: 'top',
    })
    return
  }

  isChangingPassword.value = true

  try {
    const response = await fetch(`${NITRO_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Failed to change password')
    }

    $q.notify({
      type: 'positive',
      message: t('pages.preferences.security.passwordChanged'),
      position: 'top',
    })

    // Clear fields
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message:
        error.message || t('pages.preferences.security.errors.changeFailed'),
      position: 'top',
    })
  } finally {
    isChangingPassword.value = false
  }
}
</script>

<template>
  <q-page class="q-pa-md prefs-page">
    <div class="page-header q-mb-md">
      <h1 class="text-h4 q-mb-xs">{{ pageTitle }}</h1>
      <div class="text-subtitle2 page-subtitle">
        {{ t('pages.preferences.subtitle') }}
      </div>
    </div>

    <div class="grid">
      <q-card class="glassy-card">
        <q-card-section class="q-gutter-md">
          <div class="text-h6">{{ t('pages.preferences.profile.title') }}</div>
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
          <q-banner dense rounded class="q-mt-sm hint-banner">
            {{ t('pages.preferences.profile.hint') }}
          </q-banner>
        </q-card-section>
      </q-card>

      <q-card class="glassy-card">
        <q-card-section class="q-gutter-md">
          <div class="text-h6">{{ t('pages.preferences.quran.title') }}</div>
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
          <div>
            <div class="text-caption text-grey-7 q-mb-xs">
              {{ t('pages.preferences.quran.highlightMode') }}
            </div>
            <q-btn-toggle
              v-model="highlightMode"
              :options="[
                { label: t('pages.preferences.quran.highlightWord'), value: 'word' },
                { label: t('pages.preferences.quran.highlightSentence'), value: 'ayah' },
              ]"
              color="primary"
              toggle-color="primary"
              unelevated
              outline
            />
          </div>
          <q-banner dense rounded class="q-mt-sm hint-banner">
            {{ t('pages.preferences.quran.hint') }}
          </q-banner>
        </q-card-section>
      </q-card>

      <q-card class="glassy-card">
        <q-card-section class="q-gutter-md">
          <div class="text-h6">
            {{ t('pages.preferences.appearance.title') }}
          </div>
          <q-btn-toggle
            v-model="themeMode"
            :options="themeModeOptions"
            color="primary"
            toggle-color="primary"
            unelevated
            outline
          />
          <q-banner dense rounded class="q-mt-sm hint-banner">
            {{ t('pages.preferences.appearance.hint') }}
          </q-banner>
        </q-card-section>
      </q-card>

      <!-- Password Change Section -->
      <q-card class="glassy-card" v-if="isAuthenticated">
        <q-card-section class="q-gutter-md">
          <div class="text-h6">{{ t('pages.preferences.security.title') }}</div>

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

          <q-banner dense rounded class="q-mt-sm hint-banner">
            {{ t('pages.preferences.security.hint') }}
          </q-banner>
        </q-card-section>
      </q-card>

      <q-card class="glassy-card danger-card" v-if="isAuthenticated">
        <q-card-section class="q-gutter-md">
          <div class="text-h6">
            {{ t('pages.preferences.security.deleteAccount.title') }}
          </div>

          <q-banner dense rounded class="danger-banner">
            <strong>
              {{ t('pages.preferences.security.deleteAccount.warningTitle') }}
            </strong>
            <div class="q-mt-xs">
              {{ t('pages.preferences.security.deleteAccount.warningBody') }}
            </div>
          </q-banner>

          <q-input
            v-model="deleteAccountConfirm"
            :label="t('pages.preferences.security.deleteAccount.confirmLabel')"
            outlined
            dense
          />

          <div
            v-if="accountDeletionIdentifier"
            class="text-caption deletion-hint"
          >
            {{
              t('pages.preferences.security.deleteAccount.confirmHint', {
                identifier: accountDeletionIdentifier,
              })
            }}
          </div>

          <q-input
            v-model="deleteAccountPassword"
            :type="showDeletePassword ? 'text' : 'password'"
            :label="t('pages.preferences.security.currentPassword')"
            outlined
            dense
          >
            <template v-slot:append>
              <q-icon
                :name="showDeletePassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showDeletePassword = !showDeletePassword"
              />
            </template>
          </q-input>

          <div class="text-caption deletion-hint">
            {{
              t('pages.preferences.security.deleteAccount.currentPasswordHint')
            }}
          </div>

          <q-btn
            color="negative"
            unelevated
            icon="delete_forever"
            :label="t('pages.preferences.security.deleteAccount.action')"
            @click="handleDeleteAccount"
            :loading="isDeletingAccount"
            :disable="!deleteAccountConfirm.trim() || isDeletingAccount"
          />
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

.page-subtitle {
  color: #5f6b7a;
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
  color: #1f2937;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

.hint-banner {
  background: rgba(15, 23, 42, 0.04);
  color: #475569;
  border: 1px solid rgba(148, 163, 184, 0.26);
}

.danger-card {
  border-color: rgba(239, 68, 68, 0.24);
}

.danger-banner {
  background: rgba(239, 68, 68, 0.12);
  color: #991b1b;
  border: 1px solid rgba(239, 68, 68, 0.24);
}

.deletion-hint {
  color: #64748b;
}

:global(body.body--dark) .prefs-page .page-subtitle {
  color: #cbd5e1;
}

:global(body.body--dark) .prefs-page .glassy-card {
  background: rgba(5, 5, 5, 0.96);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.55);
  color: #e5e7eb;
}

:global(body.body--dark) .prefs-page .hint-banner {
  background: rgba(148, 163, 184, 0.12);
  color: #e2e8f0;
  border-color: rgba(148, 163, 184, 0.2);
}

:global(body.body--dark) .prefs-page .danger-card {
  border-color: rgba(248, 113, 113, 0.3);
}

:global(body.body--dark) .prefs-page .danger-banner {
  background: rgba(127, 29, 29, 0.38);
  color: #fecaca;
  border-color: rgba(248, 113, 113, 0.3);
}

:global(body.body--dark) .prefs-page .deletion-hint {
  color: #cbd5e1;
}
</style>

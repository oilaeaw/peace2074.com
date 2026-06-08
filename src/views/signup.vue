<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const $q = useQuasar()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const acceptTerms = ref(false)

const env = (import.meta as any)?.env || {}
const DEFAULT_NITRO_PORT = 3000
const DEFAULT_MOBILE_API_BASE = 'https://peace2074.com/api'

function computeNitroBase() {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    const configured = env.VITE_NITRO_BASE

    // Explicit override always wins
    if (configured && typeof configured === 'string') {
      return configured.replace(/\/$/, '')
    }

    // Capacitor runtime is cross-origin from hosted API
    if (
      protocol === 'capacitor:' ||
      protocol === 'ionic:' ||
      protocol === 'app:'
    ) {
      return DEFAULT_MOBILE_API_BASE
    }

    // In browser context (including dev), use relative /api so the Vite proxy
    // handles routing to the Nitro server regardless of the bound hostname.
    return '/api'
  }
  return '/api'
}

const NITRO_BASE = computeNitroBase()

function isCapacitorLikeRuntime() {
  if (typeof window === 'undefined') return false
  const protocol = window.location?.protocol
  return (
    protocol === 'capacitor:' || protocol === 'ionic:' || protocol === 'app:'
  )
}

function isNetworkLikeError(err: any) {
  const msg = String(err?.message || '')
  return (
    err instanceof TypeError ||
    /load failed|failed to fetch|networkerror/i.test(msg)
  )
}

async function signupRequest(base: string) {
  return fetch(`${base}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      username: username.value,
      email: email.value,
      password: password.value,
    }),
  })
}

async function handleSignup() {
  if (
    !username.value ||
    !email.value ||
    !password.value ||
    !confirmPassword.value
  ) {
    $q.notify({
      type: 'warning',
      message: t('auth.fillAllFields'),
      position: 'top',
    })
    return
  }

  if (password.value !== confirmPassword.value) {
    $q.notify({
      type: 'negative',
      message: t('auth.passwordMismatch'),
      position: 'top',
    })
    return
  }

  if (password.value.length < 8) {
    $q.notify({
      type: 'negative',
      message: t('pages.preferences.security.errors.passwordTooShort'),
      position: 'top',
    })
    return
  }

  if (!acceptTerms.value) {
    $q.notify({
      type: 'warning',
      message: t('auth.acceptTerms'),
      position: 'top',
    })
    return
  }

  loading.value = true

  try {
    let response: Response

    try {
      response = await signupRequest(NITRO_BASE)
    } catch (err: any) {
      // Same mitigation as login for iOS WebView generic network failures.
      if (
        isCapacitorLikeRuntime() &&
        NITRO_BASE !== DEFAULT_MOBILE_API_BASE &&
        isNetworkLikeError(err)
      ) {
        response = await signupRequest(DEFAULT_MOBILE_API_BASE)
      } else {
        throw err
      }
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.statusMessage || t('auth.signupError'))
    }

    $q.notify({
      type: 'positive',
      message: t('auth.signupSuccess'),
      position: 'top',
    })

    // Navigation happens after the API call succeeds
    await router.push('/login')
  } catch (err: any) {
    const message = isNetworkLikeError(err)
      ? 'Unable to reach the server. Please check your connection and try again.'
      : err.message || t('auth.signupError')

    $q.notify({
      type: 'negative',
      message,
      position: 'top',
    })
    console.error('Signup error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="signup-container">
    <div class="signup-background">
      <div class="gradient-overlay"></div>
      <div class="pattern-overlay"></div>
    </div>

    <div class="signup-content">
      <q-card class="signup-card">
        <q-card-section class="text-center q-pb-none">
          <div class="logo-container">
            <q-icon name="mosque" size="64px" color="primary" />
          </div>
          <div class="text-h4 text-weight-bold q-mt-md">Peace2074</div>
          <div class="text-subtitle2 text-grey-7 q-mt-xs">
            {{ t('auth.createAccount') }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <form @submit.prevent="handleSignup" class="q-form q-gutter-md">
            <q-input
              v-model="username"
              data-testid="signup-username"
              outlined
              :label="t('auth.username')"
              :placeholder="t('auth.enterUsername')"
              :disable="loading"
              autocomplete="username"
              lazy-rules
              :rules="[(val) => !!val || t('auth.usernameRequired')]"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              v-model="email"
              data-testid="signup-email"
              outlined
              type="email"
              :label="t('auth.email')"
              :placeholder="t('auth.enterEmail')"
              :disable="loading"
              autocomplete="email"
              lazy-rules
              :rules="[(val) => !!val || t('email_required')]"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-input
              v-model="password"
              data-testid="signup-password"
              outlined
              :type="showPassword ? 'text' : 'password'"
              :label="t('auth.password')"
              :placeholder="t('auth.enterPassword')"
              :disable="loading"
              autocomplete="new-password"
              lazy-rules
              :rules="[
                (val) => !!val || t('auth.passwordRequired'),
                (val) =>
                  val.length >= 8 ||
                  t('pages.preferences.security.errors.passwordTooShort'),
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-input
              v-model="confirmPassword"
              data-testid="signup-confirm-password"
              outlined
              :type="showConfirmPassword ? 'text' : 'password'"
              :label="t('auth.confirmPassword')"
              :placeholder="t('confirm_password')"
              :disable="loading"
              autocomplete="new-password"
              lazy-rules
              :rules="[
                (val) => !!val || t('confirm_password'),
                (val) => val === password || t('auth.passwordMismatch'),
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </q-input>

            <q-checkbox
              v-model="acceptTerms"
              data-testid="signup-accept-terms"
              color="primary"
              dense
              :aria-label="`${t('auth.iAccept')} ${t('auth.termsAndConditions')}`"
            />

            <div class="terms-copy text-caption">
              <span>{{ t('auth.iAccept') }}</span>
              <router-link to="/terms" class="text-primary terms-link">{{
                t('auth.termsAndConditions')
              }}</router-link>
            </div>

            <q-btn
              type="submit"
              data-testid="signup-submit"
              color="primary"
              :label="t('auth.signUp')"
              class="full-width"
              size="lg"
              unelevated
              :loading="loading"
              :disable="
                !username ||
                !email ||
                !password ||
                !confirmPassword ||
                !acceptTerms
              "
            >
              <template v-slot:loading>
                <q-spinner-dots />
              </template>
            </q-btn>

            <div class="text-center q-mt-md">
              <span class="text-caption text-grey-7">{{
                t('auth.alreadyHaveAccount')
              }}</span>
              <q-btn
                flat
                dense
                color="primary"
                :label="t('auth.signIn')"
                class="text-caption"
                padding="xs"
                to="/login"
              />
            </div>
          </form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
.signup-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(env(safe-area-inset-top, 0px) + 24px)
    max(16px, env(safe-area-inset-right, 0px))
    calc(env(safe-area-inset-bottom, 0px) + 112px)
    max(16px, env(safe-area-inset-left, 0px));
  box-sizing: border-box;
  overflow: hidden;
}

.signup-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 0;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at 50% 0%,
    rgba(255, 255, 255, 0.1),
    transparent 60%
  );
}

.pattern-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/patterns/grid.svg');
  opacity: 0.05;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.signup-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 520px;
  padding: 24px 0 calc(env(safe-area-inset-bottom, 0px) + 96px);
  box-sizing: border-box;
}

.signup-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.terms-copy {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: -8px;
}

.terms-link {
  font-weight: 600;
}

.logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

body.body--dark .signup-background {
  background: #000;
}

body.body--dark .signup-card {
  background: #050505 !important;
  color: #f5f5f5;
}
</style>

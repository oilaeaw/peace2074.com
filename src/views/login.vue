<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'
import { Browser } from '@capacitor/browser'
import { App as CapApp } from '@capacitor/app'
import type { PluginListenerHandle } from '@capacitor/core'
import { useAuthStore } from '@/stores/auth.pinia'
import { useI18n } from 'vue-i18n'

type LoginViewEnv = {
  VITE_NITRO_BASE?: string
}

type IdentityWindow = Window & {
  netlifyIdentity?: {
    open: (view?: string) => void
  }
}

type ErrorWithMessage = {
  name?: string
  message?: string
}

type AuthHealthResponse = {
  oauth?: {
    google?: boolean
    apple?: boolean
  }
}

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const $q = useQuasar()

const username = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const showForgotDialog = ref(false)
const resetEmail = ref('')
const sendingReset = ref(false)
const passkeyLoading = ref(false)
const appleConfigured = ref<boolean | null>(null)
let appUrlOpenHandle: PluginListenerHandle | null = null

// Compute Nitro API base URL
const env = (import.meta as ImportMeta & { env?: LoginViewEnv }).env || {}
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

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:${DEFAULT_NITRO_PORT}`
    }

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

const passkeysSupported = computed(() => {
  if (typeof window === 'undefined') return false

  return Boolean(
    window.isSecureContext &&
    window.PublicKeyCredential &&
    window.navigator?.credentials &&
    !isCapacitorLikeRuntime()
  )
})

const appleAvailable = computed(() => appleConfigured.value === true)

function getErrorMessage(err: unknown) {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as ErrorWithMessage).message || '')
  }

  return String(err || '')
}

function isNetworkLikeError(err: unknown) {
  const msg = getErrorMessage(err)
  return (
    err instanceof TypeError ||
    /load failed|failed to fetch|networkerror/i.test(msg)
  )
}

async function loginRequest(base: string) {
  return fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      username: username.value,
      password: password.value,
    }),
  })
}

async function authHealthRequest(base: string) {
  return fetch(`${base}/auth/health`, {
    credentials: 'include',
  })
}

async function postAuthJson(
  base: string,
  path: string,
  body: Record<string, unknown>
) {
  return fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
}

async function parseErrorMessage(
  response: Response,
  fallback: string,
  statusMessages: Partial<Record<number, string>> = {}
) {
  const data = await response.json().catch(() => ({}))
  return statusMessages[response.status] || data.statusMessage || fallback
}

function isPasskeyCancelled(err: unknown) {
  const error = (
    err && typeof err === 'object' ? err : null
  ) as ErrorWithMessage | null
  const message = getErrorMessage(err)
  return (
    error?.name === 'AbortError' ||
    error?.name === 'NotAllowedError' ||
    /not allowed|timed out|abort|cancel/i.test(message)
  )
}

function getPasskeyErrorMessage(err: unknown, fallback: string) {
  if (isPasskeyCancelled(err)) {
    return t('auth.passkeyCancelled')
  }

  return getErrorMessage(err) || fallback
}

function confirmPasskeyEnrollment() {
  return new Promise<boolean>((resolve) => {
    let settled = false
    const finish = (value: boolean) => {
      if (settled) return
      settled = true
      resolve(value)
    }

    $q.dialog({
      title: t('auth.passkeyCreatePromptTitle'),
      message: t('auth.passkeyCreatePromptMessage'),
      ok: {
        label: t('auth.passkeyCreatePromptConfirm'),
        color: 'primary',
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

async function maybeOfferPasskeyEnrollment() {
  if (!passkeysSupported.value) return

  try {
    const optionsResponse = await postAuthJson(
      NITRO_BASE,
      '/auth/passkey/register/options',
      {}
    )
    if (!optionsResponse.ok) return

    const data = await optionsResponse.json()
    if (data.hasExistingPasskeys) return

    const shouldCreate = await confirmPasskeyEnrollment()
    if (!shouldCreate) return

    const registrationResponse = await startRegistration({
      optionsJSON: data.options,
      useAutoRegister: true,
    })

    const verifyResponse = await postAuthJson(
      NITRO_BASE,
      '/auth/passkey/register/verify',
      {
        requestId: data.requestId,
        registrationResponse,
      }
    )

    if (!verifyResponse.ok) {
      throw new Error(
        await parseErrorMessage(verifyResponse, t('auth.passkeyCreateError'))
      )
    }

    $q.notify({
      type: 'positive',
      message: t('auth.passkeyCreated'),
      position: 'top',
    })
  } catch (err: unknown) {
    if (isPasskeyCancelled(err)) return

    console.warn('Passkey enrollment skipped:', err)
    $q.notify({
      type: 'warning',
      message: getPasskeyErrorMessage(err, t('auth.passkeyCreateError')),
      position: 'top',
    })
  }
}

async function handlePasskeyLogin() {
  if (!passkeysSupported.value) {
    $q.notify({
      type: 'warning',
      message: t('auth.passkeyNotSupported'),
      position: 'top',
    })
    return
  }

  passkeyLoading.value = true

  try {
    const optionsResponse = await postAuthJson(
      NITRO_BASE,
      '/auth/passkey/login/options',
      {
        username: username.value.trim() || undefined,
      }
    )

    if (!optionsResponse.ok) {
      throw new Error(
        await parseErrorMessage(optionsResponse, t('auth.passkeyLoginError'), {
          404: t('auth.passkeyUnavailable'),
        })
      )
    }

    const data = await optionsResponse.json()
    const authenticationResponse = await startAuthentication({
      optionsJSON: data.options,
    })

    const verifyResponse = await postAuthJson(
      NITRO_BASE,
      '/auth/passkey/login/verify',
      {
        requestId: data.requestId,
        authenticationResponse,
      }
    )

    if (!verifyResponse.ok) {
      throw new Error(
        await parseErrorMessage(verifyResponse, t('auth.passkeyLoginError'))
      )
    }

    const result = await verifyResponse.json()
    authStore.setUser(result.user)

    $q.notify({
      type: 'positive',
      message: t('auth.passkeyLoginSuccess'),
      position: 'top',
    })

    router.push(getPostLoginPath())
  } catch (err: unknown) {
    const notificationType = isPasskeyCancelled(err) ? 'info' : 'negative'
    $q.notify({
      type: notificationType,
      message: getPasskeyErrorMessage(err, t('auth.passkeyLoginError')),
      position: 'top',
    })

    if (!isPasskeyCancelled(err)) {
      console.error('Passkey login error:', err)
    }
  } finally {
    passkeyLoading.value = false
  }
}

function getPostLoginPath() {
  const redirect = String(route.query.redirect || '').trim()
  if (
    redirect.startsWith('/') &&
    !redirect.startsWith('//') &&
    redirect !== '/login' &&
    redirect !== '/signup'
  ) {
    return redirect
  }

  if (typeof window !== 'undefined' && window.document?.referrer) {
    try {
      const ref = new URL(window.document.referrer)
      if (ref.origin === window.location.origin) {
        const refPath = `${ref.pathname}${ref.search}${ref.hash}`
        if (
          refPath.startsWith('/') &&
          refPath !== '/login' &&
          refPath !== '/signup'
        ) {
          return refPath
        }
      }
    } catch {
      /* noop */
    }
  }

  return '/'
}

async function loadAuthAvailability() {
  try {
    let response: Response

    try {
      response = await authHealthRequest(NITRO_BASE)
    } catch (err: unknown) {
      if (
        isCapacitorLikeRuntime() &&
        NITRO_BASE !== DEFAULT_MOBILE_API_BASE &&
        isNetworkLikeError(err)
      ) {
        response = await authHealthRequest(DEFAULT_MOBILE_API_BASE)
      } else {
        throw err
      }
    }

    if (!response.ok) return

    const data = (await response.json().catch(() => ({}))) as AuthHealthResponse

    if (typeof data?.oauth?.apple === 'boolean') {
      appleConfigured.value = data.oauth.apple
    }
  } catch (err: unknown) {
    console.warn('Failed to load OAuth availability:', err)
  }
}

async function handleOAuthErrorFromRoute() {
  const oauthError = String(route.query.oauthError || '').trim()
  if (!oauthError) return

  const sessionUser = await authStore.hydrateSession()
  if (sessionUser || authStore.isAuthenticated) {
    const nextQuery = { ...route.query }
    delete nextQuery.oauthError
    await router.replace({ path: '/', query: nextQuery })
    return
  }

  if (oauthError === 'apple-not-configured') {
    $q.notify({
      type: 'warning',
      message: t('auth.appleSignInUnavailable'),
      position: 'top',
    })
  } else if (oauthError === 'google-state-invalid') {
    $q.notify({
      type: 'negative',
      message: t('auth.googleSignInExpired'),
      position: 'top',
    })
  } else if (oauthError === 'apple-state-invalid') {
    $q.notify({
      type: 'negative',
      message: t('auth.appleSignInExpired'),
      position: 'top',
    })
  } else if (oauthError === 'oauth-state-invalid') {
    $q.notify({
      type: 'negative',
      message: t('auth.socialSignInExpired'),
      position: 'top',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: t('auth.loginError'),
      position: 'top',
    })
  }

  const nextQuery = { ...route.query }
  delete nextQuery.oauthError
  await router.replace({ query: nextQuery })
}

function openSocialLogin(provider: 'google' | 'apple') {
  if (provider === 'apple' && !appleAvailable.value) {
    $q.notify({
      type: 'warning',
      message: t('auth.appleSignInUnavailable'),
      position: 'top',
    })
    return
  }

  const ts = Date.now()

  if (isCapacitorLikeRuntime()) {
    // On iOS native, use SFSafariViewController (in-app browser) as required by Apple Guideline 4.
    // The ?native=1 param tells the server callback to redirect back via the peace2074:// deep link
    // instead of https://peace2074.com/, which would take the user out of the native app.
    const oauthUrl = `${NITRO_BASE}/auth/${provider}?ts=${ts}&native=1`
    void Browser.open({ url: oauthUrl, presentationStyle: 'popover' })
  } else {
    const oauthUrl = `${NITRO_BASE}/auth/${provider}?ts=${ts}`
    window.location.href = oauthUrl
  }
}

async function handleNativeOAuthCallback(url: string) {
  try {
    const parsed = new URL(url)
    const authComplete = parsed.searchParams.get('authComplete')
    const oauthError = parsed.searchParams.get('oauthError')

    await Browser.close().catch(() => {
      /* browser may already be closed */
    })

    if (authComplete === '1') {
      const user = await authStore.hydrateSession()
      if (user || authStore.isAuthenticated) {
        $q.notify({
          type: 'positive',
          message: t('auth.loginSuccess'),
          position: 'top',
        })
        await router.push(getPostLoginPath())
      }
    } else if (oauthError) {
      await router.replace({ path: '/login', query: { oauthError } })
      void handleOAuthErrorFromRoute()
    }
  } catch (err) {
    console.error('[login] Native OAuth callback error:', err)
  }
}

function handleGoogleLogin() {
  openSocialLogin('google')
}

function handleAppleLogin() {
  openSocialLogin('apple')
}

async function handleLogin() {
  if (!username.value || !password.value) {
    $q.notify({
      type: 'warning',
      message: t('auth.enterCredentials'),
      position: 'top',
    })
    return
  }

  loading.value = true

  try {
    let response: Response

    try {
      response = await loginRequest(NITRO_BASE)
    } catch (err: unknown) {
      // iOS WebView sometimes surfaces cross-origin/preflight/network issues as
      // generic "Load failed". Fallback to canonical mobile API base.
      if (
        isCapacitorLikeRuntime() &&
        NITRO_BASE !== DEFAULT_MOBILE_API_BASE &&
        isNetworkLikeError(err)
      ) {
        response = await loginRequest(DEFAULT_MOBILE_API_BASE)
      } else {
        throw err
      }
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.statusMessage || t('auth.loginError'))
    }

    const data = await response.json()

    authStore.setUser(data.user)

    $q.notify({
      type: 'positive',
      message: t('auth.loginSuccess'),
      position: 'top',
    })

    await maybeOfferPasskeyEnrollment()

    router.push(getPostLoginPath())
  } catch (err: unknown) {
    const message = isNetworkLikeError(err)
      ? 'Unable to reach the server. Please check your connection and try again.'
      : getErrorMessage(err) || t('auth.loginError')

    $q.notify({
      type: 'negative',
      message,
      position: 'top',
    })
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

function handleForgotPassword() {
  showForgotDialog.value = true
}

async function handleResetRequest() {
  if (!resetEmail.value) {
    $q.notify({
      type: 'warning',
      message: t('auth.enterEmail'),
      position: 'top',
    })
    return
  }

  sendingReset.value = true

  try {
    // TODO: Implement actual password reset endpoint
    await new Promise((resolve) => setTimeout(resolve, 1500))

    $q.notify({
      type: 'positive',
      message: t('auth.resetEmailSent'),
      position: 'top',
    })

    showForgotDialog.value = false
    resetEmail.value = ''
  } catch (err: unknown) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(err) || t('auth.resetError'),
      position: 'top',
    })
  } finally {
    sendingReset.value = false
  }
}

onMounted(() => {
  void loadAuthAvailability()
  void handleOAuthErrorFromRoute()

  if (isCapacitorLikeRuntime()) {
    void CapApp.addListener('appUrlOpen', ({ url }) => {
      if (url.startsWith('peace2074://auth/callback')) {
        void handleNativeOAuthCallback(url)
      }
    }).then((handle) => {
      appUrlOpenHandle = handle
    })
  }
})

onUnmounted(() => {
  appUrlOpenHandle?.remove()
})
</script>

<template>
  <div class="login-container">
    <div class="login-background">
      <div class="gradient-overlay"></div>
      <div class="pattern-overlay"></div>
    </div>

    <div class="login-content">
      <q-card class="login-card">
        <!-- Logo Section -->
        <q-card-section class="text-center q-pb-none">
          <div class="logo-container">
            <q-icon name="mosque" size="64px" color="primary" />
          </div>
          <div class="text-h4 text-weight-bold q-mt-md">Peace2074</div>
          <div class="text-subtitle2 text-grey-7 q-mt-xs">
            {{ t('auth.welcomeBack') }}
          </div>
        </q-card-section>

        <!-- Login Form -->
        <q-card-section class="q-pt-md">
          <q-form class="q-gutter-md" @submit.prevent="handleLogin">
            <q-input
              v-model="username"
              data-testid="login-username"
              outlined
              :label="t('auth.username')"
              :placeholder="t('auth.enterUsername')"
              :disable="loading"
              autocomplete="username"
              lazy-rules
              :rules="[(val) => !!val || t('auth.usernameRequired')]"
            >
              <template #prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              v-model="password"
              data-testid="login-password"
              outlined
              :type="showPassword ? 'text' : 'password'"
              :label="t('auth.password')"
              :placeholder="t('auth.enterPassword')"
              :disable="loading"
              autocomplete="current-password"
              lazy-rules
              :rules="[(val) => !!val || t('auth.passwordRequired')]"
            >
              <template #prepend>
                <q-icon name="lock" />
              </template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <div class="row items-center justify-between">
              <q-checkbox
                v-model="rememberMe"
                :label="t('auth.rememberMe')"
                color="primary"
                dense
              />
              <q-btn
                flat
                dense
                color="primary"
                :label="t('auth.forgotPassword')"
                class="text-caption"
                padding="none"
                @click="handleForgotPassword"
              />
            </div>

            <q-btn
              type="submit"
              data-testid="login-submit"
              color="primary"
              :label="t('auth.signIn')"
              class="full-width"
              size="lg"
              unelevated
              :loading="loading"
              :disable="!username || !password || passkeyLoading"
            >
              <template #loading>
                <q-spinner-dots />
              </template>
            </q-btn>

            <q-btn
              v-if="passkeysSupported"
              outline
              color="primary"
              icon="fingerprint"
              :label="t('auth.signInWithPasskey')"
              class="full-width q-mt-sm"
              size="lg"
              :loading="passkeyLoading"
              :disable="loading"
              @click="handlePasskeyLogin"
            >
              <template #loading>
                <q-spinner-dots />
              </template>
            </q-btn>

            <div
              v-if="passkeysSupported"
              class="text-caption text-grey-7 text-center q-mt-sm"
            >
              {{ t('auth.passkeyHint') }}
            </div>

            <div class="q-mt-md">
              <div class="row items-center q-mb-sm">
                <div class="col"><q-separator /></div>
                <div class="col-auto q-px-md text-caption text-grey-7">
                  {{ t('auth.orContinueWith') }}
                </div>
                <div class="col"><q-separator /></div>
              </div>

              <q-btn
                unelevated
                data-testid="login-google"
                color="primary"
                class="full-width"
                size="md"
                :disable="loading"
                @click="handleGoogleLogin"
              >
                <q-icon name="fab fa-google" size="20px" class="q-mr-sm" />
                {{ t('sign_in_with_google', 'Sign in with Google') }}
              </q-btn>

              <q-btn
                outline
                data-testid="login-apple"
                color="dark"
                class="full-width q-mt-sm"
                size="md"
                :disable="loading || !appleAvailable"
                @click="handleAppleLogin"
              >
                <q-icon name="fab fa-apple" size="20px" class="q-mr-sm" />
                {{ t('auth.signInWithApple', 'Sign in with Apple') }}
              </q-btn>

              <div
                v-if="!appleAvailable"
                class="text-caption text-negative q-mt-xs"
              >
                {{ t('auth.appleSignInUnavailable') }}
              </div>
            </div>

            <div class="text-center q-mt-md">
              <span class="text-caption text-grey-7">{{
                t('auth.dontHaveAccount')
              }}</span>
              <q-btn
                flat
                dense
                color="primary"
                :label="t('auth.signUp')"
                class="text-caption"
                padding="xs"
                to="/signup"
              />
            </div>
          </q-form>
        </q-card-section>

        <!-- Forgot Password Dialog -->
        <q-dialog v-model="showForgotDialog">
          <q-card style="min-width: 400px">
            <q-card-section>
              <div class="text-h6">{{ t('auth.resetPassword') }}</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <p class="text-body2 text-grey-7">
                {{ t('auth.resetInstructions') }}
              </p>
              <q-input
                v-model="resetEmail"
                outlined
                type="email"
                :label="t('auth.email')"
                :placeholder="t('auth.enterEmail')"
                :disable="sendingReset"
                autocomplete="email"
              >
                <template #prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                v-close-popup
                flat
                :label="t('cancel')"
                color="grey-7"
                :disable="sendingReset"
              />
              <q-btn
                unelevated
                :label="t('auth.sendResetLink')"
                color="primary"
                :loading="sendingReset"
                @click="handleResetRequest"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0 112px;
  box-sizing: border-box;
  overflow: hidden;
}

.login-background {
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
  background: linear-gradient(
    45deg,
    rgba(102, 126, 234, 0.9) 0%,
    rgba(118, 75, 162, 0.9) 100%
  );
}

.pattern-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(
      circle at 20% 50%,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 40% 20%,
      rgba(255, 255, 255, 0.03) 0%,
      transparent 50%
    );
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

.login-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  padding: 20px;
  padding-bottom: 96px;
  box-sizing: border-box;
}

.login-card {
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.98);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
  }
}

.logo-container .q-icon {
  color: white !important;
}

:deep(.q-field__control) {
  border-radius: 12px;
}

:deep(.q-btn) {
  border-radius: 12px;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
}

:deep(.q-checkbox__label) {
  font-size: 14px;
}

@media (max-width: 600px) {
  .login-content {
    padding: 16px;
    padding-bottom: 112px;
  }

  .login-card {
    border-radius: 16px;
  }

  .logo-container {
    width: 80px;
    height: 80px;
  }

  .logo-container .q-icon {
    font-size: 48px;
  }
}

body.body--dark .login-background {
  background: #000;
}

body.body--dark .login-card {
  background: #050505 !important;
  color: #f5f5f5;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.pinia'
import { useI18n } from 'vue-i18n'

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

// Compute Nitro API base URL
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
    if (protocol === 'capacitor:' || protocol === 'ionic:' || protocol === 'app:') {
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

function getPostLoginPath() {
  const redirect = String(route.query.redirect || '').trim()
  if (redirect.startsWith('/') && !redirect.startsWith('//') && redirect !== '/login' && redirect !== '/signup') {
    return redirect
  }

  if (typeof window !== 'undefined' && window.document?.referrer) {
    try {
      const ref = new URL(window.document.referrer)
      if (ref.origin === window.location.origin) {
        const refPath = `${ref.pathname}${ref.search}${ref.hash}`
        if (refPath.startsWith('/') && refPath !== '/login' && refPath !== '/signup') {
          return refPath
        }
      }
    } catch {
      /* noop */
    }
  }

  return '/'
}

function handleGitHubLogin() {
  // Redirect to GitHub OAuth authorize endpoint
  window.location.href = `${NITRO_BASE}/auth/github/authorize`
}

function handleNetlifyLogin() {
  // Open Netlify Identity modal
  if (typeof window !== 'undefined' && (window as any).netlifyIdentity) {
    (window as any).netlifyIdentity.open('login')
  }
}

async function handleLogin() {
  if (!username.value || !password.value) {
    $q.notify({
      type: 'warning',
      message: t('auth.enterCredentials'),
      position: 'top'
    })
    return
  }

  loading.value = true

  try {
    const response = await fetch(`${NITRO_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.statusMessage || t('auth.loginError'))
    }

    const data = await response.json()
    
    authStore.setUser(data.user)
    
    $q.notify({
      type: 'positive',
      message: t('auth.loginSuccess'),
      position: 'top'
    })
    
    router.push(getPostLoginPath())
    
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || t('auth.loginError'),
      position: 'top'
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
      position: 'top'
    })
    return
  }

  sendingReset.value = true

  try {
    // TODO: Implement actual password reset endpoint
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    $q.notify({
      type: 'positive',
      message: t('auth.resetEmailSent'),
      position: 'top'
    })
    
    showForgotDialog.value = false
    resetEmail.value = ''
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || t('auth.resetError'),
      position: 'top'
    })
  } finally {
    sendingReset.value = false
  }
}
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
          <q-form @submit.prevent="handleLogin" class="q-gutter-md">
            <q-input
              v-model="username"
              outlined
              :label="t('auth.username')"
              :placeholder="t('auth.enterUsername')"
              :disable="loading"
              autocomplete="username"
              lazy-rules
              :rules="[val => !!val || t('auth.usernameRequired')]"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              v-model="password"
              outlined
              :type="showPassword ? 'text' : 'password'"
              :label="t('auth.password')"
              :placeholder="t('auth.enterPassword')"
              :disable="loading"
              autocomplete="current-password"
              lazy-rules
              :rules="[val => !!val || t('auth.passwordRequired')]"
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
              color="primary"
              :label="t('auth.signIn')"
              class="full-width"
              size="lg"
              unelevated
              :loading="loading"
              :disable="!username || !password"
            >
              <template v-slot:loading>
                <q-spinner-dots />
              </template>
            </q-btn>

            <div class="q-mt-md">
              <div class="row items-center q-mb-sm">
                <div class="col"><q-separator /></div>
                <div class="col-auto q-px-md text-caption text-grey-7">{{ t('auth.orContinueWith') }}</div>
                <div class="col"><q-separator /></div>
              </div>
              
              <q-btn
                outline
                color="grey-8"
                class="full-width"
                size="md"
                @click="handleGitHubLogin"
                :disable="loading"
              >
                <q-icon name="fab fa-github" size="20px" class="q-mr-sm" />
                {{ t('auth.signInWithGitHub') }}
              </q-btn>

              <q-btn
                unelevated
                color="primary"
                class="full-width q-mt-sm"
                size="md"
                @click="handleNetlifyLogin"
                :disable="loading"
              >
                <q-icon name="bolt" size="20px" class="q-mr-sm" />
                {{ t('auth.signInWithNetlify') }}
              </q-btn>
            </div>

            <div class="text-center q-mt-md">
              <span class="text-caption text-grey-7">{{ t('auth.dontHaveAccount') }}</span>
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
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              :label="t('cancel')"
              color="grey-7"
              v-close-popup
              :disable="sendingReset"
            />
            <q-btn
              unelevated
              :label="t('auth.sendResetLink')"
              color="primary"
              @click="handleResetRequest"
              :loading="sendingReset"
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
  background: linear-gradient(45deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
}

.pattern-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
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
  0%, 100% {
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
</style>

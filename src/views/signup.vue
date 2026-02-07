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

function computeNitroBase() {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Dev: check for override, otherwise use local Nitro
      const configured = env.VITE_NITRO_BASE
      if (configured && typeof configured === 'string') {
        return configured.replace(/\/$/, '')
      }
      return `${protocol}//${hostname}:${DEFAULT_NITRO_PORT}`
    }
    // Production: always use /api prefix for Netlify Functions routing
    return '/api'
  }
  return '/api'
}

const NITRO_BASE = computeNitroBase()

async function handleSignup() {
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    $q.notify({
      type: 'warning',
      message: t('auth.fillAllFields') || 'Please fill all fields',
      position: 'top'
    })
    return
  }

  if (password.value !== confirmPassword.value) {
    $q.notify({
      type: 'negative',
      message: t('auth.passwordMismatch') || 'Passwords do not match',
      position: 'top'
    })
    return
  }

  if (password.value.length < 8) {
    $q.notify({
      type: 'negative',
      message: t('pages.preferences.security.errors.passwordTooShort') || 'Password must be at least 8 characters',
      position: 'top'
    })
    return
  }

  if (!acceptTerms.value) {
    $q.notify({
      type: 'warning',
      message: t('auth.acceptTerms') || 'Please accept the terms and conditions',
      position: 'top'
    })
    return
  }

  loading.value = true

  try {
    const response = await fetch(`${NITRO_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value
      })
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.statusMessage || 'Signup failed')
    }

    $q.notify({
      type: 'positive',
      message: t('auth.signupSuccess') || 'Account created successfully! Please login.',
      position: 'top'
    })
    
    router.push('/login')
    
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || t('auth.signupError') || 'Signup failed. Please try again.',
      position: 'top'
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
            {{ t('auth.createAccount') || 'Create your account' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="handleSignup" class="q-gutter-md">
            <q-input
              v-model="username"
              outlined
              :label="t('auth.username') || 'Username'"
              :placeholder="t('auth.enterUsername') || 'Choose a username'"
              :disable="loading"
              autocomplete="username"
              lazy-rules
              :rules="[val => !!val || 'Username is required']"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              v-model="email"
              outlined
              type="email"
              :label="t('auth.email') || 'Email'"
              :placeholder="t('auth.enterEmail') || 'Enter your email'"
              :disable="loading"
              autocomplete="email"
              lazy-rules
              :rules="[val => !!val || 'Email is required']"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-input
              v-model="password"
              outlined
              :type="showPassword ? 'text' : 'password'"
              :label="t('auth.password') || 'Password'"
              :placeholder="t('auth.enterPassword') || 'Choose a password'"
              :disable="loading"
              autocomplete="new-password"
              lazy-rules
              :rules="[val => !!val || 'Password is required', val => val.length >= 8 || 'Minimum 8 characters']"
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
              outlined
              :type="showConfirmPassword ? 'text' : 'password'"
              :label="t('auth.confirmPassword') || 'Confirm Password'"
              :placeholder="t('auth.confirmPassword') || 'Re-enter password'"
              :disable="loading"
              autocomplete="new-password"
              lazy-rules
              :rules="[val => !!val || 'Please confirm password', val => val === password || 'Passwords must match']"
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
              color="primary"
              dense
            >
              <template v-slot:default>
                <span class="text-caption">
                  {{ t('auth.iAccept') || 'I accept the' }}
                  <router-link to="/terms" class="text-primary">{{ t('auth.termsAndConditions') || 'terms and conditions' }}</router-link>
                </span>
              </template>
            </q-checkbox>

            <q-btn
              type="submit"
              color="primary"
              :label="t('auth.signUp') || 'Sign Up'"
              class="full-width"
              size="lg"
              unelevated
              :loading="loading"
              :disable="!username || !email || !password || !confirmPassword || !acceptTerms"
            >
              <template v-slot:loading>
                <q-spinner-dots />
              </template>
            </q-btn>

            <div class="text-center q-mt-md">
              <span class="text-caption text-grey-7">{{ t('auth.alreadyHaveAccount') || 'Already have an account?' }}</span>
              <q-btn
                flat
                dense
                color="primary"
                :label="t('auth.signIn') || 'Sign In'"
                class="text-caption"
                padding="xs"
                to="/login"
              />
            </div>
          </q-form>
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
  background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.1), transparent 60%);
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
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.signup-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  padding: 24px;
}

.signup-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>

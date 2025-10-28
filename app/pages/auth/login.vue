<script lang="ts" setup>
import { reactive, ref, watch } from '#imports'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/store/auth.pinia'

definePageMeta({
  layout: 'q-layout',
  title: 'navigation.AuthPageTitle',
  description: 'User login and authentication',
})

const $q = useQuasar()
const { t, locale } = useI18n()
const auth = useAuthStore()

const loading = ref(false)
const router = useRouter()

const isSignup = ref(false)
const signupPayload = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
})

const loginPayload = reactive({ identifier: '', password: '' })
const showPassword = ref(false)
const showResend = ref(false)
const lastTriedEmail = ref('')

async function onSubmit() {
  loading.value = true
  showResend.value = false
  try {
    // The payload now uses 'username', which the Passport 'local' strategy expects.
    const payload = {
      password: loginPayload.password,
      username: loginPayload.identifier,
    }
    // Only remember last tried email if it looks like an email
    if (
      typeof loginPayload.identifier === 'string'
      && loginPayload.identifier.includes('@')
    ) {
      lastTriedEmail.value = loginPayload.identifier
    }

    const { data, error } = await useFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    if (error?.value) {
      if (error.value.statusCode === 403)
        showResend.value = true
      const emsg
        = (error.value.data
          && (error.value.data.statusMessage || error.value.data.message))
        || error.value.statusMessage
        || error.value.message
        || 'Login failed'
      throw new Error(emsg)
    }
    const result = data?.value
    if (result && result.user) {
      // server sets httpOnly cookie for auth; fetch current user to populate client state
      auth.setUserInfo(result.user)

      $q.notify({ message: t('login_success'), type: 'positive' })
      await router.push('/')
    }
    else {
      throw new Error('Invalid login response')
    }
  }
  catch (err: any) {
    console.error('Authentication error', err)
    $q.notify({ message: err.message || t('login_failed'), type: 'negative' })
  }
  finally {
    loading.value = false
  }
}

function onReset() {
  loginPayload.identifier = ''
  loginPayload.password = ''
}

function onGoogleLogin() {
  window.location.href = '/api/auth/google'
}
function onGithubLogin() {
  window.location.href = '/api/auth/github'
}

async function onSignup() {
  loading.value = true
  try {
    if (!signupPayload.email || !signupPayload.password || !signupPayload.username) {
      throw new Error(t('please_fill_all_fields') || 'Please fill all fields')
    }
    if (signupPayload.password !== signupPayload.confirmPassword) {
      throw new Error(t('passwords_do_not_match') || 'Passwords don\'t match')
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: signupPayload.email,
        username: signupPayload.username,
        password: signupPayload.password,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || t('signup_failed') || 'Signup failed')
    }

    $q.notify({
      message:
        t('signup_success') || 'Account created — please check your email to verify',
      type: 'positive',
    })
    // After signup, switch back to login view
    isSignup.value = false
    // Optionally pre-fill the email/username in login form
    loginPayload.identifier = signupPayload.email
    signupPayload.email = ''
    signupPayload.username = ''
    signupPayload.password = ''
    signupPayload.confirmPassword = ''
  }
  catch (err: any) {
    console.error('Signup error', err)
    $q.notify({ message: err.message || t('signup_failed'), type: 'negative' })
  }
  finally {
    loading.value = false
  }
}

function switchLang(lang: string) {
  locale.value = lang
}

watch(
  () => isSignup.value,
  (val) => {
    useHead({ title: val ? t('sign_up') : t('login') })
  },
  { immediate: true },
)

async function resendVerification() {
  if (!lastTriedEmail.value)
    return
  loading.value = true
  try {
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: lastTriedEmail.value }),
    })
    if (!res.ok)
      throw new Error('Failed to resend verification email')
    $q.notify({ message: t('verification_email_resent'), type: 'positive' })
    showResend.value = false
  }
  catch {
    $q.notify({ message: t('error_resending_verification'), type: 'negative' })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <q-page>
    <q-card class="my-card">
      <q-card-section>
        <div class="q-mb-md row items-center justify-end">
          <q-btn
            dense
            flat
            color="primary"
            label="English"
            :disable="locale === 'en'"
            class="q-mr-xs"
            @click="switchLang('en')"
          />
          <q-btn
            dense
            flat
            color="primary"
            label="العربية"
            :disable="locale === 'ar'"
            class="q-mr-xs"
            @click="switchLang('ar')"
          />
          <q-btn
            dense
            flat
            color="primary"
            label="Deutsch"
            :disable="locale === 'de'"
            class="q-mr-xs"
            @click="switchLang('de')"
          />
          <q-btn
            dense
            flat
            color="primary"
            label="Русский"
            :disable="locale === 'ru'"
            class="q-mr-xs"
            @click="switchLang('ru')"
          />
        </div>

        <h1 class="text-h5 q-mb-md">
          {{ isSignup ? t("sign_up") : t("login") }}
        </h1>

        <div v-if="auth.isAuthenticated">
          <q-banner class="q-mb-md" dense>
            {{ t("already_logged_in") }}
            <q-btn
              color="primary"
              flat
              @click="
                () => {
                  auth.logout();
                  $q.notify({ message: t('logout_success'), type: 'positive' });
                }
              "
            >
              {{ t("logout") }}
            </q-btn>
          </q-banner>
        </div>

        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-sm">
              <div class="row items-center justify-end">
                <q-btn dense flat color="primary" @click="isSignup = !isSignup">
                  {{ isSignup ? t("back_to_login") : t("create_account") }}
                </q-btn>
              </div>
            </div>

            <!-- Signup form -->
            <q-form v-if="isSignup" class="q-gutter-md" @submit.prevent="onSignup">
              <q-input
                v-model="signupPayload.username"
                type="text"
                :label="t('username')"
                :rules="[(val) => !!val || t('username_required')]"
              />
              <q-input
                v-model="signupPayload.email"
                type="email"
                :label="t('email')"
                :rules="[(val) => !!val || t('email_required')]"
              />
              <q-input
                v-model="signupPayload.password"
                :type="showPassword ? 'text' : 'password'"
                :label="t('password')"
                :rules="[(val) => !!val || t('password_required')]"
              >
                <template #append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
              <q-input
                v-model="signupPayload.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                :label="t('confirm_password')"
              />
              <div>
                <q-btn
                  :loading="loading"
                  :label="t('sign_up')"
                  type="submit"
                  color="primary"
                />
                <q-btn
                  flat
                  class="q-ml-sm"
                  :label="t('cancel')"
                  @click="isSignup = false"
                />
              </div>
            </q-form>

            <!-- Login form -->
            <q-form
              v-else
              class="q-gutter-md"
              @submit.prevent="onSubmit"
              @reset="onReset"
            >
              <q-input
                v-model="loginPayload.identifier"
                type="text"
                label="Email or Username"
                autocomplete="username"
                :rules="[(val) => !!val || 'Email or username is required']"
              />
              <q-input
                v-model="loginPayload.password"
                :type="showPassword ? 'text' : 'password'"
                :label="t('password')"
                autocomplete="current-password"
                :rules="[(val) => !!val || t('password_required')]"
              >
                <template #append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
              <div>
                <q-btn
                  :loading="loading"
                  :label="t('Login')"
                  type="submit"
                  color="primary"
                />
                <q-btn
                  :label="t('reset')"
                  type="reset"
                  color="primary"
                  flat
                  class="q-ml-sm"
                />
              </div>
            </q-form>
            <div v-if="showResend" class="q-mt-md">
              <q-btn color="primary" :loading="loading" @click="resendVerification">
                {{ t("resend_verification_email") }}
              </q-btn>
            </div>
            <div class="q-mt-md">
              <q-btn
                class="q-mb-sm full-width"
                label="Login with Google"
                icon="fab fa-google"
                style="background: #fff; color: #4285f4; border: 1px solid #4285f4"
                @click="onGoogleLogin"
              />
              <q-btn
                class="full-width"
                label="Login with GitHub"
                icon="fab fa-github"
                style="background: #24292e; color: #fff"
                @click="onGithubLogin"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped>
.my-card {
  max-width: 500px;
  margin: 40px auto;
}
</style>

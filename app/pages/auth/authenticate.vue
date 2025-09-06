<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'q-layout',
  title: 'Authenticate',
})

const $q = useQuasar()
const { t, locale } = useI18n()
const auth = authStore()

const tab = ref('login')
const acceptTerms: Ref<boolean> = ref(false)
const loading = ref(false)
const router = useRouter()

interface SP {
  email: string
  password: string
  username: string
  first_nam: string
  last_name: string
}
interface LoginI {
  email?: string
  password: string
  username?: string
}
const signInPayload: Ref<LoginI> = ref({
  email: '',
  password: '',
  username: '',
})
const signup_payload: Ref<SP> = ref<SP>({
  email: '',
  password: '',
  username: '',
  first_name: '',
  last_name: '',
})

const loginOptions = [
  { label: t('email'), value: signInPayload.value.email },
  { label: t('username'), value: signInPayload.value.username },
]
const loginType = ref('email')
const showPassword = ref(false)
const showResend = ref(false)
const lastTriedEmail = ref('')
const showSignupPassword = ref(false)

// --- Password login ---
async function onSubmit() {
  loading.value = true
  showResend.value = false
  try {
    const loginPayload = {
      password: signInPayload.value.password,
    }
    if (loginType.value === 'email') {
      loginPayload.email = signInPayload.value.email
      lastTriedEmail.value = signInPayload.value.email
    }
    else {
      loginPayload.username = signInPayload.value.username
    }
    // Use useFetch for login
    const { data, error } = await useFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload),
      credentials: 'include',
    })

    if (error.value) {
      if (error.value.statusCode === 403) {
        showResend.value = true
      }
      throw new Error('Login failed')
    }
    const result = data.value
    if (result && result.user && result.token) {
      auth.setUser(result.user)
      if (import.meta.client) {
        localStorage.setItem('jwt', result.token)
        // Save user ID to localStorage for bookmark persistence
        if (result.user.id || result.user._id) {
          if (import.meta.client) {
            localStorage.setItem('userId', result.user.id || result.user._id)
          }
        }
      }
      $q.notify({ message: userName.value + t('login_success'), type: 'positive' })
      router.push('/')
      $q.notify({ message: savedName, type: 'positive' })
    }
    else {
      throw new Error('Invalid login response')
    }
  }
  catch (error: any) {
    console.error('Authentication error', error)
  }
  finally {
    loading.value = false
  }
}
function onReset() {
  userName.value = ''
  password.value = ''
}

// --- Password signup ---
async function onSignup() {
  if (!acceptTerms.value) {
    $q.notify({ message: t('please_accept_terms'), type: 'negative' })
    return
  }
  loading.value = true
  try {
    const role = 'user'
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: signup_payload.value.email,
        password: signup_payload.value.password,
        username: signup_payload.value.username,
        first_name: signup_payload.value.first_name,
        last_name: signup_payload.value.last_name,
        role,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      if (err && err.error && err.error.includes('username')) {
        throw new Error(t('username_taken'))
      }
      throw new Error('Signup failed')
    }
    $q.notify({ message: t('signup_success'), type: 'positive' })
    tab.value = 'login'
    signupEmail.value = ''
    signupPassword.value = ''
    signupUsername.value = ''
    signupFirstName.value = ''
    signupLastName.value = ''
    acceptTerms.value = false
  }
  catch (error: any) {
    $q.notify({ message: error.message, type: 'negative' })
    console.error('Signup error', error)
  }
  finally {
    loading.value = false
  }
}

// Social login handlers
function onGoogleLogin() {
  window.location.href = '/api/auth/google'
}
function onGithubLogin() {
  window.location.href = '/api/auth/github'
}

function switchLang(lang: string) {
  locale.value = lang
}

watch(
  tab,
  (val) => {
    useHead({ title: t(val === 'login' ? 'login' : 'signup') })
  },
  { immediate: true },
)

async function resendVerification() {
  if (!lastTriedEmail.value)
    return
  loading.value = true
  try {
    const res = await fetch('/api/resend-verification', {
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
        <!-- Language Switcher -->
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
        </div>
        <h1 class="text-h5 q-mb-md">
          {{ t(tab === "login" ? "login" : "signup") }}
        </h1>
        <q-tabs v-model="tab" class="text-primary" align="justify">
          <q-tab name="login" :label="t('login')" />
          <q-tab name="signup" :label="t('signup')" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab" animated>
          <!-- LOGIN TAB -->
          <q-tab-panel name="login">
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
            <div v-else>
              <q-card flat bordered class="q-mb-md">
                <q-card-section>
                  <div class="text-h6 q-mb-sm">
                    <q-select
                      v-model="loginType"
                      :options="loginOptions"
                      :label="t('login_method')"
                      filled
                      dense
                      style="max-width: 200px"
                    />
                  </div>
                  <q-form class="q-gutter-md" @submit="onSubmit" @reset="onReset">
                    <q-input
                      v-if="loginType === 'email'"
                      v-model="loginPayload.email"
                      type="email"
                      :label="t('email')"
                      autocomplete="username"
                      :rules="[(val) => !!val || t('email_required')]"
                    />
                    <q-input
                      v-else
                      v-model="loginPayload.username"
                      type="text"
                      :label="t('username')"
                      autocomplete="username"
                      :rules="[(val) => !!val || t('username_required')]"
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
            </div>
          </q-tab-panel>
          <!-- SIGNUP TAB -->
          <q-tab-panel name="signup">
            <q-card flat bordered class="q-mb-md">
              <q-card-section>
                <div class="text-h6 q-mb-sm">
                  {{ t("password_signup") }}
                </div>
                <q-form class="q-gutter-md" @submit.prevent="onSignup">
                  <q-input
                    v-model="signup_payload.value.email"
                    type="text"
                    :label="t('email')"
                  />
                  <q-input
                    v-model="signup_payload.value.username"
                    type="text"
                    :label="t('username_optional')"
                    :hint="t('username_hint')"
                  />
                  <q-input
                    v-model="signup_payload.value.password"
                    :type="showSignupPassword ? 'text' : 'password'"
                    :label="t('password')"
                  >
                    <template #append>
                      <q-icon
                        :name="showSignupPassword ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="showSignupPassword = !showSignupPassword"
                      />
                    </template>
                  </q-input>
                  <q-input
                    v-model="signup_payload.first_name"
                    type="text"
                    :label="t('first_name')"
                  />
                  <q-input
                    v-model="signup_payload.last_name"
                    type="text"
                    :label="t('last_name')"
                  />
                  <q-checkbox
                    v-model="acceptTerms"
                    :label="t('accept_terms_and_conditions')"
                  >
                    <template #default>
                      <span>
                        {{ t("accept_terms_and_conditions") }}
                        <NuxtLink
                          to="/terms"
                          target="_blank"
                          class="text-primary q-ml-xs"
                        >
                          {{ t("terms_and_conditions") }}
                        </NuxtLink>
                      </span>
                    </template>
                  </q-checkbox>
                  <div>
                    <q-btn
                      :loading="loading"
                      :disable="!acceptTerms"
                      :label="t('sign_up')"
                      type="submit"
                      color="primary"
                    />
                  </div>
                </q-form>
                <div class="q-mt-md">
                  <q-btn
                    class="q-mb-sm full-width"
                    label="Sign up with Google"
                    icon="fab fa-google"
                    style="background: #fff; color: #4285f4; border: 1px solid #4285f4"
                    @click="onGoogleLogin"
                  />
                  <q-btn
                    class="full-width"
                    label="Sign up with GitHub"
                    icon="fab fa-github"
                    style="background: #24292e; color: #fff"
                    @click="onGithubLogin"
                  />
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
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

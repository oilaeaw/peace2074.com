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
const userName = ref('')
const password = ref('')

const tab = ref('login')
const signupEmail = ref('')
const signupPassword = ref('')
const signupFirstName = ref('')
const signupLastName = ref('')
const acceptTerms = ref(false)
const loading = ref(false)
const router = useRouter()

const loginOptions = [
  { label: t('email'), value: 'email' },
  { label: t('username'), value: 'username' },
]
const loginType = ref('email')

// --- Password login ---
async function onSubmit() {
  loading.value = true
  try {
    const loginPayload = {
      password: password.value,
    }
    if (loginType.value === 'email') {
      loginPayload.email = userName.value
    }
    else {
      loginPayload.username = userName.value
    }
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload),
      credentials: 'include',
    })
    if (!res.ok)
      throw new Error('Login failed')
    const user = await res.json()
    auth.setUser(user)
    $q.notify({ message: t('login_success'), type: 'positive' })
    router.push('/')
    $q.notify({ message: savedName, type: 'positive' })
  }
  catch (error: any) {
    $q.notify({ message: error.message, type: 'negative' })
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
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: signupEmail.value,
        password: signupPassword.value,
        first_name: signupFirstName.value,
        last_name: signupLastName.value,
      }),
    })
    if (!res.ok)
      throw new Error('Signup failed')
    $q.notify({ message: t('signup_success'), type: 'positive' })
    tab.value = 'login'
    signupEmail.value = ''
    signupPassword.value = ''
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
    $q.notify({ message: ustore, type: 'positive' })
  }
}

// Social login handlers
function onGoogleLogin() {
  $helllo.login()
}
function onGithubLogin() {
  window.location.href = '/.netlify/identity/login/github' // Netlify Identity GitHub login
}

function switchLang(lang: string) {
  locale.value = lang
}

watch(tab, (val) => {
  useHead({ title: t(val === 'login' ? 'login' : 'signup') })
}, { immediate: true })
</script>

<template>
  <q-page>
    <q-card class="my-card">
      <q-card-section>
        <!-- Language Switcher -->
        <div class="q-mb-md row items-center justify-end">
          <q-btn dense flat color="primary" label="English" :disable="locale === 'en'" class="q-mr-xs" @click="switchLang('en')" />
          <q-btn dense flat color="primary" label="العربية" :disable="locale === 'ar'" class="q-mr-xs" @click="switchLang('ar')" />
        </div>
        <h1 class="text-h5 q-mb-md">
          {{ t(tab === 'login' ? 'login' : 'signup') }}
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
                {{ t('already_logged_in') }}
                <q-btn color="primary" flat @click="() => { auth.logout(); $q.notify({ message: t('logout_success'), type: 'positive' }); }">
                  {{ t('logout') }}
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
                      style="max-width: 200px;"
                    />
                  </div>
                  <q-form class="q-gutter-md" @submit="onSubmit" @reset="onReset">
                    <q-input
                      v-if="loginType === 'email'"
                      v-model="userName"
                      type="email"
                      :label="t('email')"
                      autocomplete="username"
                      :rules="[val => !!val || t('email_required')]"
                    />
                    <q-input
                      v-else
                      v-model="userName"
                      type="text"
                      :label="t('username')"
                      autocomplete="username"
                      :rules="[val => !!val || t('username_required')]"
                    />
                    <q-input
                      v-model="password"
                      type="password"
                      :label="t('password')"
                      autocomplete="current-password"
                      :rules="[val => !!val || t('password_required')]"
                    />
                    <div>
                      <q-btn :loading="loading" :label="t('Login')" type="submit" color="primary" />
                      <q-btn :label="t('reset')" type="reset" color="primary" flat class="q-ml-sm" />
                    </div>
                  </q-form>
                  <div class="q-mt-md">
                    <q-btn
                      class="q-mb-sm full-width"
                      label="Login with Google"
                      icon="fab fa-google"
                      style="background:#fff;color:#4285F4;border:1px solid #4285F4;"
                      @click="onGoogleLogin"
                    />
                    <q-btn
                      class="full-width"
                      label="Login with GitHub"
                      icon="fab fa-github"
                      style="background:#24292e;color:#fff;"
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
                  {{ t('password_signup') }}
                </div>
                <q-form class="q-gutter-md" @submit.prevent="onSignup">
                  <q-input v-model="signupEmail" type="text" :label="t('email')" />
                  <q-input v-model="signupPassword" type="password" :label="t('password')" />
                  <q-input v-model="signupFirstName" type="text" :label="t('first_name')" />
                  <q-input v-model="signupLastName" type="text" :label="t('last_name')" />
                  <q-checkbox v-model="acceptTerms" :label="t('accept_terms_and_conditions')">
                    <template #default>
                      <span>
                        {{ t('accept_terms_and_conditions') }}
                        <NuxtLink to="/terms" target="_blank" class="text-primary q-ml-xs">
                          {{ t('terms_and_conditions') }}
                        </NuxtLink>
                      </span>
                    </template>
                  </q-checkbox>
                  <div>
                    <q-btn :loading="loading" :disable="!acceptTerms" :label="t('sign_up')" type="submit" color="primary" />
                  </div>
                </q-form>
                <div class="q-mt-md">
                  <q-btn
                    class="q-mb-sm full-width"
                    label="Sign up with Google"
                    icon="fab fa-google"
                    style="background:#fff;color:#4285F4;border:1px solid #4285F4;"
                    @click="onGoogleLogin"
                  />
                  <q-btn
                    class="full-width"
                    label="Sign up with GitHub"
                    icon="fab fa-github"
                    style="background:#24292e;color:#fff;"
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

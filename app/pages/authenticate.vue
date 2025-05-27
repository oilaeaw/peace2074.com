<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const userName = ref('hello@feathersjs.com')
const password = ref('supersecret')
const userStore = useUserStore()
const tab = ref('login')
const signupEmail = ref('')
const signupPassword = ref('')
const signupFirstName = ref('')
const signupLastName = ref('')
const acceptTerms = ref(false)
const loading = ref(false)
const router = useRouter()

const { t } = useI18n()

async function onSubmit() {
  loading.value = true
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userName.value,
        password: password.value,
      }),
      credentials: 'include',
    })
    if (!res.ok)
      throw new Error('Login failed')
    const user = await res.json()
    userStore.setUser(user)
    $q.notify({ message: t('login_success'), type: 'positive' })
    router.push('/') // Redirect to main page after login
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
    // update user store if needed
  }
  catch (error: any) {
    $q.notify({ message: error.message, type: 'negative' })
    console.error('Signup error', error)
  }
  finally {
    loading.value = false
  }
}

async function onWebAuthnLogin() {
  loading.value = true
  try {
    // You may want to prompt for email if not filled
    const email = userName.value || ''
    if (!email) {
      $q.notify({ message: t('please_enter_email'), type: 'negative' })
      loading.value = false
      return
    }
    // Call the Pinia store's webauthnRegister (for demo, use as login)
    const result = await userStore.webauthnRegister({
      userId: email, // In real use, use a unique user ID (e.g. from DB)
      email,
      displayName: email,
    })
    $q.notify({ message: t('login_success'), type: 'positive' })
    router.push('/')
  }
  catch (error) {
    $q.notify({ message: error.message, type: 'negative' })
  }
  finally {
    loading.value = false
  }
}

// Dynamic page title
watch(tab, (val) => {
  useHead({ title: t(val === 'login' ? 'login' : 'signup') })
}, { immediate: true })
</script>

<template>
  <q-page>
    <q-card class="my-card">
      <q-card-section>
        <h1 class="text-h5 q-mb-md">
          {{ t(tab === 'login' ? 'login' : 'signup') }}
        </h1>
        <q-tabs v-model="tab" class="text-primary" align="justify">
          <q-tab name="login" :label="t('login')" />
          <q-tab name="signup" :label="t('signup')" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="login">
            <div v-if="userStore.isAuthenticated">
              <q-banner class="q-mb-md" dense>
                {{ t('already_logged_in') }}
                <q-btn color="primary" flat @click="() => { userStore.logout(); $q.notify({ message: t('logout_success'), type: 'positive' }); }">
                  {{ t('logout') }}
                </q-btn>
              </q-banner>
            </div>
            <q-form v-else class="q-gutter-md" @submit="onSubmit" @reset="onReset">
              <q-input v-model="userName" type="text" :label="t('user')" />
              <q-input v-model="password" type="password" :label="t('password')" />
              <div>
                <q-btn :loading="loading" :label="t('submit')" type="submit" color="primary" />
                <q-btn :label="t('reset')" type="reset" color="primary" flat class="q-ml-sm" />
              </div>
              <div class="q-mt-md">
                <q-btn
                  color="secondary"
                  :label="t('sign_in_with_security_key')"
                  @click="onWebAuthnLogin"
                />
              </div>
            </q-form>
          </q-tab-panel>
          <q-tab-panel name="signup">
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
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style>

</style>

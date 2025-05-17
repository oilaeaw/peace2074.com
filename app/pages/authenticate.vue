<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { $hapi } = useNuxtApp()
const $q = useQuasar()
const userName = ref('hello@feathersjs.com')
const password = ref('supersecret')
const userStore = useUserStore()
const tab = ref('login')
const signupEmail = ref('')
const signupPassword = ref('')
const acceptTerms = ref(false)

const { t } = useI18n()

async function onSubmit() {
  try {
    // Authenticate with the local email/password strategy
    const user = await $hapi.authenticate({
      strategy: 'local',
      email: userName.value,
      password: password.value,
    })
    userStore.setUser(user)
    $q.notify({ message: 'Logged in successfully', type: 'positive' })
  }
  catch (error: any) {
    $q.notify({ message: error.message, type: 'negative' })
    // Handle authentication error
    console.error('Authentication error', error)
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
  try {
    await $hapi.service('users').create({
      email: signupEmail.value,
      password: signupPassword.value,
    })
    $q.notify({ message: 'Account created! Please log in.', type: 'positive' })
    tab.value = 'login'
    signupEmail.value = ''
    signupPassword.value = ''
    acceptTerms.value = false
  }
  catch (error: any) {
    $q.notify({ message: error.message, type: 'negative' })
    console.error('Signup error', error)
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
            <q-form class="q-gutter-md" @submit="onSubmit" @reset="onReset">
              <q-input v-model="userName" type="text" label="user" />
              <q-input v-model="password" type="password" label="password" />
              <div>
                <q-btn label="Submit" type="submit" color="primary" />
                <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
              </div>
            </q-form>
          </q-tab-panel>
          <q-tab-panel name="signup">
            <q-form class="q-gutter-md" @submit.prevent="onSignup">
              <q-input v-model="signupEmail" type="text" label="Email" />
              <q-input v-model="signupPassword" type="password" label="Password" />
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
                <q-btn :disable="!acceptTerms" label="Sign Up" type="submit" color="primary" />
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

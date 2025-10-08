<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({ layout: 'q-layout', title: 'Sign Up' })

const $q = useQuasar()
const { t, locale } = useI18n()

const signupPayload = reactive({ email: '', password: '', username: '', first_name: '', last_name: '' })
const loading = ref(false)
const showSignupPassword = ref(false)
const acceptTerms = ref(false)

function switchLang(lang: string) { locale.value = lang }

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
        email: signupPayload.email,
        password: signupPayload.password,
        username: signupPayload.username,
        first_name: signupPayload.first_name,
        last_name: signupPayload.last_name,
        role,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      if (err && err.error && err.error.includes('username'))
        throw new Error(t('username_taken'))
      throw new Error('Signup failed')
    }
    $q.notify({ message: t('signup_success'), type: 'positive' })
    signupPayload.email = ''
    signupPayload.password = ''
    signupPayload.username = ''
    signupPayload.first_name = ''
    signupPayload.last_name = ''
    acceptTerms.value = false
  }
  catch (error: any) {
    $q.notify({ message: error.message || t('signup_failed'), type: 'negative' })
    console.error('Signup error', error)
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
          <q-btn dense flat color="primary" label="English" :disable="locale === 'en'" class="q-mr-xs" @click="switchLang('en')" />
          <q-btn dense flat color="primary" label="العربية" :disable="locale === 'ar'" class="q-mr-xs" @click="switchLang('ar')" />
          <q-btn dense flat color="primary" label="Deutsch" :disable="locale === 'de'" class="q-mr-xs" @click="switchLang('de')" />
          <q-btn dense flat color="primary" label="Русский" :disable="locale === 'ru'" class="q-mr-xs" @click="switchLang('ru')" />
        </div>

        <h1 class="text-h5 q-mb-md">
          {{ t('signup') }}
        </h1>

        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-sm">
              {{ t('password_signup') }}
            </div>
            <q-form class="q-gutter-md" @submit.prevent="onSignup">
              <q-input v-model="signupPayload.email" type="text" :label="t('email')" />
              <q-input v-model="signupPayload.username" type="text" :label="t('username_optional')" :hint="t('username_hint')" />
              <q-input v-model="signupPayload.password" :type="showSignupPassword ? 'text' : 'password'" :label="t('password')">
                <template #append>
                  <q-icon :name="showSignupPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showSignupPassword = !showSignupPassword" />
                </template>
              </q-input>
              <q-input v-model="signupPayload.first_name" type="text" :label="t('first_name')" />
              <q-input v-model="signupPayload.last_name" type="text" :label="t('last_name')" />
              <q-checkbox v-model="acceptTerms" :label="t('accept_terms_and_conditions')">
                <template #default>
                  <span>
                    {{ t('accept_terms_and_conditions') }}
                    <NuxtLink to="/terms" target="_blank" class="text-primary q-ml-xs">{{ t('terms_and_conditions') }}</NuxtLink>
                  </span>
                </template>
              </q-checkbox>
              <div>
                <q-btn :loading="loading" :disable="!acceptTerms" :label="t('sign_up')" type="submit" color="primary" />
              </div>
            </q-form>
            <div class="q-mt-md">
              <q-btn class="q-mb-sm full-width" label="Sign up with Google" icon="fab fa-google" style="background: #fff; color: #4285f4; border: 1px solid #4285f4" @click="() => (window.location.href = '/api/auth/google')" />
              <q-btn class="full-width" label="Sign up with GitHub" icon="fab fa-github" style="background: #24292e; color: #fff" @click="() => (window.location.href = '/api/auth/github')" />
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

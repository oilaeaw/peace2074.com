<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/store/auth.pinia'

definePageMeta({ layout: 'q-layout', title: 'Login' })

const $q = useQuasar()
const { t, locale } = useI18n()
const auth = useAuthStore()

const loading = ref(false)
const router = useRouter()

const loginPayload = reactive({ email: '', password: '', username: '' })
const loginType = ref('email')
const showPassword = ref(false)
const showResend = ref(false)
const lastTriedEmail = ref('')

const loginOptions = [
  { label: t('email'), value: 'email' },
  { label: t('username'), value: 'username' },
]

async function onSubmit() {
  loading.value = true
  showResend.value = false
  try {
    const payload: Record<string, any> = { password: loginPayload.password }
    if (loginType.value === 'email') {
      payload.email = loginPayload.email
      lastTriedEmail.value = loginPayload.email
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
      throw new Error('Login failed')
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
  loginPayload.email = ''
  loginPayload.password = ''
  loginPayload.username = ''
}

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
  () => loginType.value,
  () => {
    useHead({ title: t('login') })
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
          {{ t("login") }}
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
              <q-select
                v-model="loginType"
                :options="loginOptions"
                :label="t('login_method')"
                filled
                dense
                style="max-width: 200px"
              />
            </div>
            <q-form class="q-gutter-md" @submit.prevent="onSubmit" @reset="onReset">
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

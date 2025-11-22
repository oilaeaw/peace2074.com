<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

const { t } = useI18n()
const $q = useQuasar()
const router = useRouter()

definePageMeta({
  title: 'navigation.Register',
  description: 'Create a new account to access all features.',
  middleware: 'guest',
})

const formData = ref({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

const loading = ref(false)

async function handleSignup() {
  if (!formData.value.acceptTerms) {
    $q.notify({
      type: 'negative',
      message: t('please_accept_terms'),
    })
    return
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    $q.notify({
      type: 'negative',
      message: t('passwords_do_not_match'),
    })
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        first_name: formData.value.first_name,
        last_name: formData.value.last_name,
        username: formData.value.username,
        email: formData.value.email,
        password: formData.value.password,
      },
    })

    $q.notify({
      type: 'positive',
      message: t('signup_success'),
    })
    router.push('/auth/login')
  }
  catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.data?.statusMessage || t('signup_failed'),
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <q-page
    padding
    class="flex flex-center"
  >
    <q-card
      class="q-pa-md"
      style="width: 400px; max-width: 90vw"
    >
      <q-card-section>
        <div class="text-h6">
          {{ t('create_account') }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleSignup">
          <q-input
            v-model="formData.first_name"
            :label="t('first_name')"
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="formData.last_name"
            :label="t('last_name')"
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="formData.username"
            :label="t('username')"
            :rules="[val => !!val || t('username_required')]"
            lazy-rules
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="formData.email"
            type="email"
            :label="t('email')"
            :rules="[val => !!val || t('email_required')]"
            lazy-rules
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="formData.password"
            type="password"
            :label="t('password')"
            :rules="[val => !!val || t('password_required')]"
            lazy-rules
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="formData.confirmPassword"
            type="password"
            :label="t('confirm_password')"
            :rules="[val => val === formData.password || t('passwords_do_not_match')]"
            lazy-rules
            outlined
            class="q-mb-md"
          />
          <q-checkbox
            v-model="formData.acceptTerms"
            :label="t('accept_terms_and_conditions')"
            class="q-mb-md"
          />
          <q-btn
            :label="t('sign_up')"
            type="submit"
            color="primary"
            class="full-width"
            :loading="loading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

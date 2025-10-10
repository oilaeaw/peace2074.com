<script lang="ts" setup>
import { onMounted } from '#imports'
import { useRouter } from 'vue-router'

definePageMeta({ layout: 'q-layout', title: 'navigation.AuthPageTitle', description: 'Redirect to authentication' })

const router = useRouter()
onMounted(() => {
  // Primary destination now lives at /auth/login
  router.replace('/auth/login')
})
</script>

<template>
  <q-page>
    <q-card class="my-card">
      <q-card-section>
        Redirecting to <NuxtLink to="/auth/login">
          Login
        </NuxtLink>. If you meant to sign
        up, <NuxtLink to="/auth/signup">
          Sign up
        </NuxtLink>.
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
// Use reactive objects so template auto-unwrapping works consistently

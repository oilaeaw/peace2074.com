<template>
  <q-page padding>
    <q-card class="my-card">
      <q-card-section>
        <h1 class="text-h4">
          Admin Dashboard
        </h1>
        <p>This page is only visible to users with the 'admin' role.</p>
      </q-card-section>

      <q-card-section>
        <q-btn color="primary" label="Call Protected API" :loading="loading" @click="callProtectedApi" />
      </q-card-section>

      <q-card-section v-if="apiResponse">
        <div class="text-h6">API Response:</div>
        <pre>{{ apiResponse }}</pre>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'

definePageMeta({
  middleware: ['admin'], // Apply the 'admin' middleware to this page
})

const $q = useQuasar()
const loading = ref(false)
const apiResponse = ref<any>(null)

async function callProtectedApi() {
  loading.value = true
  apiResponse.value = null
  const { data, error } = await useFetch('/api/admin/protected')
  apiResponse.value = data.value || error.value?.data
  loading.value = false
}
</script>
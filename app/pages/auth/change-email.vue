<script lang="ts" setup>
definePageMeta({ layout: 'q-layout', title: 'navigation.AuthPageTitle', description: 'Change email verification' })
const athCode = ref('')
</script>

<template>
  <q-page padding>
    <q-input v-model="athCode" type="text" label="Verify Code" />
  </q-page>
</template>

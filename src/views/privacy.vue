<script setup lang="ts">
// No script needed for static privacy page
// definePageMeta removed — titles handled centrally
</script>

<template>
  <q-page class="q-pa-md">
    <q-card class="my-card">
      <q-card-section>
        <h1>{{ $t('privacy_policy') }}</h1>
        <p>{{ $t('privacy_intro') }}</p>
        <h2>{{ $t('information_we_collect') }}</h2>
        <ul>
          <li>{{ $t('basic_account_info') }}</li>
          <li>{{ $t('usage_data') }}</li>
        </ul>
        <h2>{{ $t('how_we_use_information') }}</h2>
        <ul>
          <li>{{ $t('provide_services') }}</li>
          <li>{{ $t('improve_experience') }}</li>
          <li>{{ $t('communicate_updates') }}</li>
        </ul>
        <h2>{{ $t('cookies') }}</h2>
        <p>{{ $t('cookies_text') }}</p>
        <h2>{{ $t('data_security') }}</h2>
        <p>{{ $t('data_security_text') }}</p>
        <h2>{{ $t('contact') }}</h2>
        <p>{{ $t('contact_text') }}</p>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped>
h1 {
  margin-bottom: 16px;
}
h2 {
  margin-top: 24px;
  margin-bottom: 8px;
}
</style>

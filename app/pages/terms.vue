<script setup lang="ts">
// No script needed for static terms page
</script>

<template>
  <q-page class="q-pa-md">
    <q-card class="my-card">
      <q-card-section>
        <h1>{{ $t('terms_and_conditions') }}</h1>
        <p>{{ $t('terms_intro') }}</p>
        <h2>{{ $t('acceptance_of_terms') }}</h2>
        <p>{{ $t('acceptance_of_terms_text') }}</p>
        <h2>{{ $t('use_of_site') }}</h2>
        <ul>
          <li>{{ $t('use_of_site_1') }}</li>
          <li>{{ $t('use_of_site_2') }}</li>
        </ul>
        <h2>{{ $t('intellectual_property') }}</h2>
        <p>{{ $t('intellectual_property_text') }}</p>
        <h2>{{ $t('limitation_of_liability') }}</h2>
        <p>{{ $t('limitation_of_liability_text') }}</p>
        <h2>{{ $t('changes_to_terms') }}</h2>
        <p>{{ $t('changes_to_terms_text') }}</p>
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

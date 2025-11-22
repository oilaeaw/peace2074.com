<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Set the page-specific metadata. The layout will resolve the i18n keys.
definePageMeta({
  title: 'Home',
  description: 'meta.home',
})
</script>

<template>
  <q-page
    padding
    class="flex flex-center"
  >
    <div class="text-center">
      <h1 class="text-h2 text-weight-bold q-mb-md">
        {{ t('general.SiteTitle') }}
      </h1>
      <p class="text-subtitle1 text-grey-8">
        {{ t('meta.home') }}
      </p>
      <div class="q-mt-xl q-gutter-md">
        <q-btn
          to="/quran"
          color="primary"
          icon="menu_book"
          :label="t('pages.quran.pageTitle')"
          size="lg"
          unelevated
        />
      </div>
    </div>
  </q-page>
</template>

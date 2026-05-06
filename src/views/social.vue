<template>
  <q-page padding class="social-page">
    <section class="social-placeholder">
      <div class="text-h4 text-weight-bold">{{ t('pages.social.title') }}</div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.social-page {
  max-width: 960px;
  margin: 0 auto;
}

.social-placeholder {
  min-height: 40vh;
  display: flex;
  align-items: flex-start;
}
</style>

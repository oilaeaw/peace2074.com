<template>
  <q-page padding class="support-page">
    <section class="hero">
      <h1>{{ t("pages.support.title") }}</h1>
      <p class="subtitle">{{ t("pages.support.subtitle") }}</p>
    </section>

    <div class="q-gutter-md q-mt-lg">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t("pages.support.helpTitle") }}</div>
          <div class="text-body2 q-mt-xs">{{ t("pages.support.helpBody") }}</div>
        </q-card-section>
      </q-card>

      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t("pages.support.contactTitle") }}</div>
          <div class="text-body2 q-mt-xs">{{ t("pages.support.contactBody") }}</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style scoped>
.support-page {
  max-width: 900px;
  margin: 0 auto;
}
.hero {
  text-align: center;
}
.subtitle {
  color: #475569;
  margin-top: 6px;
}
</style>

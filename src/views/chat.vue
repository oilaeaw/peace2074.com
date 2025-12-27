<template>
  <q-page padding class="chat-page">
    <section class="hero">
      <h1>{{ t("pages.chat.title") }}</h1>
      <p class="subtitle">{{ t("pages.chat.subtitle") }}</p>
      <q-banner class="q-mt-sm" dense rounded color="primary" text-color="white">
        {{ t("pages.chat.banner") }}
      </q-banner>
      <div class="hero-actions q-mt-md">
        <q-btn color="primary" unelevated :label="t('pages.chat.ctaChat')" to="/chat" />
        <q-btn flat color="primary" :label="t('pages.chat.ctaSupport')" to="/support" class="q-ml-sm" />
      </div>
    </section>

    <div class="content-grid q-gutter-md q-mt-lg">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t("pages.chat.communityTitle") }}</div>
          <div class="text-body2 q-mt-xs">{{ t("pages.chat.communityBody") }}</div>
        </q-card-section>
      </q-card>

      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t("pages.chat.devTitle") }}</div>
          <div class="text-body2 q-mt-xs">{{ t("pages.chat.devBody") }}</div>
        </q-card-section>
      </q-card>

      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t("pages.chat.todoTitle") }}</div>
          <div class="text-body2 q-mt-xs">{{ t("pages.chat.todoBody") }}</div>
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
.chat-page {
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
.hero-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
@media (max-width: 640px) {
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  .hero-actions .q-btn {
    width: 100%;
  }
}
</style>

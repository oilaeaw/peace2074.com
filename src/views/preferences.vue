<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const displayName = ref("");
const defaultReciter = ref("hafs");
const rememberLastPage = ref(true);
const showTransliteration = ref(false);
const emailUpdates = ref(false);

const reciterOptions = [
  { label: "Hafs", value: "hafs" },
  { label: "Warsh", value: "warsh" },
  { label: "Qaloon", value: "qaloon" },
];
</script>

<template>
  <q-page class="q-pa-md prefs-page">
    <div class="page-header q-mb-md">
      <h1 class="text-h4 q-mb-xs">{{ t("pages.preferences.title") }}</h1>
      <div class="text-subtitle2 text-grey-6">{{ t("pages.preferences.subtitle") }}</div>
    </div>

    <div class="grid">
      <q-card class="glassy-card">
        <q-card-section class="q-gutter-md">
          <div class="text-h6">{{ t("pages.preferences.profile.title") }}</div>
          <q-input
            v-model="displayName"
            :label="t('pages.preferences.profile.displayName')"
            outlined
            dense
          />
          <q-toggle
            v-model="emailUpdates"
            color="primary"
            :label="t('pages.preferences.profile.emailUpdates')"
          />
          <q-banner dense rounded class="q-mt-sm" color="grey-3" text-color="grey-8">
            {{ t("pages.preferences.profile.hint") }}
          </q-banner>
        </q-card-section>
      </q-card>

      <q-card class="glassy-card">
        <q-card-section class="q-gutter-md">
          <div class="text-h6">{{ t("pages.preferences.quran.title") }}</div>
          <q-select
            v-model="defaultReciter"
            :options="reciterOptions"
            emit-value
            map-options
            outlined
            dense
            :label="t('pages.preferences.quran.reciter')"
          />
          <q-toggle
            v-model="showTransliteration"
            color="primary"
            :label="t('pages.preferences.quran.transliteration')"
          />
          <q-toggle
            v-model="rememberLastPage"
            color="primary"
            :label="t('pages.preferences.quran.remember')"
          />
          <q-banner dense rounded class="q-mt-sm" color="grey-3" text-color="grey-8">
            {{ t("pages.preferences.quran.hint") }}
          </q-banner>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.prefs-page {
  max-width: 1100px;
  margin: 0 auto;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.glassy-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}
</style>

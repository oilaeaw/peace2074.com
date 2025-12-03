<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { QDBI } from '~/../shared/types'
import { useQ2P } from '~/store/q2p.pinia'

const { t } = useI18n()

definePageMeta({
  auth: false, // This page should be public
})

const router = useRouter()
const suras = computed<QDBI[]>(() => useQ2P().Book)

const surasLeft = computed(() => suras.value.filter((_: QDBI, i: number) => i % 2 === 0))
const surasRight = computed(() => suras.value.filter((_: QDBI, i: number) => i % 2 === 1))

function navToSura(id: number) {
  router.push(`/quran/${id}`)
}

function showTranslation(sura: QDBI) {
  // Only show translation if it differs from the sura name
  return sura.e_name && sura.e_name !== sura.name
}

function getAriaLabel(sura: QDBI) {
  const translation = showTranslation(sura) ? `, ${sura.e_name}` : ''
  return `${t('pages.quran.sura.name')} ${sura.id}: ${sura.name}${translation}`
}
</script>

<template>
  <q-page padding class="islamic-design rtl-quran">
    <h2 class="sr-only">{{ t('pages.quran.pageTitle') }}</h2>
    <div class="mushaf-columns">
      <div class="mushaf-column">
        <NuxtLink
          v-for="sura in surasLeft"
          :key="sura.id"
          :to="`/quran/${sura.id}`"
          class="sura-card islamic-card sura-hover"
          :aria-label="getAriaLabel(sura)"
        >
          <div class="sura-header">
            <span class="sura-id">{{ sura.id }}</span>
            <span class="sura-name">{{ sura.name }}</span>
          </div>
          <div class="sura-info details-on-hover">
            <span
              v-if="showTranslation(sura)"
              class="sura-translation"
              :title="sura.e_name"
            >
              {{ sura.e_name }}
            </span>
            <span class="sura-type">{{ sura.type }}</span>
            <span class="sura-total">{{ sura.total_verses }} {{ t("pages.quran.sura.totverses") }}</span>
          </div>
        </NuxtLink>
      </div>
      <div class="mushaf-column">
        <NuxtLink
          v-for="sura in surasRight"
          :key="sura.id"
          :to="`/quran/${sura.id}`"
          class="sura-card islamic-card sura-hover"
          :aria-label="getAriaLabel(sura)"
        >
          <div class="sura-header">
            <span class="sura-id">{{ sura.id }}</span>
            <span class="sura-name">{{ sura.name }}</span>
          </div>
          <div class="sura-info details-on-hover">
            <span
              v-if="showTranslation(sura)"
              class="sura-translation"
              :title="sura.e_name"
            >
              {{ sura.e_name }}
            </span>
            <span class="sura-type">{{ sura.type }}</span>
            <span class="sura-total">{{ sura.total_verses }} {{ t("pages.quran.sura.totverses") }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.islamic-design {
  background: var(--background-pattern);
  color: var(--text-color);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
.rtl-quran {
  direction: rtl;
}
.mushaf-columns {
  display: flex;
  flex-direction: row;
  gap: 1.2rem;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
}
.mushaf-column {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  min-width: 0;
}
.sura-card {
  background: var(--card-bg);
  border: 2px solid currentColor;
  border-radius: 1.2rem;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-family: 'Amiri', serif;
  font-size: 1.45rem;
  min-width: 0;
  width: 100%;
  max-width: 340px;
  box-sizing: border-box;
  transition:
    box-shadow 0.2s,
    background 0.2s;
  cursor: pointer;
  margin-bottom: 0.1rem;
}
.sura-card:hover {
  background: var(--card-bg-hover);
  box-shadow: 0 4px 16px rgba(40, 167, 69, 0.13);
}
.sura-header {
  font-size: 1.7rem;
  font-weight: bold;
  margin-bottom: 0.1rem;
  display: flex;
  gap: 0.7rem;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.sura-id {
  background: var(--chip-bg);
  color: var(--chip-text-color);
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  margin-inline-end: 0.5rem;
  border: none;
}
.sura-name {
  font-size: 1.5rem;
  color: var(--chip-text-color);
  background: var(--chip-bg);
  border-radius: 2rem;
  padding: 0.2em 1em;
  margin: 0 0.5em;
  display: inline-block;
  font-family: 'Amiri', serif;
  border: none;
}
.sura-info {
  font-size: 1.15rem;
  color: var(--subtitle-color);
  margin-bottom: 0.2rem;
  display: none;
  flex-direction: column;
  gap: 0.1rem;
  text-align: right;
}
.sura-card:hover .sura-info {
  display: flex;
}
.sura-translation {
  font-style: italic;
}
.sura-type {
  font-size: 1.05rem;
}
.sura-total {
  font-size: 1.05rem;
}
.q-btn {
  align-self: flex-end;
  margin-top: 0.1rem;
  font-size: 1.1rem;
}
.back-btn {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  align-self: flex-start;
  z-index: 2;
}

:root {
  --background-pattern: #f3f6f3;
  --text-color: #111;
  --title-color: #155724;
  --subtitle-color: #6c757d;
  --card-border: var(--text-color);
  --card-bg: #fff;
  --card-bg-hover: #f3f6f3;
  --chip-bg: #006400;
  --chip-text-color: #111;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background-pattern: #23272e;
    --text-color: #fff;
    --title-color: #fff;
    --subtitle-color: #b0b0b0;
    --card-border: var(--text-color);
    --card-bg: #23272e;
    --card-bg-hover: #2c313a;
    --chip-bg: #006400;
    --chip-text-color: #fff;
  }
}

@media (max-width: 900px) {
  .mushaf-columns {
    flex-direction: row;
    gap: 0.5rem;
    align-items: flex-start;
  }
  .mushaf-column {
    width: 50%;
    max-width: 50vw;
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 0.5rem;
    justify-content: flex-start;
  }
  .sura-card {
    min-width: 0;
    max-width: 98vw;
    font-size: 1rem;
    margin: 0 0 0.2rem 0;
    padding: 0.3em 0.1em;
  }
}
@media (max-width: 600px) {
  .sura-card {
    font-size: 0.78rem;
    padding: 0.18em 0.05em;
  }
  .sura-header {
    font-size: 0.95rem;
  }
  .sura-name {
    font-size: 0.85rem;
    padding: 0.08em 0.3em;
  }
  .sura-id {
    width: 1.2rem;
    height: 1.2rem;
    font-size: 0.7rem;
  }
}
</style>

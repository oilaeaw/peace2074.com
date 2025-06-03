<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQ2P } from '~/store/q2p.pinia'

const { t } = useI18n()

// const q2p = useQ2P()
const router = useRouter()
const suras = computed(() => useQ2P().GetQ)

const surasLeft = computed(() => suras.value.filter((_, i) => i % 2 === 0))
const surasRight = computed(() => suras.value.filter((_, i) => i % 2 === 1))

function navToSura(id: number) {
  router.push(`/quran/${id}`)
}
</script>

<template>
  <q-page padding class="islamic-design rtl-quran">
    <div class="mushaf-columns">
      <div class="mushaf-column">
        <div
          v-for="sura in surasLeft"
          :key="sura.id"
          class="sura-card islamic-card sura-hover"
          @click="navToSura(sura.id)"
        >
          <div class="sura-header">
            <span class="sura-id">{{ sura.id }}</span>
            <span class="sura-name">{{ sura.name }}</span>
            <span class="sura-name">{{ sura.e_name }}</span>
          </div>
          <div class="sura-info details-on-hover">
            <span class="sura-translation" :title="sura.e_name">
              {{ sura.e_name }}
            </span>
            <span class="sura-type">{{ sura.type }}</span>
            <span class="sura-total">{{ sura.total_verses }} آيات</span>
          </div>
        </div>
      </div>
      <div class="mushaf-column">
        <div
          v-for="sura in surasRight"
          :key="sura.id"
          class="sura-card islamic-card sura-hover"
          @click="navToSura(sura.id)"
        >
          <div class="sura-header">
            <span class="sura-id">{{ sura.id }}</span>
            <span class="sura-name">{{ sura.name }}</span>
            <span class="sura-name">{{ sura.e_name }}</span>
          </div>
          <div class="sura-info details-on-hover">
            <span class="sura-translation" :title="sura.e_name">
              {{ sura.e_name }}
            </span>
            <span class="sura-type">{{ sura.type }}</span>
            <span class="sura-total">{{ sura.total_verses }} {{ t('pages.quran.sura.totverses') }}</span>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.islamic-design {
  background: var(--background-pattern);
  color: var(--text-color);
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
}
.mushaf-column {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
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
  min-width: 220px;
  max-width: 340px;
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
</style>

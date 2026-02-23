<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useQ2P } from "../stores/q2p.pinia";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const router = useRouter();
const suras = computed(() => useQ2P().GetQ);

function navToSura(id: number) {
  router.push(`/quran/${id}`);
}

function showTranslation(sura: any) {
  // Only show translation if it differs from the sura name
  return sura.e_name && sura.e_name !== sura.name;
}
</script>

<template>
  <q-page padding class="islamic-design rtl-quran">
    <div class="mushaf-columns">
      <div
        v-for="sura in suras"
        :key="sura.id"
        class="sura-card islamic-card sura-hover"
        tabindex="0"
        role="button"
        :aria-label="`${sura.name}, ${sura.e_name || ''}, ${sura.type}, ${
          sura.total_verses
        } ${t('pages.quran.sura.totverses')}`"
        @click="navToSura(sura.id)"
        @keyup.enter="navToSura(sura.id)"
      >
        <div class="sura-header">
          <span class="sura-id">{{ sura.id }}</span>
          <span class="sura-name">{{ sura.name }}</span>
        </div>
        <div class="sura-info">
          <span
            v-if="showTranslation(sura)"
            class="sura-translation"
            :title="sura.e_name"
          >
            {{ sura.e_name }}
          </span>
          <span class="sura-type">{{ sura.type }}</span>
          <span class="sura-total">
            {{ sura.total_verses }} {{ t("pages.quran.sura.totverses") }}
          </span>
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
}

.sura-card {
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 1rem;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-family: "Amiri", serif;
  font-size: 1.45rem;
  padding: 0.8rem 1rem;
  box-sizing: border-box;
  transition: all 0.2s ease;
  cursor: pointer;
}
.sura-card:hover {
  background: var(--card-bg-hover);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.15);
  transform: translateY(-2px);
  border-color: var(--chip-bg);
}
.sura-header {
  font-size: 1.7rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
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
  font-family: "Amiri", serif;
  border: none;
}
.sura-info {
  font-size: 1rem;
  color: var(--subtitle-color);
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
  width: 100%;
}
.sura-translation {
  font-style: italic;
  color: var(--subtitle-color);
}
.sura-type {
  font-size: 0.95rem;
}
.sura-total {
  font-size: 0.95rem;
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

.islamic-design {
  --background-pattern: #f3f6f3;
  --text-color: #111;
  --title-color: #155724;
  --subtitle-color: #6c757d;
  --card-border: rgba(0, 0, 0, 0.12);
  --card-bg: #fff;
  --card-bg-hover: #f8faf8;
  --chip-bg: #28a745;
  --chip-text-color: #fff;
}

:global(body.body--dark) .islamic-design {
  --background-pattern: #23272e;
  --text-color: #fff;
  --title-color: #fff;
  --subtitle-color: #b0b0b0;
  --card-border: rgba(255, 255, 255, 0.2);
  --card-bg: #2c313a;
  --card-bg-hover: #363c47;
  --chip-bg: #28a745;
  --chip-text-color: #fff;
}

/* All phones: always 2 columns (no single column mode) */
@media (max-width: 600px) {
  .mushaf-columns {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 0.5rem;
    padding: 0 0.4rem;
  }
  .sura-card {
    font-size: 0.8rem;
    padding: 0.4rem 0.25rem;
  }
  .sura-header {
    font-size: 0.95rem;
    flex-direction: column;
    gap: 0.2rem;
    margin-bottom: 0.2rem;
  }
  .sura-name {
    font-size: 0.8rem;
    padding: 0.1em 0.4em;
  }
  .sura-id {
    width: 1.3rem;
    height: 1.3rem;
    font-size: 0.7rem;
    margin-inline-end: 0;
  }
  .sura-info {
    font-size: 0.68rem;
    margin-top: 0.2rem;
    gap: 0.1rem;
  }
  .sura-type,
  .sura-total,
  .sura-translation {
    font-size: 0.62rem;
  }
}

/* Tablet: 2 columns with more space */
@media (min-width: 601px) and (max-width: 900px) {
  .mushaf-columns {
    gap: 1rem;
  }
  .sura-card {
    font-size: 1.2rem;
    padding: 0.7rem 0.9rem;
  }
}
</style>

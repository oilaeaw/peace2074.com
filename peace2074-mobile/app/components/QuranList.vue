<template>
  <ScrollView>
    <StackLayout class="screen screen-list">
      <Label text="Native Quran reader" class="screen-eyebrow" />
      <Label
        text="Browse all 114 surahs in a native list. Arabic text is bundled directly into the app so the reader can work without the web shell."
        class="screen-copy"
        textWrap="true"
      />

      <GridLayout columns="*,*" class="summary-row">
        <StackLayout col="0" class="summary-card summary-card-left">
          <Label :text="totalSurasLabel" class="summary-value" />
          <Label text="Surahs" class="summary-label" />
        </StackLayout>

        <StackLayout col="1" class="summary-card summary-card-right">
          <Label :text="totalAyatLabel" class="summary-value" />
          <Label text="Ayat" class="summary-label" />
        </StackLayout>
      </GridLayout>

      <TextField
        :text="query"
        hint="Search by surah number or name"
        class="search-field"
        @textChange="updateQuery"
      />

      <Label :text="resultsLabel" class="results-label" />

      <StackLayout>
        <GridLayout
          v-for="sura in filteredSuras"
          :key="sura.id"
          columns="auto,*,auto"
          class="sura-card"
          @tap="selectSura(sura.id)"
        >
          <Label col="0" :text="String(sura.id)" class="sura-index" />

          <StackLayout col="1" class="sura-copy">
            <Label :text="sura.transliteration" class="sura-title" />
            <Label :text="sura.translation" class="sura-subtitle" />
            <Label :text="sura.metaLabel" class="sura-meta" />
          </StackLayout>

          <Label
            col="2"
            :text="sura.name"
            class="sura-arabic"
            textWrap="true"
            textAlignment="right"
          />
        </GridLayout>
      </StackLayout>

      <Label
        v-if="!filteredSuras.length"
        text="No surahs matched that search yet. Try transliteration, translation, or the chapter number."
        class="empty-state"
        textWrap="true"
      />
    </StackLayout>
  </ScrollView>
</template>

<script setup lang="ts">
import type { EventData, TextField } from '@nativescript/core'
import { computed, ref } from 'nativescript-vue'

import { TOTAL_AYAT, TOTAL_SURAS, filterSuras } from '../utils/quran'

const emit = defineEmits<{
  (e: 'select', suraId: number): void
}>()

const query = ref('')
const filteredSuras = computed(() => filterSuras(query.value))
const totalSurasLabel = String(TOTAL_SURAS)
const totalAyatLabel = String(TOTAL_AYAT)
const resultsLabel = computed(
  () =>
    `${filteredSuras.value.length} result${filteredSuras.value.length === 1 ? '' : 's'}`
)

function updateQuery(event: EventData) {
  const field = event.object as TextField
  query.value = String(field.text || '')
}

function selectSura(suraId: number) {
  emit('select', suraId)
}
</script>

<style scoped>
.screen {
  padding: 24;
  background-color: #08111c;
}

.screen-eyebrow {
  font-size: 14;
  color: #7dd3a8;
  text-transform: uppercase;
  letter-spacing: 1.2;
}

.screen-copy {
  margin-top: 12;
  font-size: 16;
  line-height: 24;
  color: #dbe7e3;
}

.summary-row {
  margin-top: 18;
}

.summary-card {
  padding: 18;
  border-radius: 20;
  background-color: rgba(255, 255, 255, 0.08);
}

.summary-card-left {
  margin-right: 8;
}

.summary-card-right {
  margin-left: 8;
}

.summary-value {
  font-size: 24;
  font-weight: 700;
  color: #ffffff;
}

.summary-label {
  margin-top: 6;
  font-size: 13;
  color: #a7b6b0;
}

.search-field {
  margin-top: 18;
  padding: 14 16;
  border-radius: 16;
  background-color: #ffffff;
  color: #08111c;
  placeholder-color: #64748b;
}

.results-label {
  margin-top: 14;
  margin-bottom: 10;
  font-size: 13;
  color: #9eb0a8;
}

.sura-card {
  margin-top: 10;
  padding: 18;
  border-radius: 22;
  background-color: rgba(255, 255, 255, 0.95);
}

.sura-index {
  width: 40;
  height: 40;
  padding-top: 10;
  border-radius: 20;
  background-color: #e7f6ef;
  color: #0a6b44;
  font-size: 16;
  font-weight: 700;
  text-alignment: center;
  vertical-align: middle;
}

.sura-copy {
  margin-left: 14;
  margin-right: 12;
}

.sura-title {
  font-size: 18;
  font-weight: 700;
  color: #0f172a;
}

.sura-subtitle {
  margin-top: 4;
  font-size: 14;
  color: #334155;
}

.sura-meta {
  margin-top: 6;
  font-size: 12;
  color: #64748b;
}

.sura-arabic {
  width: 88;
  font-size: 22;
  color: #0a6b44;
}

.empty-state {
  margin-top: 20;
  padding: 18;
  border-radius: 20;
  background-color: rgba(255, 255, 255, 0.08);
  color: #dbe7e3;
  text-align: center;
}
</style>

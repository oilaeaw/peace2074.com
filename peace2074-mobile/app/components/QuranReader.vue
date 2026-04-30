<template>
  <ScrollView v-if="sura">
    <StackLayout class="screen screen-reader">
      <StackLayout class="reader-hero">
        <Label
          :text="sura.name"
          class="reader-arabic-title"
          textAlignment="center"
        />
        <Label
          :text="sura.transliteration"
          class="reader-title"
          textAlignment="center"
        />
        <Label
          :text="sura.translation"
          class="reader-subtitle"
          textAlignment="center"
        />
        <Label
          :text="sura.metaLabel"
          class="reader-meta"
          textAlignment="center"
        />
      </StackLayout>

      <StackLayout>
        <GridLayout
          v-for="verse in sura.verses"
          :key="`${verse.chapter}:${verse.verse}`"
          rows="auto,auto"
          class="ayah-card"
        >
          <Label :text="`Ayah ${verse.verse}`" class="ayah-index" />
          <Label
            row="1"
            :text="verse.text"
            class="ayah-text"
            textWrap="true"
            textAlignment="right"
          />
        </GridLayout>
      </StackLayout>
    </StackLayout>
  </ScrollView>

  <StackLayout v-else class="screen screen-reader screen-empty">
    <Label text="Unable to load this surah" class="empty-title" />
    <Label
      text="The reader could not find the requested bundled surah data."
      class="empty-copy"
      textWrap="true"
    />
  </StackLayout>
</template>

<script setup lang="ts">
import { computed } from 'nativescript-vue'

import { getSura } from '../utils/quran'

const props = defineProps<{
  suraId: number | null
}>()

const sura = computed(() => {
  if (!props.suraId) return null
  return getSura(props.suraId)
})
</script>

<style scoped>
.screen {
  padding: 24;
  background-color: #08111c;
}

.reader-hero {
  padding: 24;
  border-radius: 28;
  background-color: rgba(255, 255, 255, 0.96);
}

.reader-arabic-title {
  font-size: 34;
  color: #0a6b44;
}

.reader-title {
  margin-top: 12;
  font-size: 22;
  font-weight: 700;
  color: #0f172a;
}

.reader-subtitle {
  margin-top: 6;
  font-size: 16;
  color: #334155;
}

.reader-meta {
  margin-top: 10;
  font-size: 13;
  color: #64748b;
}

.ayah-card {
  margin-top: 14;
  padding: 18;
  border-radius: 24;
  background-color: rgba(255, 255, 255, 0.96);
}

.ayah-index {
  font-size: 13;
  font-weight: 700;
  color: #0a6b44;
}

.ayah-text {
  margin-top: 12;
  font-size: 28;
  line-height: 48;
  color: #0f172a;
}

.screen-empty {
  vertical-align: center;
}

.empty-title {
  font-size: 24;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
}

.empty-copy {
  margin-top: 12;
  font-size: 16;
  color: #dbe7e3;
  text-align: center;
}
</style>

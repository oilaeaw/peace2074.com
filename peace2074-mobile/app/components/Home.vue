<template>
  <Frame class="app-frame">
    <Page
      class="app-page"
      backgroundColor="#08111c"
      :iosOverflowSafeArea="true"
      :iosOverflowSafeAreaEnabled="true"
    >
      <ActionBar :title="currentTitle">
        <NavigationButton v-if="canGoBack" text="Back" @tap="goBack" />
      </ActionBar>

      <QuranReader v-if="selectedSuraId" :sura-id="selectedSuraId" />

      <QuranList v-else @select="openQuranReader" />
    </Page>
  </Frame>
</template>

<script setup lang="ts">
import { computed, ref } from 'nativescript-vue'

import QuranList from './QuranList.vue'
import QuranReader from './QuranReader.vue'
import { getSuraSummary } from '../utils/quran'

const selectedSuraId = ref<number | null>(null)

function openQuranReader(suraId: number) {
  selectedSuraId.value = suraId
}

function goBack() {
  selectedSuraId.value = null
}

const canGoBack = computed(() => selectedSuraId.value !== null)
const selectedSuraSummary = computed(() => {
  if (!selectedSuraId.value) return null
  return getSuraSummary(selectedSuraId.value)
})

const currentTitle = computed(
  () => selectedSuraSummary.value?.transliteration || 'Quran'
)
</script>

<style scoped>
.app-frame,
.app-page {
  background-color: #08111c;
}
</style>

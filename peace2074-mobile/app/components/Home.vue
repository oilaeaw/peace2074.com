<template>
  <Frame class="app-frame">
    <Page
      class="app-page"
      actionBarHidden="true"
      backgroundColor="#08111c"
      :iosOverflowSafeArea="true"
      :iosOverflowSafeAreaEnabled="true"
    >
      <GridLayout rows="auto,*" class="shell-root">
        <GridLayout row="0" columns="auto,*,auto" class="shell-header">
          <Button
            col="0"
            text="← Back"
            class="header-button header-button-secondary"
            :visibility="canGoBack ? 'visible' : 'collapse'"
            @tap="goBack"
          />

          <Label col="1" :text="currentTitle" class="shell-title" />

          <Button
            col="2"
            :text="headerActionLabel"
            class="header-button"
            @tap="handleHeaderAction"
          />
        </GridLayout>

        <ScrollView v-if="currentScreen === 'home'" row="1">
          <StackLayout class="screen screen-home">
            <Label text="PEACE2074" class="hero-brand" />
            <Label
              text="Your NativeScript app now starts with a real native shell. Quran browsing and reading are native-first, with the rest of PEACE2074 moving over piece by piece."
              class="hero-copy"
              textWrap="true"
            />

            <GridLayout columns="*,*" class="stats-row">
              <StackLayout col="0" class="stat-card stat-card-left">
                <Label :text="totalSurasLabel" class="stat-value" />
                <Label text="Bundled surahs" class="stat-label" />
              </StackLayout>

              <StackLayout col="1" class="stat-card stat-card-right">
                <Label :text="totalAyatLabel" class="stat-value" />
                <Label text="Bundled ayat" class="stat-label" />
              </StackLayout>
            </GridLayout>

            <StackLayout class="feature-card">
              <Label text="Native Quran flow" class="feature-title" />
              <Label
                text="Open a native surah list, search by chapter number or name, and read bundled Arabic text in a calm full-screen reader."
                class="feature-copy"
                textWrap="true"
              />
              <Button
                text="Open native Quran reader"
                class="primary-button"
                @tap="openQuranList"
              />
            </StackLayout>

            <Label
              text="Next native slices: bookmarks, progress sync, Holy Names, and Tasbeeh."
              class="roadmap-note"
              textWrap="true"
            />
          </StackLayout>
        </ScrollView>

        <AppInfo
          v-else-if="currentScreen === 'info'"
          row="1"
          @open-full-app="openLegacyWeb()"
          @open-native-quran="openQuranList"
        />

        <QuranList
          v-else-if="currentScreen === 'quran-list'"
          row="1"
          @select="openQuranReader"
        />

        <QuranReader
          v-else-if="currentScreen === 'quran-reader'"
          row="1"
          :sura-id="selectedSuraId"
          @open-web="openReaderInWeb"
        />

        <LegacyWebView v-else row="1" :src="legacyWebUrl" />
      </GridLayout>
    </Page>
  </Frame>
</template>

<script setup lang="ts">
import { computed, ref } from 'nativescript-vue'

import AppInfo from './AppInfo.vue'
import LegacyWebView from './LegacyWebView.vue'
import QuranList from './QuranList.vue'
import QuranReader from './QuranReader.vue'
import { TOTAL_AYAT, TOTAL_SURAS, getSuraSummary } from '../utils/quran'

type ScreenKey = 'home' | 'info' | 'quran-list' | 'quran-reader' | 'legacy-web'

const APP_ORIGIN = 'https://peace2074.com'
const totalSurasLabel = String(TOTAL_SURAS)
const totalAyatLabel = String(TOTAL_AYAT)

const currentScreen = ref<ScreenKey>('home')
const screenHistory = ref<ScreenKey[]>([])
const selectedSuraId = ref<number | null>(null)
const legacyWebUrl = ref(`${APP_ORIGIN}?native=1`)

function appendNativeFlag(url: string) {
  try {
    const parsed = new URL(url, APP_ORIGIN)
    parsed.searchParams.set('native', '1')
    return parsed.toString()
  } catch {
    const fallback = new URL(APP_ORIGIN)
    fallback.searchParams.set('native', '1')
    return fallback.toString()
  }
}

function navigateTo(screen: ScreenKey) {
  if (currentScreen.value === screen) return
  screenHistory.value.push(currentScreen.value)
  currentScreen.value = screen
}

function openQuranList() {
  navigateTo('quran-list')
}

function openInfo() {
  navigateTo('info')
}

function openQuranReader(suraId: number) {
  selectedSuraId.value = suraId
  navigateTo('quran-reader')
}

function openLegacyWeb(path = '/') {
  legacyWebUrl.value = appendNativeFlag(
    path.startsWith('http') ? path : `${APP_ORIGIN}${path}`
  )
  navigateTo('legacy-web')
}

function openReaderInWeb(suraId: number) {
  openLegacyWeb(`/quran/${suraId}`)
}

function goBack() {
  const previous = screenHistory.value.pop()
  currentScreen.value = previous || 'home'
}

const canGoBack = computed(() => currentScreen.value !== 'home')
const selectedSuraSummary = computed(() => {
  if (!selectedSuraId.value) return null
  return getSuraSummary(selectedSuraId.value)
})

const currentTitle = computed(() => {
  switch (currentScreen.value) {
    case 'info':
      return 'About this build'
    case 'quran-list':
      return 'Native Quran'
    case 'quran-reader':
      return selectedSuraSummary.value?.transliteration || 'Reader'
    case 'legacy-web':
      return 'Full app'
    default:
      return 'PEACE2074'
  }
})

const headerActionLabel = computed(() => {
  if (currentScreen.value === 'legacy-web') return 'Home'
  if (currentScreen.value === 'home') return 'About'
  return 'Full app'
})

function handleHeaderAction() {
  if (currentScreen.value === 'legacy-web') {
    currentScreen.value = 'home'
    screenHistory.value = []
    return
  }

  if (currentScreen.value === 'home') {
    openInfo()
    return
  }

  if (currentScreen.value === 'info') {
    openLegacyWeb('/')
    return
  }

  if (currentScreen.value === 'quran-reader' && selectedSuraId.value) {
    openReaderInWeb(selectedSuraId.value)
    return
  }

  if (currentScreen.value === 'quran-list') {
    openLegacyWeb('/quran')
    return
  }

  openLegacyWeb('/')
}
</script>

<style scoped>
.app-frame,
.app-page,
.shell-root {
  background-color: #08111c;
}

.shell-header {
  padding: 16 18 14;
  background-color: #08111c;
  border-bottom-width: 1;
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.shell-title {
  font-size: 20;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  vertical-align: middle;
}

.header-button {
  min-width: 78;
  padding: 10 14;
  border-radius: 999;
  background-color: #0a6b44;
  color: #ffffff;
  font-size: 14;
  font-weight: 700;
  opacity: 1;
}

.header-button-secondary {
  background-color: transparent;
  color: #7dd3a8;
  border-width: 1;
  border-color: #7dd3a8;
}

.screen {
  padding: 24;
  background-color: #08111c;
}

.hero-brand {
  font-size: 34;
  font-weight: 800;
  color: #ffffff;
}

.hero-copy {
  margin-top: 12;
  font-size: 17;
  color: #dbe7e3;
}

.stats-row {
  margin-top: 20;
}

.stat-card {
  padding: 18;
  border-radius: 22;
  background-color: rgba(255, 255, 255, 0.08);
}

.stat-card-left {
  margin-right: 8;
}

.stat-card-right {
  margin-left: 8;
}

.stat-value {
  font-size: 24;
  font-weight: 700;
  color: #ffffff;
}

.stat-label {
  margin-top: 6;
  font-size: 13;
  color: #9eb0a8;
}

.feature-card {
  margin-top: 18;
  padding: 22;
  border-radius: 28;
  background-color: rgba(255, 255, 255, 0.96);
}

.feature-card-secondary {
  background-color: rgba(125, 211, 168, 0.14);
}

.feature-title {
  font-size: 22;
  font-weight: 700;
  color: #0f172a;
}

.feature-title-secondary {
  color: #ffffff;
}

.feature-copy {
  margin-top: 10;
  font-size: 16;
  color: #334155;
}

.feature-copy-secondary {
  color: #dbe7e3;
}

.primary-button {
  margin-top: 16;
  padding: 14;
  border-radius: 999;
  background-color: #0a6b44;
  color: #ffffff;
  font-size: 17;
  font-weight: 700;
  border-width: 0;
  opacity: 1;
}

.secondary-button {
  margin-top: 16;
  padding: 14;
  border-radius: 999;
  background-color: transparent;
  color: #7dd3a8;
  border-width: 1;
  border-color: #7dd3a8;
  font-size: 17;
  font-weight: 700;
  opacity: 1;
}

.roadmap-note {
  margin-top: 18;
  font-size: 14;
  color: #9eb0a8;
}
</style>

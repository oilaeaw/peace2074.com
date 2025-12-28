<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const enableNotifications = ref(false)
const compactLayout = ref(false)
const reduceMotion = ref(false)
const autoPlayAthan = ref(false)

async function reloadApp() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      regs.forEach((r) => r.update().catch(() => {}))
    }
  } catch {}
  window.location.reload()
}
</script>

<template>
  <q-page class="q-pa-md settings-page">

function onPullRefresh(done?: () => void) {
  reloadApp()
  if (done) done()
}
    <div class="page-header q-mb-md">
      <h1 class="text-h4 q-mb-xs">{{ t('pages.settings.title') }}</h1>
      <div class="text-subtitle2 text-grey-6">{{ t('pages.settings.subtitle') }}</div>
    </div>

    <div class="grid">
      <q-card class="glassy-card">
        <q-card-section>
          <div class="text-h6 q-mb-sm">{{ t('pages.settings.display.title') }}</div>
          <div class="text-body2 text-grey-7 q-mb-md">
            {{ t('pages.settings.display.desc') }}
        <q-pull-to-refresh @refresh="onPullRefresh">
          <div class="grid">
          <div class="setting-row">
            <div>
              <div class="text-subtitle1">{{ t('pages.settings.display.compact') }}</div>
              <div class="text-caption text-grey-6">{{ t('pages.settings.display.compactHint') }}</div>
            </div>
            <q-toggle v-model="compactLayout" color="primary" :aria-label="t('pages.settings.display.compact')" />
          </div>
          <q-separator spaced />
          <div class="setting-row">
            <div>
              <div class="text-subtitle1">{{ t('pages.settings.display.motion') }}</div>
              <div class="text-caption text-grey-6">{{ t('pages.settings.display.motionHint') }}</div>
            </div>
            <q-toggle v-model="reduceMotion" color="primary" :aria-label="t('pages.settings.display.motion')" />
          </div>
        </q-card-section>
      </q-card>

      <q-card class="glassy-card">
        <q-card-section>
          <div class="text-h6 q-mb-sm">{{ t('pages.settings.notifications.title') }}</div>
          <div class="text-body2 text-grey-7 q-mb-md">
            {{ t('pages.settings.notifications.desc') }}
          </div>
          <div class="setting-row">
            <div>
              <div class="text-subtitle1">{{ t('pages.settings.notifications.enable') }}</div>
              <div class="text-caption text-grey-6">{{ t('pages.settings.notifications.enableHint') }}</div>
            </div>
            <q-toggle v-model="enableNotifications" color="primary" :aria-label="t('pages.settings.notifications.enable')" disable />
          </div>
          <q-banner dense rounded class="q-mt-md" color="grey-3" text-color="grey-8">
            {{ t('pages.settings.notifications.comingSoon') }}
          </q-banner>
        </q-card-section>
      </q-card>

      <q-card class="glassy-card">
        <q-card-section>
          <div class="text-h6 q-mb-sm">{{ t('pages.settings.audio.title') }}</div>
          <div class="text-body2 text-grey-7 q-mb-md">
            {{ t('pages.settings.audio.desc') }}
          </div>
          <div class="setting-row">
            <div>
              <div class="text-subtitle1">{{ t('pages.settings.audio.autoPlay') }}</div>
              <div class="text-caption text-grey-6">{{ t('pages.settings.audio.autoPlayHint') }}</div>
            </div>
            <q-toggle v-model="autoPlayAthan" color="primary" :aria-label="t('pages.settings.audio.autoPlay')" />
          </div>
        </q-card-section>
      </q-card>

      <q-card class="glassy-card">
        <q-card-section class="q-gutter-sm">
          <div class="text-h6 q-mb-sm">{{ t('pages.settings.refresh.title') }}</div>
          <div class="text-body2 text-grey-7">
            {{ t('pages.settings.refresh.desc') }}
          </div>
          <q-btn color="primary" unelevated :label="t('button.reload')" @click="reloadApp" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.settings-page {
          </div>
        </q-pull-to-refresh>
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
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
</style>

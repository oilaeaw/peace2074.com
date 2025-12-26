<template>
  <q-page class="home-hero q-pa-lg">
    <div class="hero-content">
      <div class="left">
        <h1 class="title">{{ t('pages.home.hero.title') }}</h1>
        <p class="lead">{{ t('pages.home.hero.lead') }}</p>
        <div class="actions">
          <q-btn to="/quran" :label="t('pages.home.hero.ctaReadQuran')" color="primary" class="q-mr-sm" />
          <q-btn to="/tasbeeh" flat :label="t('pages.home.hero.ctaTasbeeh')" />
        </div>
      </div>
      <div class="right">
        <q-card class="feature-card q-pa-md">
          <div class="feature-title">{{ t('pages.home.hero.cardTitle') }}</div>
          <div class="feature-body">{{ t('pages.home.hero.cardBody') }}</div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.hero-content { display:flex; gap:24px; align-items:center; justify-content:space-between; }
.left { max-width: 640px }
.title { font-size: 2.4rem; margin: 0; color: #fff }
.lead { color: rgba(255, 255, 255, 0.78); margin-top: 8px }
.actions { margin-top: 16px }
.feature-card { width: 260px }
.feature-title { font-weight: 700 }
.feature-body { color:#666; margin-top:8px }
@media (max-width: 720px) { .hero-content { flex-direction: column; align-items: stretch } .feature-card { width: 100% } }
</style>

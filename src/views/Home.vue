<template>
  <q-page class="home-hero q-pa-lg">
    <div class="hero-content">
      <div class="left">
        <h1 class="title">Peace2074</h1>
        <p class="lead">A calm place to read, reflect and remember.</p>
        <div class="actions">
          <q-btn to="/quran" label="Read Quran" color="primary" class="q-mr-sm" />
          <q-btn to="/tasbeeh" flat label="Tasbeeh" />
        </div>
      </div>
      <div class="right">
        <q-card class="feature-card q-pa-md">
          <div class="feature-title">Daily Reflection</div>
          <div class="feature-body">Short selected verses and reminders to help you focus.</div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// simple static hero; keep logic minimal here
</script>

<style scoped>
.hero-content { display:flex; gap:24px; align-items:center; justify-content:space-between; }
.left { max-width: 640px }
.title { font-size: 2.4rem; margin: 0 }
.lead { color: #6c757d; margin-top: 8px }
.actions { margin-top: 16px }
.feature-card { width: 260px }
.feature-title { font-weight: 700 }
.feature-body { color:#666; margin-top:8px }
@media (max-width: 720px) { .hero-content { flex-direction: column; align-items: stretch } .feature-card { width: 100% } }
</style>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const { t } = useI18n()
const route = useRoute()

const pageTitle = computed(() => {
  return route.meta.title || t('appShell.title')
})
</script>

<template>
  <div class="plain-container">
    <header class="plain-header">
      <nav class="plain-nav">
        <a :href="route.path.startsWith('/quran/') ? '/quran' : '/'" class="plain-link">← Back</a>
        <h1 class="plain-title">{{ pageTitle }}</h1>
        <a href="/" class="plain-link">Home</a>
      </nav>
    </header>
    <main class="plain-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.plain-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
  background: #fff;
  color: #000;
}

.plain-header {
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  background: #f9f9f9;
}

.plain-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.plain-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.plain-link {
  color: #0066cc;
  text-decoration: none;
  padding: 0.5rem;
}

.plain-link:hover {
  text-decoration: underline;
}

.plain-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  line-height: 1.8;
}
</style>

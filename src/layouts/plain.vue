<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const { t } = useI18n()
const route = useRoute()
const $q = useQuasar()

const pageTitle = computed(() => {
  return route.meta.title || t('appShell.title')
})

const isDarkMode = computed(() => $q.dark.isActive)
</script>

<template>
  <div class="plain-container" :class="{ 'plain-container--dark': isDarkMode }">
    <header class="plain-header" :class="{ 'plain-header--dark': isDarkMode }">
      <nav class="plain-nav">
        <a
          :href="route.path.startsWith('/quran/') ? '/quran' : '/'"
          class="plain-link"
          :class="{ 'plain-link--dark': isDarkMode }"
          >← {{ t('button.back') }}</a
        >
        <h1 class="plain-title" :class="{ 'plain-title--dark': isDarkMode }">
          {{ pageTitle }}
        </h1>
        <a
          href="/"
          class="plain-link"
          :class="{ 'plain-link--dark': isDarkMode }"
          >{{ t('appShell.nav.home') }}</a
        >
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
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background:
    radial-gradient(circle at top, rgba(16, 185, 129, 0.08), transparent 34%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  color: #111827;
}

.plain-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
}

.plain-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  gap: 8px;
  min-width: 0;
}

.plain-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #0f172a;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plain-link {
  color: #0f766e;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 999px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.plain-link:hover {
  text-decoration: none;
  background: rgba(15, 118, 110, 0.12);
}

.plain-main {
  margin: 0 auto;
  padding: 2rem 1rem;
  line-height: 1.8;
}

.plain-container--dark {
  background: #000;
  color: #f3f4f6;
}

.plain-header--dark {
  border-bottom-color: rgba(255, 255, 255, 0.08);
  background: rgba(3, 7, 18, 0.92);
}

.plain-title--dark {
  color: #f9fafb;
}

.plain-link--dark {
  color: #5eead4;
}

.plain-link--dark:hover {
  background: rgba(94, 234, 212, 0.12);
}

:global(body.body--dark) .plain-container {
  background: #000;
  color: #f3f4f6;
}

:global(body.body--dark) .plain-header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
  background: rgba(3, 7, 18, 0.92);
}

:global(body.body--dark) .plain-container .plain-header {
  background: rgba(3, 7, 18, 0.92) !important;
}

:global(body.body--dark) .plain-title {
  color: #f9fafb;
}

:global(body.body--dark) .plain-link {
  color: #5eead4;
}

:global(body.body--dark) .plain-link:hover {
  background: rgba(94, 234, 212, 0.12);
}

@media (max-width: 480px) {
  .plain-nav {
    flex-wrap: wrap;
    justify-content: center;
  }

  .plain-title {
    order: 3;
    width: 100%;
    text-align: center;
    font-size: 1rem;
  }

  .plain-link {
    padding: 0.35rem;
  }

  .plain-main {
    padding: 1rem 0.75rem;
  }
}
</style>

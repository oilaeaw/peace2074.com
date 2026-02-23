<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useQ2P as useQ2PStore } from '@/stores/q2p.pinia'

const { t } = useI18n()
const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const store = useQ2PStore()
const loading = ref(true)
const error = ref('')
const invalidSuraNotice = ref(false)

// Reactive list from Pinia store so DevTools shows populated state
const surahs = computed(() => store.GetQ)

onMounted(async () => {
  if (route.query.invalidSura === '1') {
    invalidSuraNotice.value = true
    $q.notify({
      type: 'warning',
      message: t('pages.quran.invalidSuraRange'),
      timeout: 5000,
    })
    const { invalidSura, ...cleanQuery } = route.query
    await router.replace({ path: route.path, query: cleanQuery })
  }

  try {
    // Populate store from bundled data; API fetch (if any) can be done in detail page
    await store.init(1)
  } catch (e: any) {
    error.value = e?.message || 'Failed to load chapters'
    $q.notify({ type: 'negative', message: error.value })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <q-page class="q-pa-md">
    <h1 class="text-h4 q-mb-md">{{ t('pages.quran.title') || 'Quran Surahs' }}</h1>

    <q-banner
      v-if="invalidSuraNotice"
      inline-actions
      rounded
      class="bg-warning text-black q-mb-md"
    >
      {{ t('pages.quran.invalidSuraRange') }}
      <template #action>
        <q-btn flat dense color="black" :label="t('button.close')" @click="invalidSuraNotice = false" />
      </template>
    </q-banner>
    
    <div v-if="loading" class="status">{{ t('pages.quran.loading') }}</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    
    <div v-else class="surahs-grid">
      <RouterLink
        v-for="s in surahs"
        :key="s?.id"
        :to="`/quran/${s?.id}`"
        class="sura-card q-card q-pa-sm"
      >
        <div class="text-subtitle1">{{ s.id }}. {{ s.e_name || '' }}</div>
        <div class="text-body2">{{ s.name }}</div>
        <div class="text-caption">{{ s.total_verses }} {{ t('pages.quran.verses') }} • {{ s.type }}</div>
      </RouterLink>
    </div>
    
    <footer class="hint q-mt-md text-caption text-grey-6">{{ t('pages.quran.apiHint') }}</footer>
  </q-page>
</template>

<style scoped>
.status {
  padding: 1rem 0;
}

.status.error {
  color: var(--q-negative);
}

.surahs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Phones: compact 2-column layout */
@media (max-width: 600px) {
  .surahs-grid {
    gap: 0.5rem;
  }
  
  .sura-card {
    padding: 0.5rem !important;
  }
  
  .sura-card .text-subtitle1 {
    font-size: 0.85rem;
  }
  
  .sura-card .text-body2 {
    font-size: 0.9rem;
  }
  
  .sura-card .text-caption {
    font-size: 0.65rem;
  }
}

/* Tablets and desktop: more spacing */
@media (min-width: 601px) {
  .surahs-grid {
    gap: 1.5rem;
  }
}

.sura-card {
  text-decoration: none;
  color: inherit;
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sura-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border-color: var(--q-primary);
}

.sura-card .text-subtitle1 {
  font-weight: 600;
  color: var(--q-primary);
}

.sura-card .text-body2 {
  font-size: 1.1rem;
  font-weight: 500;
}

.sura-card .text-caption {
  color: rgba(0, 0, 0, 0.6);
}

/* Dark mode support */
body.body--dark .sura-card {
  background: #1e1e1e;
  border-color: rgba(255, 255, 255, 0.1);
}

body.body--dark .sura-card:hover {
  background: #2a2a2a;
  border-color: var(--q-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

body.body--dark .sura-card .text-subtitle1 {
  color: var(--q-accent);
}

body.body--dark .sura-card .text-body2 {
  color: #e0e0e0;
}

body.body--dark .sura-card .text-caption {
  color: rgba(255, 255, 255, 0.6);
}

.hint {
  text-align: center;
}
</style>



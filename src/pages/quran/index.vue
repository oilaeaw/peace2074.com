<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useQ2P as useQ2PStore } from '@/stores/q2p.pinia'

const { t } = useI18n()
const $q = useQuasar()
const store = useQ2PStore()
const loading = ref(true)
const error = ref('')

// Reactive list from Pinia store so DevTools shows populated state
const surahs = computed(() => store.GetQ)

onMounted(async () => {
  try {
    // Populate store from bundled data; API fetch (if any) can be done in detail page
    store.init(1)
  } catch (e: any) {
    error.value = e?.message || 'Failed to load chapters'
    $q.notify({ type: 'negative', message: error.value })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="q-pa-md">
    <h1>{{ t('pages.quran.title') || 'Quran Surahs' }}</h1>
    <div v-if="loading" class="status">Loading…</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else class="q-gutter-md" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem;">
      <RouterLink
        v-for="s in surahs"
        :key="s?.id"
        :to="`/quran/${s?.id}`"
        class="sura-card q-card q-pa-sm"
        style="text-decoration: none; color: inherit;"
      >
        <div class="text-subtitle1">{{ s.id }}. {{ s.e_name || '' }}</div>
        <div class="text-body2">{{ s.name }}</div>
        <div class="text-caption">{{ s.total_verses }} verses • {{ s.type }}</div>
      </RouterLink>
    </div>
    <footer class="hint">If content doesn't load, ensure the server API /api/quran is running.</footer>
  </div>
</template>

<style scoped>
.status {
  margin: 1rem 0;
}
.status.error {
  color: #b00020;
}
.hint {
  opacity: 0.6;
  font-size: 0.9rem;
  padding-top: 1rem;
}
</style>



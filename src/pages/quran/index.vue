<script setup lang="ts">
import useQ2P from '@/composables/useQ2P'
import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const { t, locale } = useI18n()
const q2p = useQ2P()
const $q = useQuasar()
const surahs = ref<any[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    await q2p.init(1, locale.value || 'en')
    surahs.value = q2p.GetQ || []
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
      <RouterLink v-for="s in surahs" :key="s.id" :to="`/quran/${s.id}`" class="q-card q-pa-sm" style="text-decoration: none; color: inherit;">
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



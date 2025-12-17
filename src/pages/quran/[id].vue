<script setup lang="ts">
import { useRoute } from 'vue-router'
import useQ2P from '@/composables/useQ2P'
import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const { locale, t } = useI18n()
const route = useRoute('/quran/[id]')
const q2p = useQ2P()
const $q = useQuasar()
const sura = ref<any | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const lok = Number(route.params.id || 1)
  try {
    await q2p.init(lok, locale.value || 'en')
    sura.value = q2p.GetSura || null
  } catch (e: any) {
    error.value = e?.message || 'Failed to load sura'
    $q.notify({ type: 'negative', message: error.value })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="q-pa-md">
    <q-btn flat class="q-mb-md" to="/quran" label="← Back to list" />
    <div v-if="loading" class="status">Loading…</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <q-card v-else-if="sura" class="q-pa-md">
      <div class="text-h5">{{ sura?.e_name }} - {{ sura?.name }}</div>
      <div class="text-caption q-mt-xs">ID: {{ sura?.id }} • Verses: {{ sura?.total_verses }} • {{ sura?.type }}</div>
      <div class="q-mt-md arabic-block">
        <div v-for="a in sura?.ayat || []" :key="a.verse" class="verse-row q-mb-sm">
          <div class="arabic-text">{{ a.text }}</div>
          <div class="verse-meta">
            <span class="verse-num">{{ a.verse }}</span>
            <div class="verse-translation" v-if="a.translation">{{ a.translation }}</div>
          </div>
        </div>
      </div>
    </q-card>
  </div>
</template>

<style scoped>
.status { margin: 1rem 0; }
.status.error { color: #b00020; }
.card { border: 1px solid #ddd; border-radius: 8px; }
.arabic-block { font-family: 'Noto Naskh Arabic', serif; font-size: 1.6rem; line-height: 2.2rem; direction: rtl; text-align: justify; }
.verse-num { display:inline-block; border-radius:50%; width:22px; height:22px; text-align:center; font-size:11px; background:#f3dfb8; border:1px solid #caa14b; vertical-align:baseline; margin-inline-start: 6px; }
.verse-translation { direction: ltr; font-size: 0.95rem; color: #5b5b5b; margin-inline-start: 8px; display: inline-block; }
</style>



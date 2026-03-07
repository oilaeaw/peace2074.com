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

// Ramadan Progress Tracking
const PROGRESS_KEY = 'quran-ramadan-progress'
const completedSuras = ref<Set<number>>(new Set())

// Detect if we're in Ramadan (9th month of Islamic calendar)
const isRamadan = computed(() => {
  const today = new Date()
  const hijriDate = gregorianToHijri(today)
  return hijriDate.month === 9 // Ramadan is the 9th month
})

// Simple Gregorian to Hijri converter
function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  // Hijri epoch: July 16, 622 CE (Julian calendar)
  const hijriEpoch = 1948439.5 // Julian Day Number
  const gregorianEpoch = 1721425.5
  
  // Convert to Julian Day Number
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  let a = Math.floor((14 - month) / 12)
  let y = year + 4800 - a
  let m = month + 12 * a - 3
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  
  // Convert JDN to Hijri
  let l = jdn - hijriEpoch + 10632
  let n = Math.floor((l - 1) / 10631)
  l = l - 10631 * n + 354
  let j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238)
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29
  const hMonth = Math.floor((24 * l) / 709)
  const hDay = l - Math.floor((709 * hMonth) / 24)
  const hYear = 30 * n + j - 30
  
  return { year: hYear, month: hMonth, day: hDay }
}

// Load progress from localStorage
const loadProgress = () => {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      completedSuras.value = new Set(parsed)
    }
  } catch (e) {
    console.error('Failed to load progress:', e)
  }
}

// Save progress to localStorage
const saveProgress = () => {
  try {
    const data = Array.from(completedSuras.value)
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save progress:', e)
  }
}

// Toggle completion status
const toggleCompletion = (suraId: number, event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  
  if (completedSuras.value.has(suraId)) {
    completedSuras.value.delete(suraId)
    $q.notify({
      type: 'info',
      message: t('pages.quran.ramadanProgress.suraIncomplete', { sura: suraId }),
      icon: 'radio_button_unchecked',
      timeout: 1500
    })
  } else {
    completedSuras.value.add(suraId)
    $q.notify({
      type: 'positive',
      message: t('pages.quran.ramadanProgress.suraCompleted', { sura: suraId }),
      icon: 'check_circle',
      timeout: 2000
    })
  }
  saveProgress()
}

// Calculate progress
const completionStats = computed(() => {
  const total = 114
  const completed = completedSuras.value.size
  const percentage = Math.round((completed / total) * 100)
  return { total, completed, percentage }
})

// Find next incomplete sura
const nextIncompleteSura = computed(() => {
  for (let i = 1; i <= 114; i++) {
    if (!completedSuras.value.has(i)) {
      return i
    }
  }
  return 1 // All complete, restart
})

// Continue reading
const continueReading = () => {
  router.push(`/quran/${nextIncompleteSura.value}`)
}

// Reset progress
const resetProgress = () => {
  $q.dialog({
    title: t('pages.quran.ramadanProgress.resetConfirm'),
    message: t('pages.quran.ramadanProgress.resetConfirmMessage'),
    cancel: true,
    persistent: true
  }).onOk(() => {
    completedSuras.value.clear()
    saveProgress()
    $q.notify({
      type: 'warning',
      message: t('pages.quran.ramadanProgress.progressReset'),
      icon: 'restart_alt',
      timeout: 2000
    })
  })
}

// Reactive list from Pinia store so DevTools shows populated state
const surahs = computed(() => store.GetQ)

onMounted(async () => {
  loadProgress()
  
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

    <!-- Ramadan Progress Card -->
    <q-card 
      class="ramadan-progress q-mb-lg" 
      :class="{ 'is-ramadan': isRamadan }"
      flat 
      bordered
    >
      <q-card-section>
        <div class="row items-center q-gutter-md">
          <q-icon 
            :name="isRamadan ? 'nights_stay' : 'auto_stories'" 
            size="42px" 
            :color="isRamadan ? 'amber-8' : 'primary'" 
          />
          <div class="col">
            <div class="text-h6">
              <span v-if="isRamadan" class="ramadan-badge">🌙 {{ t('pages.quran.ramadanProgress.badge') }}</span>
              {{ t('pages.quran.ramadanProgress.title') }}
            </div>
            <div class="text-subtitle2" :class="isRamadan ? 'ramadan-subtitle' : 'text-grey-7'">
              {{ t('pages.quran.ramadanProgress.completed', { 
                completed: completionStats.completed, 
                total: completionStats.total, 
                percentage: completionStats.percentage 
              }) }}
            </div>
            <q-linear-progress
              :value="completionStats.percentage / 100"
              :color="isRamadan ? 'amber-8' : 'positive'"
              size="12px"
              class="q-mt-sm"
              rounded
            />
          </div>
        </div>
        <div v-if="isRamadan" class="ramadan-message q-mt-md">
          <q-icon name="auto_awesome" size="20px" color="amber-8" />
          <span class="text-subtitle2">
            {{ t('pages.quran.ramadanProgress.message') }}
          </span>
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn
          color="primary"
          icon="play_arrow"
          :label="completionStats.completed === 114 ? t('pages.quran.ramadanProgress.restart') : t('pages.quran.ramadanProgress.continueReading')"
          unelevated
          @click="continueReading"
        />
        <q-btn
          flat
          color="grey-7"
          icon="restart_alt"
          :label="t('pages.quran.ramadanProgress.resetProgress')"
          @click="resetProgress"
        />
      </q-card-actions>
    </q-card>

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
      <div
        v-for="s in surahs"
        :key="s?.id"
        class="sura-card-wrapper"
      >
        <RouterLink
          :to="`/quran/${s?.id}`"
          class="sura-card q-card q-pa-sm"
          :class="{ 'is-completed': completedSuras.has(s.id) }"
        >
          <div class="sura-content">
            <div class="text-subtitle1">{{ s.id }}. {{ s.e_name || '' }}</div>
            <div class="text-body2">{{ s.name }}</div>
            <div class="text-caption">{{ s.total_verses }} {{ t('pages.quran.verses') }} • {{ s.type }}</div>
          </div>
          <q-btn
            round
            dense
            flat
            class="completion-btn"
            :icon="completedSuras.has(s.id) ? 'check_circle' : 'radio_button_unchecked'"
            :color="completedSuras.has(s.id) ? 'positive' : 'grey-5'"
            @click="toggleCompletion(s.id, $event)"
            :aria-label="completedSuras.has(s.id) ? 'Mark incomplete' : 'Mark complete'"
          >
            <q-tooltip>
              {{ completedSuras.has(s.id) ? 'Mark as incomplete' : 'Mark as complete' }}
            </q-tooltip>
          </q-btn>
        </RouterLink>
      </div>
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

.ramadan-progress :deep(.q-linear-progress__track) {
  opacity: 0.3;
}

.ramadan-progress.is-ramadan {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #f59e0b;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15);
}

body.body--dark .ramadan-progress.is-ramadan {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%);
  border-color: #fbbf24;
}

.ramadan-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #fbbf24;
  color: #78350f;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 8px;
  animation: glow 2s ease-in-out infinite;
}

body.body--dark .ramadan-badge {
  background: #d97706;
  color: rgba(255, 255, 255, 0.95);
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 8px rgba(251, 191, 36, 0.4); }
  50% { box-shadow: 0 0 16px rgba(251, 191, 36, 0.6); }
}

.ramadan-subtitle {
  color: #b45309;
}

body.body--dark .ramadan-subtitle {
  color: #fbbf24;
}

.ramadan-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

body.body--dark .ramadan-message {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(245, 158, 11, 0.4);
}

.ramadan-message .text-subtitle2 {
  color: #92400e;
  font-style: italic;
}

body.body--dark .ramadan-message .text-subtitle2 {
  color: #fde68a;
}

.surahs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  max-width: 1400px;
  margin: 0 auto;
}

.sura-card-wrapper {
  position: relative;
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
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  position: relative;
}

body.body--dark .sura-card {
  background: #1e1e1e;
  border-color: rgba(255, 255, 255, 0.12);
}

.sura-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border-color: var(--q-primary);
}

body.body--dark .sura-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.sura-card.is-completed {
  background: #f0fdf4;
  border-color: #22c55e;
}

body.body--dark .sura-card.is-completed {
  background: rgba(34, 197, 94, 0.1);
  border-color: #4ade80;
}

.sura-card.is-completed::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%);
  pointer-events: none;
}

body.body--dark .sura-card.is-completed::before {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.08) 100%);
}

.sura-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sura-card .text-subtitle1 {
  font-weight: 600;
  color: var(--q-primary);
}

.sura-card.is-completed .text-subtitle1 {
  color: #16a34a;
}

.sura-card .text-body2 {
  font-size: 1.1rem;
  font-weight: 500;
}

.sura-card .text-caption {
  color: rgba(0, 0, 0, 0.6);
}

.completion-btn {
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.completion-btn:hover {
  transform: scale(1.1);
}

/* Dark mode support */
body.body--dark .ramadan-progress {
  background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%);
}

body.body--dark .sura-card {
  background: #1e1e1e;
  border-color: rgba(255, 255, 255, 0.1);
}

body.body--dark .sura-card:hover {
  background: #2a2a2a;
  border-color: var(--q-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

body.body--dark .sura-card.is-completed {
  background: #1a2e1a;
  border-color: #22c55e;
}

body.body--dark .sura-card .text-subtitle1 {
  color: var(--q-accent);
}

body.body--dark .sura-card.is-completed .text-subtitle1 {
  color: #4ade80;
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



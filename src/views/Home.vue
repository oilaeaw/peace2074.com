<template>
  <q-page class="home-hero q-pa-lg">
    <div class="hero-content-vertical">
      <div class="top-section">
        <h1 class="title">{{ t('pages.home.hero.title') }}</h1>
        <p class="lead">{{ t('pages.home.hero.lead') }}</p>
        <div class="actions">
          <q-btn to="/quran" :label="t('pages.home.hero.ctaReadQuran')" color="primary" class="q-mr-sm" />
          <q-btn to="/holynames" :label="t('pages.home.hero.ctaHolyNames')" color="primary" outline class="q-mr-sm" />
          <q-btn to="/tasbeeh" flat :label="t('pages.home.hero.ctaTasbeeh')" />
        </div>
      </div>

      <q-card class="ai-card q-pa-md q-mt-lg">
        <div class="ai-header">
          <div>
            <p class="ai-title">{{ t('pages.home.ai.title') }}</p>
            <small>{{ t('pages.home.ai.subtitle') }}</small>
          </div>
          <q-chip clickable color="primary" text-color="white" size="sm" @click="setNextPromptExample">
            {{ t('pages.home.ai.tryAnother') }}
          </q-chip>
        </div>

        <q-form @submit.prevent="askPeaceAI" class="ai-form">
          <q-input
            v-model="userPrompt"
            type="textarea"
            autogrow
            outlined
            :disable="isLoading"
            :label="t('pages.home.hero.aiLabel')"
            :placeholder="t('pages.home.ai.placeholder')"
          />
          <q-btn
            type="submit"
            color="primary"
            unelevated
            class="full-width"
            :disable="!canSubmit"
            :label="isLoading ? t('pages.home.ai.thinking') : t('pages.home.ai.ask')"
          />
        </q-form>

        <q-banner v-if="errorMessage" class="q-mt-sm bg-negative text-white" dense>
          {{ errorMessage }}
        </q-banner>

        <q-card-section v-if="aiResponse" class="response q-mt-sm">
          <div class="response-header">
            <div class="response-title">{{ t('pages.home.ai.responseTitle') }}</div>
            <q-btn flat round dense @click="copyResponse">
              <font-awesome-icon icon="fa-solid fa-copy" />
            </q-btn>
          </div>
          <pre class="response-content">{{ aiResponse }}</pre>
        </q-card-section>

        <q-separator class="q-my-sm" />

        <div class="history">
          <div class="history-header">
            <div class="text-subtitle2">{{ t('pages.home.ai.historyTitle') }}</div>
            <q-btn v-if="history.length" flat size="sm" color="negative" @click="clearHistory">
              {{ t('pages.home.ai.clearHistory') }}
            </q-btn>
          </div>
          <div v-if="!history.length" class="text-grey-6 text-caption q-mt-xs">
            {{ t('pages.home.ai.historyEmpty') }}
          </div>
          <q-list v-else separator class="q-mt-xs">
            <q-item v-for="item in history" :key="item.id" clickable @click="reusePrompt(item)">
              <q-item-section>
                <div class="text-weight-medium">{{ item.prompt }}</div>
                <div class="text-caption text-grey-6 history-response">{{ item.response }}</div>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round dense icon="refresh" @click.stop="reusePrompt(item)" :title="t('pages.home.ai.reuse')" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@vueuse/core'
import { useQuasar } from 'quasar'
import { sendDeepSeekChat } from '@/stores/services'

const { t, tm } = useI18n()
const $q = useQuasar()

const userPrompt = ref('')
const aiResponse = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const isLoading = ref(false)
const history = ref<{ id: string; prompt: string; response: string; ts: number }[]>([])
const HISTORY_KEY = 'peace-ai-history'

const { copy } = useClipboard({ source: aiResponse })

const promptExamples = computed<string[]>(() => {
  const raw = tm('pages.home.ai.examples') as unknown
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === 'string') return [raw]
  return []
})
const currentPromptIndex = ref(0)

const systemPrompt = `You are the PEACE2074 virtual guide. Use the Quran dataset embedded in the app (chapters, ayat metadata) and reference UI sections such as /quran and bookmarks. Keep answers concise (<=120 words) and mention navigation paths when relevant.`

const canSubmit = computed(() => userPrompt.value.trim().length > 4 && !isLoading.value)

function copyResponse() {
  if (!aiResponse.value) return
  copy(aiResponse.value)
  $q.notify({
    message: t('pages.home.ai.copied'),
    color: 'positive',
    position: 'top',
    timeout: 2000,
    icon: 'fas fa-check-circle',
  })
}

async function askPeaceAI() {
  if (!canSubmit.value) return
  isLoading.value = true
  errorMessage.value = null
  aiResponse.value = null // Clear previous response

  try {
    const res = await sendDeepSeekChat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt.value.trim() },
      ],
    })
    aiResponse.value = res?.message?.content ?? t('pages.home.ai.noReply')
    if (aiResponse.value) {
      addToHistory(userPrompt.value.trim(), aiResponse.value)
    }
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || t('pages.home.ai.requestFailed')
  } finally {
    isLoading.value = false
  }
}

function addToHistory(prompt: string, response: string) {
  const entry = { id: crypto.randomUUID?.() || String(Date.now()), prompt, response, ts: Date.now() }
  history.value = [entry, ...history.value].slice(0, 20)
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
  } catch {}
}

function loadHistory() {
  if (typeof localStorage === 'undefined') return
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        history.value = parsed
      }
    }
  } catch {}
}

function reusePrompt(entry: { prompt: string }) {
  userPrompt.value = entry.prompt
  errorMessage.value = null
  aiResponse.value = null
}

function clearHistory() {
  history.value = []
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {}
}

onMounted(() => {
  loadHistory()
})

function setNextPromptExample() {
  if (isLoading.value) return
  const examples = promptExamples.value
  if (!examples.length) return
  currentPromptIndex.value = (currentPromptIndex.value + 1) % examples.length
  userPrompt.value = examples[currentPromptIndex.value]
  errorMessage.value = null
  aiResponse.value = null
}
</script>

<style scoped>
.hero-content-vertical { 
  display: flex; 
  flex-direction: column; 
  gap: 24px; 
  max-width: 900px;
  margin: 0 auto;
}
.top-section { 
  text-align: center;
}
.title {
  font-size: 2.4rem;
  margin: 0 0 4px;
  color: #0f172a;
}
.lead {
  color: #334155;
  margin: 0 0 6px;
}
.actions { margin-top: 12px }
.ai-card { width: min(420px, 100%); backdrop-filter: blur(6px); }
.ai-header { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
.ai-title { font-weight:600; margin-bottom:4px; }
.ai-form { display:flex; flex-direction:column; gap:12px; margin-top:12px; }
.response { background:#f8fafc; border-radius:12px; position: relative; }
.response-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.response-title { font-weight:600; }
.response-content {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
  max-height: clamp(180px, 40vh, 340px);
  overflow: auto;
  word-break: break-word;
  overscroll-behavior: contain;
  padding-right: 4px;
}
.history-response {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  max-height: 2.8em;
  line-height: 1.4;
}
.full-width { width:100%; }
@media (max-width: 720px) {
  .home-hero { padding-top: 12px; }
  .hero-content { flex-direction: column; }
  .left { width: 100%; text-align: center; }
  .title { font-size: clamp(1.6rem, 6vw, 2.1rem); margin-bottom: 4px; }
  .lead { margin-bottom: 8px; }
  .actions { justify-content: center; margin-top: 10px; }
  .ai-card { width: 100%; align-self: stretch; }
  .ai-header { align-items: center; }
  .response-content {
    max-height: 240px;
  }
  .history {
    max-height: 260px;
    overflow: auto;
  }
}
</style>

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

      <q-card class="ai-card q-pa-md">
        <div class="ai-header">
          <div>
            <p class="ai-title">Ask PEACE AI</p>
            <small>Get guidance on chapters, reflections, or how to use the app.</small>
          </div>
          <q-chip clickable color="primary" text-color="white" size="sm" @click="setNextPromptExample">
            Try another prompt
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
            placeholder="Ask about a surah, theme, or feature"
          />
          <q-btn
            type="submit"
            color="primary"
            unelevated
            class="full-width"
            :disable="!canSubmit"
            :label="isLoading ? 'Thinking…' : 'Ask'"
          />
        </q-form>

        <q-banner v-if="errorMessage" class="q-mt-sm bg-negative text-white" dense>
          {{ errorMessage }}
        </q-banner>

        <q-card-section v-if="aiResponse" class="response q-mt-sm">
          <div class="response-header">
            <div class="response-title">AI Response</div>
            <q-btn flat round dense @click="copyResponse">
              <font-awesome-icon icon="fa-solid fa-copy" />
            </q-btn>
          </div>
          <pre class="response-content">{{ aiResponse }}</pre>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@vueuse/core'
import { useQuasar } from 'quasar'
import { sendDeepSeekChat } from '@/stores/services'

const { t } = useI18n()
const $q = useQuasar()

const userPrompt = ref('')
const aiResponse = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const isLoading = ref(false)

const { copy } = useClipboard({ source: aiResponse })

const promptExamples = [
  'Highlight two key lessons from Surah Maryam and where to read it here.',
  'What is the main theme of Surah Al-Fatiha?',
  'Can you give me a short reflection on patience from the Quran?',
  'Where can I find the story of Prophet Yusuf?',
  'Explain the significance of Laylat al-Qadr.',
]
const currentPromptIndex = ref(0)

const systemPrompt = `You are the PEACE2074 virtual guide. Use the Quran dataset embedded in the app (chapters, ayat metadata) and reference UI sections such as /quran and bookmarks. Keep answers concise (<=120 words) and mention navigation paths when relevant.`

const canSubmit = computed(() => userPrompt.value.trim().length > 4 && !isLoading.value)

function copyResponse() {
  if (!aiResponse.value) return
  copy(aiResponse.value)
  $q.notify({
    message: 'Response copied to clipboard!',
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
    aiResponse.value = res?.message?.content ?? 'No response received.'
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'DeepSeek request failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function setNextPromptExample() {
  if (isLoading.value) return
  currentPromptIndex.value = (currentPromptIndex.value + 1) % promptExamples.length
  userPrompt.value = promptExamples[currentPromptIndex.value]
  errorMessage.value = null
  aiResponse.value = null
}
</script>

<style scoped>
.hero-content { display:flex; gap:24px; align-items:stretch; justify-content:space-between; flex-wrap:wrap; }
.left { max-width: 640px; flex:1 1 360px }
.title { font-size: 2.4rem; margin: 0; color: #fff }
.lead { color: rgba(255, 255, 255, 0.78); margin-top: 8px }
.actions { margin-top: 16px }
.ai-card { width: 320px; max-width: 100%; backdrop-filter: blur(6px); }
.ai-header { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
.ai-title { font-weight:600; margin-bottom:4px; }
.ai-form { display:flex; flex-direction:column; gap:12px; margin-top:12px; }
.response { background:#f8fafc; border-radius:12px; position: relative; }
.response-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.response-title { font-weight:600; }
.response-content { white-space: pre-wrap; font-family: inherit; margin: 0; }
.full-width { width:100%; }
@media (max-width: 720px) { .hero-content { flex-direction: column; } .ai-card { width:100%; } }
</style>

<route lang="json">
{
  "meta": { "layout": "home" }
}
</route>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { sendDeepSeekChat } from '@/stores/services'

const { t, tm } = useI18n()
const userPrompt = ref('')
const aiResponse = ref<string | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const systemPrompt = `You are the PEACE2074 AI assistant. Use the Quran corpus available in the app (chapters, ayat, metadata) and guide users to relevant sections such as /quran or specific surah cards. Keep replies concise (<= 120 words).`

const canSubmit = computed(
  () => userPrompt.value.trim().length > 4 && !isLoading.value
)
const promptExamples = computed<string[]>(() => {
  const raw = tm('pages.home.ai.examples') as unknown
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === 'string') return [raw]
  return []
})

async function askPeaceAI() {
  if (!canSubmit.value) return

  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await sendDeepSeekChat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt.value.trim() },
      ],
    })

    // Check for API error
    if (response?.error) {
      const errorMsg =
        response.error.message ||
        response.error.data ||
        (typeof response.error === 'string' ? response.error : 'API error')
      throw new Error(errorMsg)
    }

    // Extract text content from response
    const text =
      response?.message?.content ||
      response?.choices?.[0]?.message?.content ||
      response?.raw?.[0]?.message?.content ||
      (typeof response?.message === 'string' ? response.message : null)

    aiResponse.value = text || t('pages.home.ai.noReply')
  } catch (error: any) {
    errorMessage.value =
      error?.message || String(error) || t('pages.home.ai.requestFailed')
  } finally {
    isLoading.value = false
  }
}

function setPromptExample() {
  if (isLoading.value) return
  const example = promptExamples.value[0]
  if (!example) return
  userPrompt.value = example
  aiResponse.value = null
  errorMessage.value = null
}
</script>

<template>
  <q-page padding>
    <div class="hero-grid">
      <div class="hero">
        <img class="logo app-logo" src="/logo.svg" alt="PEACE2074" />
        <h1 class="title">{{ t('welcome') }} {{ t('general.SiteTitle') }}</h1>
        <p class="subtitle">{{ t('pages.home.hero.lead') }}</p>
        <div class="grid">
          <RouterLink to="/quran" class="tile">
            <div class="tile-inner">
              <span class="tile-title">{{ t('appShell.nav.quran') }}</span>
              <span class="tile-sub">{{ t('pages.quran.title') }}</span>
            </div>
          </RouterLink>
          <RouterLink to="/holynames" class="tile">
            <div class="tile-inner">
              <span class="tile-title">{{ t('appShell.nav.holynames') }}</span>
              <span class="tile-sub">{{
                t('The 99 Holy Names of Allah')
              }}</span>
            </div>
          </RouterLink>
          <RouterLink to="/tasbeeh" class="tile">
            <div class="tile-inner">
              <span class="tile-title">{{ t('appShell.nav.tasbeeh') }}</span>
              <span class="tile-sub">{{ t('pages.tasbeeh') }}</span>
            </div>
          </RouterLink>
        </div>
      </div>

      <section class="ai-card">
        <div class="ai-header">
          <div>
            <p class="ai-title">{{ t('pages.home.ai.title') }}</p>
            <small>{{ t('pages.home.ai.subtitle') }}</small>
          </div>
          <button type="button" class="chip mini" @click="setPromptExample">
            {{ t('pages.home.ai.tryAnother') }}
          </button>
        </div>

        <form class="ai-form" @submit.prevent="askPeaceAI">
          <label class="sr-only" for="peace-ai-input">{{
            t('pages.home.ai.title')
          }}</label>
          <textarea
            id="peace-ai-input"
            v-model="userPrompt"
            class="ai-textarea"
            rows="3"
            :placeholder="t('pages.home.ai.placeholder')"
          />
          <button type="submit" class="ask-btn" :disabled="!canSubmit">
            <span v-if="!isLoading">{{ t('pages.home.ai.ask') }}</span>
            <span v-else>{{ t('pages.home.ai.thinking') }}</span>
          </button>
        </form>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <div v-if="aiResponse" class="ai-response">
          <p class="ai-response-text">{{ aiResponse }}</p>
        </div>
      </section>
    </div>
  </q-page>
</template>

<style scoped>
.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  align-items: stretch;
}
.hero {
  display: grid;
  place-items: center;
  text-align: center;
}
.logo {
  width: 96px;
  height: auto;
  margin-bottom: 0.6rem;
}
.title {
  font-size: 2.2rem;
  margin: 0.2rem 0;
}
.subtitle {
  color: #6c757d;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 680px;
  margin-top: 1rem;
}
.tile {
  text-decoration: none;
  color: inherit;
}
.tile-inner {
  border: 1px solid #e2e2e2;
  border-radius: 12px;
  padding: 1rem;
}
.tile-title {
  font-weight: 600;
}
.tile-sub {
  color: #6c757d;
  font-size: 0.9rem;
}

.ai-card {
  border: 1px solid #e4e6eb;
  border-radius: 16px;
  padding: 1.25rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}
.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}
.ai-title {
  font-weight: 600;
  margin-bottom: 0.2rem;
}
.chip {
  border: 1px solid #d2d6dc;
  border-radius: 999px;
  padding: 0.3rem 0.9rem;
  background: #f8fafc;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s ease;
}
.chip.mini {
  white-space: nowrap;
}
.chip:hover {
  background: #e2e8f0;
}
.ai-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.ai-textarea {
  width: 100%;
  border: 1px solid #cbd5f5;
  border-radius: 12px;
  padding: 0.9rem;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
}
.ask-btn {
  background: linear-gradient(120deg, #2563eb, #7c3aed);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.65rem 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
  min-width: 120px;
}
.ask-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.error {
  color: #b91c1c;
  margin-top: 0.75rem;
}
.ai-response {
  margin-top: 1.25rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}
.ai-response-text {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.6;
  margin: 0;
}
.ai-response h3 {
  margin-bottom: 0.4rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 640px) {
  .ask-btn {
    width: 100%;
    text-align: center;
  }
  .ai-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

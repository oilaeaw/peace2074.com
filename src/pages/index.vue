<route lang="json">
{
  "meta": { "layout": "home" }
}
</route>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { sendKimiChat } from '@/stores/services'

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
    const response = await sendKimiChat({
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

      <section class="video-section">
        <h2 class="section-title">
          {{ t('pages.home.video.title', 'App Preview') }}
        </h2>
        <div class="video-container">
          <iframe
            src="https://www.youtube.com/embed/?enablejsapi=1&rel=0&autoplay=0&playsinline=1&fs=1"
            title="PEACE2074 Video"
            frameborder="0"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
              web-share;
            "
            allowfullscreen
            class="responsive-iframe"
          ></iframe>
        </div>
      </section>

      <section class="screenshots-section">
        <h2 class="section-title">Available on Apple TV & Apple Watch</h2>
        <div class="screenshots-container">
          <div class="screenshot-group tv">
            <h3>Apple TV</h3>
            <div class="images">
              <img
                src="/screenshots/tv-1.png"
                alt="Apple TV Home"
                loading="lazy"
              />
              <img
                src="/screenshots/tv-2.png"
                alt="Apple TV Player"
                loading="lazy"
              />
              <img
                src="/screenshots/tv-3.png"
                alt="Apple TV Bookmarks"
                loading="lazy"
              />
            </div>
          </div>
          <div class="screenshot-group watch">
            <h3>Apple Watch</h3>
            <div class="images">
              <img
                src="/screenshots/watch-1.png"
                alt="Apple Watch Home"
                loading="lazy"
              />
              <img
                src="/screenshots/watch-2.png"
                alt="Apple Watch Player"
                loading="lazy"
              />
              <img
                src="/screenshots/watch-3.png"
                alt="Apple Watch Bookmarks"
                loading="lazy"
              />
            </div>
          </div>
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
  min-width: 0;
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
  overflow: hidden;
}
.ai-response-text {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.6;
  margin: 0;
  font-family: inherit;
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

.video-section {
  grid-column: 1 / -1;
  border: 1px solid #e4e6eb;
  border-radius: 16px;
  padding: 1.5rem;
  background: #fff;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}
.video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}
.responsive-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.screenshots-section {
  grid-column: 1 / -1;
  border: 1px solid #e4e6eb;
  border-radius: 16px;
  padding: 1.5rem;
  background: #fff;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1.5rem;
  margin-top: 0;
}
.screenshots-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.screenshot-group h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #334155;
  font-weight: 500;
}
.screenshot-group .images {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}
.screenshot-group.tv img {
  width: 320px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.screenshot-group.watch img {
  width: 160px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
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

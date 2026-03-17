<template>
  <q-page class="home-hero q-pa-lg">
    <div class="hero-content-vertical">
      <!-- Daily Banner Message -->
      <div class="daily-banner q-mb-lg">
        <div class="daily-banner-inner">
          <q-icon name="auto_awesome" size="24px" class="q-mr-sm" />
          <span class="daily-message">{{ dailyMessage }}</span>
        </div>
      </div>

      <div class="top-section">
        <h1 class="title">{{ t('pages.home.hero.title') }}</h1>
        <p class="lead">{{ t('pages.home.hero.lead') }}</p>
        <div class="actions">
          <q-btn to="/quran" :label="t('pages.home.hero.ctaReadQuran')" color="primary" class="q-mr-sm" />
          <q-btn to="/holynames" :label="t('pages.home.hero.ctaHolyNames')" color="primary" outline class="q-mr-sm" />
          <q-btn to="/tasbeeh" flat :label="t('pages.home.hero.ctaTasbeeh')" />
        </div>
      </div>

      <!-- Daily Quranic Verse -->
      <q-card class="manifesto-card q-pa-lg q-mt-lg relative-position">
        <div class="absolute-top-right q-pa-sm">
          <q-btn
            flat
            round
            dense
            icon="content_copy"
            color="primary"
            class="q-mr-xs"
            @click="copyVerse"
          >
            <q-tooltip>{{ t('pages.home.ai.copy') }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="shuffle"
            color="primary"
            @click="shuffleVerse"
          >
            <q-tooltip>{{ t('pages.home.ai.tryAnother') }}</q-tooltip>
          </q-btn>
        </div>
        <div class="verse-arabic">{{ displayedVerse.ar }}</div>
        <blockquote class="manifesto-quote">
          {{ displayedVerse.en }}
        </blockquote>
        <p class="manifesto-attribution">
          <router-link :to="`/quran/${displayedVerse.sura}:${displayedVerse.ayah}`" class="verse-link">
            — {{ displayedVerse.ref }}
          </router-link>
        </p>
      </q-card>

      <q-banner v-if="showRamadanCampaign" class="ramadan-banner q-pa-md">
        <div class="ramadan-eyebrow">{{ t('pages.home.ramadan.badge') }}</div>
        <div class="ramadan-title">{{ t('pages.home.ramadan.title') }}</div>
        <div class="ramadan-body">{{ t('pages.home.ramadan.body') }}</div>

        <div v-if="dailyRamadanPrompt" class="ramadan-prompt q-mt-sm">
          <div class="ramadan-prompt-label">{{ t('pages.home.ramadan.todayPrompt') }}</div>
          <div>{{ dailyRamadanPrompt }}</div>
        </div>

        <div class="ramadan-actions q-mt-md">
          <q-btn
            color="primary"
            unelevated
            size="sm"
            :label="t('pages.home.ramadan.ctaQuran')"
            @click="onRamadanCta('quran')"
          />
          <q-btn
            color="secondary"
            outline
            size="sm"
            :label="t('pages.home.ramadan.ctaTasbeeh')"
            @click="onRamadanCta('tasbeeh')"
          />
          <q-btn
            color="primary"
            flat
            size="sm"
            :label="t('pages.home.ramadan.ctaChat')"
            @click="onRamadanCta('chat')"
          />
          <q-btn
            v-if="dailyRamadanPrompt"
            flat
            size="sm"
            icon="auto_awesome"
            :label="t('pages.home.ramadan.usePrompt')"
            @click="applyRamadanPrompt"
          />
        </div>
      </q-banner>

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

      <q-card class="blog-card q-pa-md">
        <div class="blog-header">
          <div>
            <p class="blog-title">{{ t('pages.blog.title') }}</p>
            <small>{{ t('pages.blog.subtitle') }}</small>
          </div>
          <q-btn flat color="primary" to="/blog" :label="t('appShell.nav.blog')" />
        </div>

        <div v-if="blogLoading" class="text-center q-py-md">
          <q-spinner color="primary" size="28px" />
        </div>

        <q-list v-else-if="allPostsSorted.length" separator class="q-mt-sm">
          <q-item
            v-for="post in allPostsSorted"
            :key="post.slug"
            clickable
            @click="goToBlogPost(post.slug)"
          >
            <q-item-section>
              <div class="text-weight-medium">{{ post.title }}</div>
              <div class="text-caption text-grey-6">{{ formatBlogDate(post.date) }}</div>
              <div class="text-body2 blog-excerpt">{{ post.excerpt }}</div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="text-grey-6 text-caption q-mt-sm">
          {{ t('pages.blog.empty') }}
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
import { useRouter } from 'vue-router'
import { sendDeepSeekChat } from '@/stores/services'
import { getRamadanPrompt, isRamadanCampaignActive, ramadanCampaign } from '@/app/config/ramadan'
import inspiringVerses from '@/app/data/verses.json'
import dailyMessagesData from '@/app/data/daily-messages.json'

const { t, tm, locale } = useI18n()
const $q = useQuasar()
const router = useRouter()

const userPrompt = ref('')
const aiResponse = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const isLoading = ref(false)
const history = ref<{ id: string; prompt: string; response: string; ts: number }[]>([])
type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string
}

const allPosts = ref<BlogPost[]>([])
const blogLoading = ref(false)
const HISTORY_KEY = 'peace-ai-history'
const RAMADAN_IMPRESSION_KEY = 'ramadan-campaign-last-view'

const { copy } = useClipboard({ source: aiResponse })

// Daily message selection based on day of week
const dailyMessage = computed(() => {
  const currentLang = locale.value || 'en'
  const dayOfWeek = new Date().getDay()
  const messages = dailyMessagesData[dayOfWeek % dailyMessagesData.length]
  return messages[currentLang as keyof typeof messages] || messages.en
})

const promptExamples = computed<string[]>(() => {
  const raw = tm('pages.home.ai.examples') as unknown
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === 'string') return [raw]
  return []
})

const displayedVerse = ref(inspiringVerses[0])

const allPostsSorted = computed(() => {
  return [...allPosts.value].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
})

const setDailyVerse = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = (now as any) - (start as any)
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)
  displayedVerse.value = inspiringVerses[dayOfYear % inspiringVerses.length]
}

const shuffleVerse = () => {
  const randomIndex = Math.floor(Math.random() * inspiringVerses.length)
  displayedVerse.value = inspiringVerses[randomIndex]
}

const copyVerse = async () => {
  const text = `${displayedVerse.value.ar}\n\n${displayedVerse.value.en}\n— ${displayedVerse.value.ref}`
  await copy(text)
  $q.notify({
    message: t('pages.home.ai.copied'),
    color: 'positive',
    icon: 'check',
    timeout: 2000
  })
}

const setNextPromptExample = () => {
  currentPromptIndex.value = (currentPromptIndex.value + 1) % promptExamples.value.length
  userPrompt.value = promptExamples.value[currentPromptIndex.value]
}

const askPeaceAI = async () => {
  if (!canSubmit.value) return
  isLoading.value = true
  errorMessage.value = null
  try {
    const res = await sendDeepSeekChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt.value }
    ])
    aiResponse.value = res
    history.value.unshift({
      id: Date.now().toString(),
      prompt: userPrompt.value,
      response: res,
      ts: Date.now()
    })
    userPrompt.value = ''
  } catch (err: any) {
    errorMessage.value = err.message || 'AI request failed'
  } finally {
    isLoading.value = false
  }
}

const copyResponse = async () => {
  if (aiResponse.value) {
    await copy(aiResponse.value)
    $q.notify({ message: t('pages.home.ai.copied'), color: 'positive' })
  }
}

const clearHistory = () => { history.value = [] }

const reusePrompt = (item: any) => { userPrompt.value = item.prompt }

const onRamadanCta = (target: string) => {
  if (target === 'chat') {
    userPrompt.value = dailyRamadanPrompt.value
  } else {
    router.push(`/${target}`)
  }
}

const applyRamadanPrompt = () => {
  userPrompt.value = dailyRamadanPrompt.value
}

const goToBlogPost = (slug: string) => {
  router.push(`/blog/${slug}`)
}

const formatBlogDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const loadAllBlogPosts = async () => {
  blogLoading.value = true
  try {
    const res = await fetch('/api/blog', {
      credentials: 'include',
    })
    const data = await res.json()
    if (data?.ok && Array.isArray(data.posts)) {
      allPosts.value = data.posts
    } else {
      allPosts.value = []
    }
  } catch (err) {
    console.error('[Home] Failed to load blog posts:', err)
    allPosts.value = []
  } finally {
    blogLoading.value = false
  }
}

onMounted(async () => {
  setDailyVerse()
  if (promptExamples.value.length > 0) {
    userPrompt.value = promptExamples.value[0]
  }
  await loadAllBlogPosts()
});

const currentPromptIndex = ref(0);

const systemPrompt = `You are the PEACE2074 virtual guide. Use the Quran dataset embedded in the app (chapters, ayat metadata) and reference UI sections such as /quran and bookmarks. Keep answers concise (<=120 words) and mention navigation paths when relevant.`;

const canSubmit = computed(() => userPrompt.value.trim().length > 4 && !isLoading.value);
const isRamadanPreview = computed(() => String(router.currentRoute.value?.query?.campaign || '').toLowerCase() === 'ramadan');
const showRamadanCampaign = computed(() => isRamadanCampaignActive() || isRamadanPreview.value);
const dailyRamadanPrompt = computed(() => {
  if (!showRamadanCampaign.value) return ''
  return getRamadanPrompt(String(locale.value || 'en'))
})
</script>

<style scoped lang="scss">
/* Light theme colors */
.home-hero {
  background: #f5f7fa;
  min-height: 100vh;
}

.daily-banner {
  margin: -1rem -1rem 0;
  padding: 1.5rem 1rem;
  background: #e8eef5;
  border-radius: 12px;
  border: 1px solid #d1dce6;
  animation: slideDown 0.6s ease-out;
}

.daily-banner-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5468a7;
  font-weight: 500;
  font-size: 1.1rem;
  text-align: center;
}

.daily-message {
  font-style: italic;
  color: #2c3e50;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.top-section {
  text-align: center;
  padding: 3rem 0 2rem;
  animation: fadeIn 0.8s ease-out 0.2s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.title {
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.lead {
  font-size: clamp(1.1rem, 3vw, 1.4rem);
  color: #546e7a;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.manifesto-card {
  background: #ffffff;
  border: 1px solid #e0e6ed;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: slideUp 0.8s ease-out 0.4s both;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.verse-arabic {
  font-size: clamp(1.5rem, 4vw, 2rem);
  text-align: center;
  color: #5468a7;
  margin-bottom: 1.5rem;
  font-weight: 600;
  line-height: 1.8;
  direction: rtl;
}

.manifesto-quote {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #2c3e50;
  font-style: italic;
  margin: 0 0 1rem;
  text-align: center;
  border: none;
  padding: 0;
}

.manifesto-attribution {
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.verse-link {
  color: #5468a7;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: #3b4d7a;
    text-decoration: underline;
  }
}

.ramadan-banner {
  background: #fce4ec;
  border: 1px solid #f8bbd0;
  color: #d81b60;
  border-radius: 16px;
  margin-top: 1.5rem;
  animation: slideUp 0.8s ease-out 0.6s both;
}

.ramadan-eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.ramadan-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.ramadan-body {
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.95;
}

.ramadan-prompt {
  background: #f3e5f5;
  border: 1px solid #e1bee7;
  padding: 1rem;
  border-radius: 8px;
}

.ramadan-prompt-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.ramadan-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.ai-card {
  background: #ffffff;
  border: 1px solid #e0e6ed;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  animation: slideUp 0.8s ease-out 0.8s both;
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.ai-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem;
}

.ai-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.blog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem;
}

.blog-excerpt {
  margin-top: 0.5rem;
  color: #64748b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Dark theme support */
:deep(body.body--dark) .home-hero,
.body--dark .home-hero {
  background: #1a1d26;
}

:deep(body.body--dark) .daily-banner,
.body--dark .daily-banner {
  background: #2a2f3d;
  border-color: #3a3f4d;
}

:deep(body.body--dark) .daily-banner-inner,
.body--dark .daily-banner-inner {
  color: #7b8ab8;
}

:deep(body.body--dark) .daily-message,
.body--dark .daily-message {
  color: #cbd5e1;
}

:deep(body.body--dark) .title,
.body--dark .title {
  color: #f1f5f9;
}

:deep(body.body--dark) .lead,
.body--dark .lead {
  color: #94a3b8;
}

:deep(body.body--dark) .manifesto-card,
.body--dark .manifesto-card {
  background: #2a2f3d;
  border-color: #3a3f4d;
}

:deep(body.body--dark) .verse-arabic,
.body--dark .verse-arabic {
  color: #7b8ab8;
}

:deep(body.body--dark) .manifesto-quote,
.body--dark .manifesto-quote {
  color: #e2e8f0;
}

:deep(body.body--dark) .manifesto-attribution,
.body--dark .manifesto-attribution {
  color: #94a3b8;
}

:deep(body.body--dark) .verse-link,
.body--dark .verse-link {
  color: #7b8ab8;

  &:hover {
    color: #9ca9d0;
  }
}

:deep(body.body--dark) .ramadan-banner,
.body--dark .ramadan-banner {
  background: #3d2633;
  border-color: #4d3643;
  color: #f8bbd0;
}

:deep(body.body--dark) .ramadan-prompt,
.body--dark .ramadan-prompt {
  background: #2d1f29;
  border-color: #3d2f39;
}

:deep(body.body--dark) .ai-card,
.body--dark .ai-card {
  background: #2a2f3d;
  border-color: #3a3f4d;
}

:deep(body.body--dark) .ai-title,
.body--dark .ai-title,
:deep(body.body--dark) .blog-title,
.body--dark .blog-title {
  color: #f1f5f9;
}

:deep(body.body--dark) .blog-excerpt,
.body--dark .blog-excerpt {
  color: #94a3b8;
}

@media (max-width: 600px) {
  .daily-banner {
    padding: 1rem 0.75rem;
  }

  .daily-banner-inner {
    font-size: 0.95rem;
  }

  .top-section {
    padding: 2rem 0 1.5rem;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

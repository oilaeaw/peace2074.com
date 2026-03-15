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

        <q-list v-else-if="recentPosts.length" separator class="q-mt-sm">
          <q-item
            v-for="post in recentPosts"
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

const { t, tm, locale } = useI18n()
const $q = useQuasar()
const router = useRouter()

const userPrompt = ref('')
const aiResponse = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const isLoading = ref(false)
const history = ref<{ id: string; prompt: string; response: string; ts: number }[]>([])
const recentPosts = ref<{ slug: string; title: string; excerpt: string; date: string }[]>([])
const blogLoading = ref(false)
const HISTORY_KEY = 'peace-ai-history'
const RAMADAN_IMPRESSION_KEY = 'ramadan-campaign-last-view'

const { copy } = useClipboard({ source: aiResponse })

const promptExamples = computed<string[]>(() => {
  const raw = tm('pages.home.ai.examples') as unknown
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === 'string') return [raw]
  return []
})

const displayedVerse = ref(inspiringVerses[0])

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

onMounted(() => {
  setDailyVerse()
  if (promptExamples.value.length > 0) {
    userPrompt.value = promptExamples.value[0]
  }
})
const currentPromptIndex = ref(0)

const systemPrompt = `You are the PEACE2074 virtual guide. Use the Quran dataset embedded in the app (chapters, ayat metadata) and reference UI sections such as /quran and bookmarks. Keep answers concise (<=120 words) and mention navigation paths when relevant.`

const canSubmit = computed(() => userPrompt.value.trim().length > 4 && !isLoading.value)
const isRamadanPreview = computed(() => String(router.currentRoute.value?.query?.campaign || '').toLowerCase() === 'ramadan')
const showRamadanCampaign = computed(() => isRamadanCampaignActive() || isRamadanPreview.value)
const dailyRamadanPrompt = computed(() => {
  if (!showRamadanCampaign.value) return ''
  return getRamadanPrompt(String(locale.value || 'en'))
})
</script>
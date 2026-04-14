<template>
  <q-page padding class="blog-detail">
    <q-breadcrumbs class="q-mb-md">
      <q-breadcrumbs-el :label="t('appShell.nav.home')" icon="home" to="/" />
      <q-breadcrumbs-el :label="t('pages.blog.title')" to="/blog" />
      <q-breadcrumbs-el :label="post?.title || t('pages.blog.notFound')" />
    </q-breadcrumbs>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="post" class="q-gutter-md">
      <div class="text-h4">{{ post.title }}</div>
      <div class="text-caption text-grey-6">{{ formatDate(post.date) }}</div>
      <div class="row q-gutter-xs q-mt-sm">
        <q-badge v-for="tag in post.tags" :key="tag" color="primary" outline>{{
          tag
        }}</q-badge>
      </div>
      <div class="row q-gutter-sm items-center q-mt-sm">
        <q-btn
          :icon="isLiked ? 'favorite' : 'favorite_border'"
          :color="isLiked ? 'red' : 'grey'"
          :label="blogLikeLabel"
          outline
          @click="handleLike"
        />
        <q-btn
          v-if="isAuthenticated"
          flat
          color="primary"
          icon="edit"
          :label="t('general.edit')"
          @click="editPost"
        />
      </div>
      <q-separator />
      <div class="text-body1 prewrap">{{ post.content }}</div>
    </div>

    <q-banner v-else rounded class="q-mt-lg" color="warning" text-color="black">
      {{ t('pages.blog.notFound') }}
    </q-banner>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.pinia'
import { useQuasar } from 'quasar'
import { trackAnalyticsEvent } from '@/utils/analytics'
import {
  applySeoMeta,
  buildBlogPostingStructuredData,
  buildBreadcrumbStructuredData,
  buildPageStructuredData,
  SEO_BASE_URL,
} from '@/utils/seo'
import {
  toggleBlogLike,
  fetchBlogLikes,
  resolveNitroUrl,
} from '@/stores/services'

type BlogPostDetail = {
  slug: string
  title: string
  excerpt?: string
  content?: string
  tags?: string[]
  date?: string
  author?: string
  createdAt?: string
  updatedAt?: string
}

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const $q = useQuasar()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const post = ref<BlogPostDetail | null>(null)
const loading = ref(true)
const likeCount = ref(0)
const isLiked = ref(false)
let lastTrackedBlogViewKey = ''

const blogLikeLabel = computed(() =>
  likeCount.value === 1
    ? t('pages.blog.likeSingle', { count: likeCount.value })
    : t('pages.blog.likePlural', { count: likeCount.value })
)

const BLOG_KEYWORDS = ['Islamic blog', 'Quran reflections', 'PEACE2074 updates']

function toCanonicalSlug(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function buildExcerpt(postData: BlogPostDetail) {
  const excerpt = String(postData.excerpt || '').trim()
  if (excerpt) {
    return excerpt
  }

  const content = String(postData.content || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!content) {
    return `${String(postData.title || t('pages.blog.title')).trim()} — ${String(
      t('pages.blog.subtitle') || ''
    ).trim()}`
  }

  return content.length > 160 ? `${content.slice(0, 157).trimEnd()}…` : content
}

function applyMissingBlogSeo() {
  const slug = String(route.params.slug || '')
  const title = `${String(t('pages.blog.notFound') || 'Post not found')} | PEACE2074`
  const description = String(t('pages.blog.notFound') || 'Blog post not found.')

  applySeoMeta({
    title,
    description,
    canonical: `/blog/${encodeURIComponent(slug)}`,
    robots: 'noindex,nofollow,noarchive',
    locale: String(locale.value || 'en'),
    structuredData: buildPageStructuredData({
      type: 'WebPage',
      title: String(t('pages.blog.notFound') || 'Post not found'),
      description,
      canonical: `/blog/${encodeURIComponent(slug)}`,
      locale: String(locale.value || 'en'),
      keywords: BLOG_KEYWORDS,
    }),
  })
}

function applyBlogSeo(postData: BlogPostDetail) {
  if (!postData || typeof document === 'undefined') return
  const title = String(postData.title || t('pages.blog.title')).trim()
  const excerpt = buildExcerpt(postData)
  const canonicalSlug = toCanonicalSlug(
    String(postData.slug || route.params.slug || '')
  )
  const canonicalUrl = `${SEO_BASE_URL}/blog/${encodeURIComponent(canonicalSlug)}`
  const docTitle = `${title} | PEACE2074`
  const tags = Array.isArray(postData.tags)
    ? postData.tags.filter((tag): tag is string =>
        Boolean(String(tag || '').trim())
      )
    : []
  const author = String(postData.author || 'PEACE2074').trim()
  const publishedTime = String(postData.date || postData.createdAt || '').trim()
  const modifiedTime = String(postData.updatedAt || postData.date || '').trim()
  const description = excerpt || `${title} — ${t('pages.blog.subtitle')}`

  applySeoMeta({
    title: docTitle,
    description,
    canonical: canonicalUrl,
    keywords: [...BLOG_KEYWORDS, ...tags],
    locale: String(locale.value || 'en'),
    ogType: 'article',
    article: {
      publishedTime: publishedTime || undefined,
      modifiedTime: modifiedTime || undefined,
      authors: author ? [author] : undefined,
      tags,
      section: String(t('pages.blog.title') || 'Blog'),
    },
    structuredData: [
      buildBlogPostingStructuredData({
        title,
        description,
        canonical: canonicalUrl,
        locale: String(locale.value || 'en'),
        author,
        publishedTime: publishedTime || undefined,
        modifiedTime: modifiedTime || undefined,
        tags,
      }),
      buildBreadcrumbStructuredData([
        {
          name: String(t('appShell.nav.home') || 'Home'),
          item: SEO_BASE_URL,
        },
        {
          name: String(t('pages.blog.title') || 'Blog'),
          item: `${SEO_BASE_URL}/blog`,
        },
        {
          name: title,
          item: canonicalUrl,
        },
      ]),
    ],
  })
}

function trackBlogView(postData: BlogPostDetail) {
  const slug = toCanonicalSlug(String(postData.slug || route.params.slug || ''))
  const trackingKey = `${slug}|${String(locale.value || 'en')}`

  if (!slug || lastTrackedBlogViewKey === trackingKey) {
    return
  }

  lastTrackedBlogViewKey = trackingKey

  trackAnalyticsEvent('blog_post_view', {
    slug,
    author: postData.author,
    tags: postData.tags || [],
    published_date: postData.date,
    page_path: `/blog/${slug}`,
    locale: String(locale.value || 'en'),
  })
}

async function loadPost(slug: string) {
  loading.value = true
  try {
    const res = await fetch(
      `${resolveNitroUrl('/blog')}?slug=${encodeURIComponent(slug)}`,
      {
        credentials: 'include',
      }
    )
    const data = await res.json()
    if (data.ok && data.post) {
      post.value = data.post
      const apiCanonical = String(data.canonicalSlug || '').trim()
      const routeCanonical = toCanonicalSlug(slug)
      const targetCanonical =
        apiCanonical || toCanonicalSlug(String(data.post?.slug || ''))

      if (targetCanonical && targetCanonical !== routeCanonical) {
        router.replace(`/blog/${encodeURIComponent(targetCanonical)}`)
      }

      applyBlogSeo(data.post)
      trackBlogView(data.post)
      await loadLikes(targetCanonical || slug)
    } else {
      post.value = null
      applyMissingBlogSeo()
    }
  } catch (err) {
    console.error('[Blog Detail] Load error:', err)
    post.value = null
    applyMissingBlogSeo()
  } finally {
    loading.value = false
  }
}

async function loadLikes(slug: string) {
  try {
    const data = await fetchBlogLikes()
    if (data.ok) {
      likeCount.value = data.likeCounts?.[slug] || 0
      isLiked.value = data.userLiked?.includes(slug) || false
    }
  } catch (err) {
    console.error('[Blog Detail] Load likes error:', err)
  }
}

async function handleLike() {
  const slug = String(route.params.slug || '')

  if (!isAuthenticated.value) {
    $q.notify({
      type: 'warning',
      message: t('pages.blog.editor.authRequired'),
      icon: 'lock',
      actions: [
        {
          label: t('auth.login'),
          color: 'white',
          handler: () => router.push('/login'),
        },
      ],
    })
    return
  }

  try {
    const result = await toggleBlogLike(slug)
    if (result.ok) {
      likeCount.value = result.count
      isLiked.value = result.liked

      trackAnalyticsEvent('blog_post_like', {
        action: result.liked ? 'like' : 'unlike',
        slug,
        page_path: `/blog/${slug}`,
        locale: String(locale.value || 'en'),
      })
    }
  } catch (err) {
    console.error('[Blog Detail] Like error:', err)
    $q.notify({
      type: 'negative',
      message: t('pages.blog.likeUpdateError'),
      icon: 'error',
    })
  }
}

function editPost() {
  const slug = String(route.params.slug || '')
  router.push(`/blog-editor?slug=${encodeURIComponent(slug)}`)
}

function formatDate(date?: string) {
  try {
    return date ? new Date(date).toLocaleDateString() : ''
  } catch {
    return date || ''
  }
}

onMounted(() => {
  const slug = decodeURIComponent(String(route.params.slug || ''))
  if (slug) {
    loadPost(slug)
  }
})

watch(
  () => route.params.slug,
  (newSlug) => {
    if (newSlug) {
      loadPost(decodeURIComponent(String(newSlug)))
    }
  }
)

watch(locale, () => {
  if (post.value) {
    applyBlogSeo(post.value)
    return
  }

  applyMissingBlogSeo()
})
</script>

<style scoped>
.blog-detail {
  max-width: 900px;
  margin: 0 auto;
}
.prewrap {
  white-space: pre-wrap;
}
</style>

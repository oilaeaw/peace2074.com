<template>
  <q-page padding class="blog-page">
    <section class="hero">
      <h1>{{ t('pages.blog.title') }}</h1>
      <p class="subtitle">{{ t('pages.blog.subtitle') }}</p>
    </section>

    <div class="actions-bar q-mt-md q-mb-md">
      <q-btn
        v-if="isAuthenticated"
        color="primary"
        icon="add"
        :label="t('pages.blog.newPost')"
        @click="$router.push('/blog-editor')"
      />
      <q-banner v-else rounded class="auth-banner" dense>
        <template v-slot:avatar>
          <q-icon name="lock" />
        </template>
        {{ t('pages.blog.editor.authRequired') }}
        <template v-slot:action>
          <q-btn
            flat
            color="primary"
            icon="login"
            :label="t('auth.login')"
            @click="$router.push('/login')"
          />
        </template>
      </q-banner>
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else class="q-gutter-md q-mt-lg">
      <q-card
        v-for="post in postsSorted"
        :key="post.slug"
        clickable
        v-ripple
        @click="go(post.slug)"
      >
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="col">
              <div class="text-h6">{{ post.title }}</div>
              <div class="text-caption text-grey-6 q-mt-xs">
                {{ formatDate(post.date) }}
              </div>
            </div>
            <div class="column q-gutter-xs">
              <div class="row q-gutter-xs">
                <q-badge
                  v-for="tag in post.tags"
                  :key="tag"
                  color="primary"
                  outline
                  >{{ tag }}</q-badge
                >
              </div>
              <div class="row q-gutter-xs items-center">
                <q-btn
                  dense
                  flat
                  size="sm"
                  :icon="isLiked(post.slug) ? 'favorite' : 'favorite_border'"
                  :color="isLiked(post.slug) ? 'red' : 'grey'"
                  @click.stop="handleLike(post.slug, $event)"
                >
                  <q-badge
                    v-if="getLikeCount(post.slug) > 0"
                    color="red"
                    floating
                  >
                    {{ getLikeCount(post.slug) }}
                  </q-badge>
                </q-btn>
                <q-btn
                  v-if="isAuthenticated"
                  dense
                  flat
                  size="sm"
                  icon="edit"
                  color="primary"
                  @click.stop="editPost(post.slug)"
                />
              </div>
            </div>
          </div>
          <div class="text-body2 q-mt-sm">{{ post.excerpt }}</div>
        </q-card-section>
      </q-card>
      <q-banner v-if="!postsSorted.length" class="q-mt-md" rounded>
        {{ t('pages.blog.empty') }}
      </q-banner>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.pinia'
import { useQuasar } from 'quasar'
import { trackAnalyticsEvent } from '@/utils/analytics'
import {
  applySeoMeta,
  buildBreadcrumbStructuredData,
  buildPageStructuredData,
  SEO_BASE_URL,
} from '@/utils/seo'
import {
  fetchBlogLikes,
  toggleBlogLike,
  resolveNitroUrl,
} from '@/stores/services'

type BlogPostSummary = {
  slug: string
  title: string
  excerpt?: string
  date: string
  tags: string[]
}

const BLOG_CANONICAL_PATH = '/blog'
const BLOG_KEYWORDS = ['Islamic blog', 'Quran reflections', 'PEACE2074 updates']

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const posts = ref<BlogPostSummary[]>([])
const loading = ref(true)
const likeCounts = ref<Record<string, number>>({})
const userLiked = ref<string[]>([])

const postsSorted = computed(() => {
  return [...posts.value].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
})

async function loadPosts() {
  loading.value = true
  try {
    const res = await fetch(resolveNitroUrl('/blog'), {
      credentials: 'include',
    })
    const data = await res.json()
    if (data.ok && data.posts) {
      posts.value = data.posts
      trackAnalyticsEvent('blog_list_view', {
        posts_count: data.posts.length,
        page_path: BLOG_CANONICAL_PATH,
        locale: String(locale.value || 'en'),
      })
    }
  } catch (err) {
    console.error('[Blog] Load error:', err)
  } finally {
    loading.value = false
  }
}

async function loadLikes() {
  try {
    const data = await fetchBlogLikes()
    if (data.ok) {
      likeCounts.value = data.likeCounts || {}
      userLiked.value = data.userLiked || []
    }
  } catch (err) {
    console.error('[Blog] Load likes error:', err)
  }
}

async function handleLike(slug: string, event: Event) {
  event.stopPropagation()

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
      // Update local state
      likeCounts.value[slug] = result.count
      if (result.liked) {
        userLiked.value.push(slug)
      } else {
        userLiked.value = userLiked.value.filter((s) => s !== slug)
      }

      trackAnalyticsEvent('blog_post_like', {
        action: result.liked ? 'like' : 'unlike',
        slug,
        page_path:
          typeof window !== 'undefined'
            ? window.location.pathname
            : BLOG_CANONICAL_PATH,
        locale: String(locale.value || 'en'),
      })
    }
  } catch (err) {
    console.error('[Blog] Like error:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to update like',
      icon: 'error',
    })
  }
}

function isLiked(slug: string): boolean {
  return userLiked.value.includes(slug)
}

function getLikeCount(slug: string): number {
  return likeCounts.value[slug] || 0
}

function go(slug: string) {
  router.push(`/blog/${slug}`)
}

function editPost(slug: string) {
  router.push(`/blog-editor?slug=${encodeURIComponent(slug)}`)
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString()
  } catch {
    return date
  }
}

function applyBlogListSeo() {
  const title = `${String(t('pages.blog.title') || 'Blog')} | PEACE2074`
  const description = String(
    t('pages.blog.subtitle') ||
      'Read updates, product notes, and reflections from the PEACE2074 blog.'
  )

  applySeoMeta({
    title,
    description,
    canonical: BLOG_CANONICAL_PATH,
    keywords: BLOG_KEYWORDS,
    locale: String(locale.value || 'en'),
    structuredData: [
      buildPageStructuredData({
        type: 'CollectionPage',
        title: String(t('pages.blog.title') || 'Blog'),
        description,
        canonical: BLOG_CANONICAL_PATH,
        locale: String(locale.value || 'en'),
        keywords: BLOG_KEYWORDS,
      }),
      buildBreadcrumbStructuredData([
        {
          name: String(t('appShell.nav.home') || 'Home'),
          item: SEO_BASE_URL,
        },
        {
          name: String(t('pages.blog.title') || 'Blog'),
          item: `${SEO_BASE_URL}${BLOG_CANONICAL_PATH}`,
        },
      ]),
    ],
  })
}

onMounted(async () => {
  await loadPosts()
  await loadLikes()
})

watch(
  [posts, locale],
  () => {
    applyBlogListSeo()
  },
  { immediate: true }
)
</script>

<style scoped>
.blog-page {
  max-width: 900px;
  margin: 0 auto;
}
.hero {
  text-align: center;
}
.subtitle {
  color: #475569;
  margin-top: 6px;
}
.actions-bar {
  display: flex;
  justify-content: flex-end;
}

.auth-banner {
  width: 100%;
}
</style>

<template>
  <q-page padding class="blog-page">
    <section class="hero">
      <h1>{{ t('pages.blog.title') }}</h1>
      <p class="subtitle">{{ t('pages.blog.subtitle') }}</p>
    </section>

    <div class="q-gutter-md q-mt-lg">
      <q-card v-for="post in postsSorted" :key="post.slug" clickable v-ripple @click="go(post.slug)">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6">{{ post.title }}</div>
              <div class="text-caption text-grey-6 q-mt-xs">{{ formatDate(post.date) }}</div>
            </div>
            <div class="row q-gutter-xs">
              <q-badge v-for="tag in post.tags" :key="tag" color="primary" outline>{{ tag }}</q-badge>
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import posts from '@/shared/data/blog/posts.json'

const { t } = useI18n()
const router = useRouter()

const postsSorted = computed(() => {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

function go(slug: string) {
  router.push(`/blog/${slug}`)
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString()
  } catch {
    return date
  }
}
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
</style>

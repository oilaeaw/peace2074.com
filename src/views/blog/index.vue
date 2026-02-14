<template>
  <q-page padding class="blog-page">
    <section class="hero">
      <h1>{{ t("pages.blog.title") }}</h1>
      <p class="subtitle">{{ t("pages.blog.subtitle") }}</p>
    </section>

    <div class="actions-bar q-mt-md q-mb-md" v-if="isAuthenticated">
      <q-btn
        color="primary"
        icon="add"
        :label="t('pages.blog.newPost')"
        @click="$router.push('/blog-editor')"
      />
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
            <div>
              <div class="text-h6">{{ post.title }}</div>
              <div class="text-caption text-grey-6 q-mt-xs">
                {{ formatDate(post.date) }}
              </div>
            </div>
            <div class="column q-gutter-xs">
              <div class="row q-gutter-xs">
                <q-badge v-for="tag in post.tags" :key="tag" color="primary" outline>{{
                  tag
                }}</q-badge>
              </div>
              <q-btn
                v-if="isAuthenticated"
                dense
                flat
                size="sm"
                icon="edit"
                color="primary"
                :label="t('general.edit')"
                @click.stop="editPost(post.slug)"
              />
            </div>
          </div>
          <div class="text-body2 q-mt-sm">{{ post.excerpt }}</div>
        </q-card-section>
      </q-card>
      <q-banner v-if="!postsSorted.length" class="q-mt-md" rounded>
        {{ t("pages.blog.empty") }}
      </q-banner>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.pinia";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const posts = ref<any[]>([]);
const loading = ref(true);

const postsSorted = computed(() => {
  return [...posts.value].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
});

async function loadPosts() {
  loading.value = true;
  try {
    const res = await fetch('/api/blog', {
      credentials: 'include',
    });
    const data = await res.json();
    if (data.ok && data.posts) {
      posts.value = data.posts;
    }
  } catch (err) {
    console.error('[Blog] Load error:', err);
  } finally {
    loading.value = false;
  }
}

function go(slug: string) {
  router.push(`/blog/${slug}`);
}

function editPost(slug: string) {
  router.push(`/blog-editor?slug=${encodeURIComponent(slug)}`);
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return date;
  }
}

onMounted(() => {
  loadPosts();
});
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
</style>

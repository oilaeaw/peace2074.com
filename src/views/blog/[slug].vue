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
      <q-separator />
      <div class="text-body1 prewrap">{{ post.content }}</div>
      
      <q-btn
        v-if="isAuthenticated"
        flat
        color="primary"
        icon="edit"
        :label="t('general.edit')"
        @click="editPost"
        class="q-mt-md"
      />
    </div>

    <q-banner v-else rounded class="q-mt-lg" color="warning" text-color="black">
      {{ t("pages.blog.notFound") }}
    </q-banner>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.pinia";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const post = ref<any>(null);
const loading = ref(true);

async function loadPost(slug: string) {
  loading.value = true;
  try {
    const res = await fetch(`/api/blog?slug=${encodeURIComponent(slug)}`, {
      credentials: 'include',
    });
    const data = await res.json();
    if (data.ok && data.post) {
      post.value = data.post;
    } else {
      post.value = null;
    }
  } catch (err) {
    console.error('[Blog Detail] Load error:', err);
    post.value = null;
  } finally {
    loading.value = false;
  }
}

function editPost() {
  const slug = String(route.params.slug || "");
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
  const slug = String(route.params.slug || "");
  if (slug) {
    loadPost(slug);
  }
});

watch(() => route.params.slug, (newSlug) => {
  if (newSlug) {
    loadPost(String(newSlug));
  }
});
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

<template>
  <q-page padding class="blog-editor-page">
    <q-breadcrumbs class="q-mb-md">
      <q-breadcrumbs-el :label="t('appShell.nav.home')" icon="home" to="/" />
      <q-breadcrumbs-el :label="t('pages.blog.title')" to="/blog" />
      <q-breadcrumbs-el :label="isEditMode ? t('pages.blog.editor.editPost') : t('pages.blog.editor.newPost')" />
    </q-breadcrumbs>

    <div v-if="!isAuthenticated" class="auth-required q-pa-md">
      <q-banner rounded class="bg-warning text-black">
        <template v-slot:avatar>
          <q-icon name="lock" />
        </template>
        {{ t('pages.blog.editor.authRequired') }}
      </q-banner>
      <q-btn
        class="q-mt-md"
        color="primary"
        :label="t('auth.login')"
        to="/login"
        icon="login"
      />
    </div>

    <q-form v-else @submit="handleSubmit" class="q-gutter-md">
      <q-input
        v-model="form.title"
        :label="t('pages.blog.editor.title')"
        filled
        :rules="[val => !!val || t('pages.blog.editor.titleRequired')]"
        counter
        maxlength="200"
      />

      <q-input
        v-model="form.slug"
        :label="t('pages.blog.editor.slug')"
        filled
        :hint="t('pages.blog.editor.slugHint')"
        :rules="[val => !!val || t('pages.blog.editor.slugRequired')]"
        :disable="isEditMode"
      />

      <q-input
        v-model="form.excerpt"
        :label="t('pages.blog.editor.excerpt')"
        filled
        type="textarea"
        rows="2"
        counter
        maxlength="300"
      />

      <q-input
        v-model="form.content"
        :label="t('pages.blog.editor.content')"
        filled
        type="textarea"
        rows="12"
        :rules="[val => !!val || t('pages.blog.editor.contentRequired')]"
      />

      <q-input
        v-model="tagsInput"
        :label="t('pages.blog.editor.tags')"
        filled
        :hint="t('pages.blog.editor.tagsHint')"
        @blur="updateTags"
      />

      <div v-if="form.tags.length" class="q-gutter-xs">
        <q-chip
          v-for="(tag, idx) in form.tags"
          :key="idx"
          removable
          @remove="form.tags.splice(idx, 1)"
          color="primary"
          text-color="white"
        >
          {{ tag }}
        </q-chip>
      </div>

      <div class="button-row q-gutter-sm">
        <q-btn
          type="submit"
          color="primary"
          :label="isEditMode ? t('pages.blog.editor.update') : t('pages.blog.editor.publish')"
          :loading="submitting"
          icon="send"
        />
        <q-btn
          flat
          :label="t('general.cancel')"
          @click="$router.push('/blog')"
          :disable="submitting"
        />
        <q-btn
          v-if="isEditMode"
          flat
          color="negative"
          :label="t('pages.blog.editor.delete')"
          icon="delete"
          @click="handleDelete"
          :loading="deleting"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.pinia'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isEditMode = computed(() => !!route.query.slug)

const form = ref({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  tags: [] as string[],
})

const tagsInput = ref('')
const submitting = ref(false)
const deleting = ref(false)

function updateTags() {
  if (!tagsInput.value.trim()) return
  const tags = tagsInput.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t && !form.value.tags.includes(t))
  form.value.tags.push(...tags)
  tagsInput.value = ''
}

async function loadPost(slug: string) {
  try {
    const res = await fetch(`/api/blog?slug=${encodeURIComponent(slug)}`, {
      credentials: 'include',
    })
    const data = await res.json()
    if (data.ok && data.post) {
      form.value = {
        title: data.post.title || '',
        slug: data.post.slug || '',
        excerpt: data.post.excerpt || '',
        content: data.post.content || '',
        tags: data.post.tags || [],
      }
    } else {
      $q.notify({ type: 'negative', message: t('pages.blog.editor.postNotFound') })
      router.push('/blog')
    }
  } catch (err) {
    console.error('[Blog Editor] Load error:', err)
    $q.notify({ type: 'negative', message: t('pages.blog.editor.loadError') })
  }
}

async function handleSubmit() {
  if (!form.value.title || !form.value.slug || !form.value.content) {
    $q.notify({ type: 'warning', message: t('pages.blog.editor.fillRequired') })
    return
  }

  submitting.value = true
  try {
    const method = isEditMode.value ? 'PUT' : 'POST'
    const res = await fetch('/api/blog', {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form.value),
    })

    const data = await res.json()
    if (data.ok) {
      $q.notify({
        type: 'positive',
        message: isEditMode.value
          ? t('pages.blog.editor.updateSuccess')
          : t('pages.blog.editor.publishSuccess'),
      })
      router.push('/blog')
    } else {
      $q.notify({ type: 'negative', message: data.error || t('pages.blog.editor.saveError') })
    }
  } catch (err) {
    console.error('[Blog Editor] Submit error:', err)
    $q.notify({ type: 'negative', message: t('pages.blog.editor.saveError') })
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  const confirmed = await new Promise((resolve) => {
    $q.dialog({
      title: t('pages.blog.editor.confirmDelete'),
      message: t('pages.blog.editor.confirmDeleteMessage'),
      cancel: true,
      persistent: true,
    }).onOk(() => resolve(true)).onCancel(() => resolve(false))
  })

  if (!confirmed) return

  deleting.value = true
  try {
    const res = await fetch(`/api/blog?slug=${encodeURIComponent(form.value.slug)}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    const data = await res.json()
    if (data.ok) {
      $q.notify({ type: 'positive', message: t('pages.blog.editor.deleteSuccess') })
      router.push('/blog')
    } else {
      $q.notify({ type: 'negative', message: data.error || t('pages.blog.editor.deleteError') })
    }
  } catch (err) {
    console.error('[Blog Editor] Delete error:', err)
    $q.notify({ type: 'negative', message: t('pages.blog.editor.deleteError') })
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  if (isEditMode.value && route.query.slug) {
    loadPost(String(route.query.slug))
  }
})
</script>

<style scoped>
.blog-editor-page {
  max-width: 900px;
  margin: 0 auto;
}

.auth-required {
  text-align: center;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

@media (max-width: 600px) {
  .button-row {
    flex-direction: column;
    align-items: stretch;
  }
  .button-row > * {
    width: 100%;
  }
}
</style>

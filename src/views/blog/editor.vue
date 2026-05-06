<template>
  <q-page padding class="blog-editor-page">
    <q-breadcrumbs class="q-mb-md">
      <q-breadcrumbs-el :label="t('appShell.nav.home')" icon="home" to="/" />
      <q-breadcrumbs-el :label="t('pages.blog.title')" to="/blog" />
      <q-breadcrumbs-el
        :label="
          isEditMode
            ? t('pages.blog.editor.editPost')
            : t('pages.blog.editor.newPost')
        "
      />
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
        :rules="[(val) => !!val || t('pages.blog.editor.titleRequired')]"
        counter
        maxlength="200"
      />

      <q-input
        v-model="form.slug"
        :label="t('pages.blog.editor.slug')"
        filled
        :hint="t('pages.blog.editor.slugHint')"
        :rules="[(val) => !!val || t('pages.blog.editor.slugRequired')]"
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

      <div class="blog-content-field">
        <div class="row items-center justify-between q-mb-xs">
          <span class="text-caption text-grey-7"
            >{{ t('pages.blog.editor.content') }} *</span
          >
          <q-btn
            flat
            dense
            size="sm"
            icon="auto_awesome"
            color="secondary"
            :label="t('pages.blog.editor.aiDraft')"
            :loading="aiDrafting"
            :disable="!form.title.trim()"
            @click="generateDraft"
          >
            <q-tooltip>{{ t('pages.blog.editor.aiDraftTip') }}</q-tooltip>
          </q-btn>
        </div>
        <q-editor
          v-model="form.content"
          min-height="20rem"
          :toolbar="[
            ['bold', 'italic', 'underline', 'strike'],
            [
              {
                label: $q.lang.editor.formatting,
                icon: $q.iconSet.editor.formatting,
                list: 'no-icons',
                options: ['h1', 'h2', 'h3', 'h4', 'p', 'code'],
              },
            ],
            ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
            ['link', 'hr'],
            ['left', 'center', 'right', 'justify'],
            ['undo', 'redo', 'removeFormat'],
            ['fullscreen'],
          ]"
        />
      </div>

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
          :label="
            isEditMode
              ? t('pages.blog.editor.update')
              : t('pages.blog.editor.publish')
          "
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
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.pinia'
import { resolveNitroUrl } from '@/stores/services'

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
const aiDrafting = ref(false)

// Auto-generate slug from title when creating a new post
watch(
  () => form.value.title,
  (title) => {
    if (isEditMode.value) return
    form.value.slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80)
  }
)

async function generateDraft() {
  const topic = form.value.title.trim()
  if (!topic) return

  aiDrafting.value = true
  try {
    const res = await fetch(resolveNitroUrl('/kimi'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: `Write a well-structured blog article for the PEACE2074 Quran app about: "${topic}". Use HTML formatting with <h2>, <p>, and <ul> tags. Keep it informative and respectful. Around 300-400 words.`,
          },
        ],
      }),
    })
    const data = await res.json()
    const text: string = data?.message?.content || data?.raw || ''
    if (text) {
      form.value.content = text
      $q.notify({
        type: 'positive',
        message: t('pages.blog.editor.aiDraftDone'),
        icon: 'auto_awesome',
      })
    } else {
      $q.notify({
        type: 'warning',
        message: t('pages.blog.editor.aiDraftFailed'),
      })
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.blog.editor.aiDraftFailed'),
    })
  } finally {
    aiDrafting.value = false
  }
}

function updateTags() {
  if (!tagsInput.value.trim()) return
  const tags = tagsInput.value
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t && !form.value.tags.includes(t))
  form.value.tags.push(...tags)
  tagsInput.value = ''
}

async function loadPost(slug: string) {
  try {
    const res = await fetch(
      `${resolveNitroUrl('/blog')}?slug=${encodeURIComponent(slug)}`,
      {
        credentials: 'include',
      }
    )
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
      $q.notify({
        type: 'negative',
        message: t('pages.blog.editor.postNotFound'),
      })
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
    const res = await fetch(resolveNitroUrl('/blog'), {
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
      $q.notify({
        type: 'negative',
        message: data.error || t('pages.blog.editor.saveError'),
      })
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
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
  })

  if (!confirmed) return

  deleting.value = true
  try {
    const res = await fetch(
      `${resolveNitroUrl('/blog')}?slug=${encodeURIComponent(form.value.slug)}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    )

    const data = await res.json()
    if (data.ok) {
      $q.notify({
        type: 'positive',
        message: t('pages.blog.editor.deleteSuccess'),
      })
      router.push('/blog')
    } else {
      $q.notify({
        type: 'negative',
        message: data.error || t('pages.blog.editor.deleteError'),
      })
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

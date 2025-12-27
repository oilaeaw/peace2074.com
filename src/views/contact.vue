<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const projects = reactive([
  { key: 'peace2074', value: 'Peace2074', selected: true },
  { key: 'quran', value: 'Quran' },
  { key: 'tasbeeh', value: 'Tasbeeh' },
])

const form = reactive({
  name: '',
  email: '',
  project: 'peace2074',
  message: '',
  accept: false,
})

const loading = ref(false)
const submitted = ref(false)

const isReady = computed(() =>
  Boolean(form.name && form.email && form.project && form.message && form.accept)
)

function reset() {
  form.name = ''
  form.email = ''
  form.project = 'peace2074'
  form.message = ''
  form.accept = false
  submitted.value = false
}

async function submit() {
  if (!isReady.value) return
  loading.value = true
  // Placeholder submit: in production wire to backend or email service
  setTimeout(() => {
    submitted.value = true
    loading.value = false
  }, 400)
}
</script>

<template>
  <q-page padding class="contact-page">
    <section class="hero">
      <h1>{{ t('button.Contact') }}</h1>
      <p class="subtitle">{{ t('contact.offer_help') }}</p>
    </section>

    <div class="layout q-gutter-lg q-mt-lg">
      <q-card class="form-card">
        <q-card-section>
          <div class="text-h6">{{ t('contact.help') }}</div>
          <div class="text-body2 text-grey-7 q-mt-xs">{{ t('contact.accept_terms') }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-md">
          <q-input v-model="form.name" outlined :label="t('contact.name.label')" :placeholder="t('contact.name.placeholder')" />
          <q-input v-model="form.email" outlined type="email" :label="t('contact.email.label')" :placeholder="t('contact.email.placeholder')" />
          <q-select
            v-model="form.project"
            outlined
            :options="projects"
            option-value="key"
            option-label="value"
            emit-value
            map-options
            :label="t('contact.projects.label')"
            :placeholder="t('contact.projects.placeholder')"
          />
          <q-input
            v-model="form.message"
            outlined
            type="textarea"
            autogrow
            :label="t('contact.message.label')"
            :placeholder="t('contact.message.placeholder')"
          />
          <div class="row items-center justify-between">
            <q-toggle v-model="form.accept" color="primary" :label="t('contact.terms_accepted')" />
            <RouterLink to="/terms" class="text-primary">{{ t('contact.accept_terms') }}</RouterLink>
          </div>
          <div class="row q-gutter-sm">
            <q-btn color="primary" unelevated :label="t('button.submit')" :disable="!isReady || loading" :loading="loading" @click="submit" />
            <q-btn flat color="primary" :label="t('button.reset')" @click="reset" />
          </div>
          <q-banner v-if="submitted" rounded dense class="q-mt-sm" color="positive" text-color="white">
            {{ t('general.fetchingUpdates') || 'Message recorded. We will reply soon.' }}
          </q-banner>
        </q-card-section>
      </q-card>

      <q-card class="info-card">
        <q-card-section>
          <div class="text-h6">{{ t('contact.contactTitle', 'Contact info') }}</div>
          <div class="text-body2 text-grey-7 q-mt-xs">Reach us directly:</div>
          <div class="q-mt-sm q-gutter-xs column">
            <a class="link" href="mailto:hello@peace2074.com">hello@peace2074.com</a>
            <a class="link" href="https://peace2074.com" target="_blank" rel="noopener">peace2074.com</a>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="text-subtitle2">Social</div>
          <div class="q-gutter-xs column q-mt-xs">
            <a class="link" href="https://x.com/peace2074" target="_blank" rel="noopener">X / Twitter</a>
            <a class="link" href="https://github.com/waelio" target="_blank" rel="noopener">GitHub</a>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.contact-page {
  max-width: 1100px;
  margin: 0 auto;
}
.hero {
  text-align: center;
}
.subtitle {
  color: #475569;
  margin-top: 6px;
}
.layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
}
.form-card, .info-card {
  border: 1px solid #e2e8f0;
}
.link {
  color: #2563eb;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <q-page padding class="admin-page">
    <section class="header q-mb-md">
      <h1 class="text-h4 q-mb-xs">Admin Panel</h1>
      <p class="text-subtitle2 text-grey-7 q-mb-none">
        Version monitor for releases. Toggle to show only even patch versions.
      </p>
    </section>

    <q-card flat bordered>
      <q-card-section class="row items-center q-col-gutter-md">
        <div class="col-12 col-md-auto">
          <q-badge color="primary" outline>
            Current app version: {{ appVersion }}
          </q-badge>
        </div>
        <div class="col-12 col-md-auto">
          <q-toggle
            v-model="evenOnly"
            color="primary"
            label="Show only even patch versions"
          />
        </div>
        <div class="col-12 col-md-auto">
          <q-btn
            color="primary"
            outline
            icon="refresh"
            label="Refresh"
            :loading="loading"
            @click="loadReleases"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-banner v-if="error" rounded dense class="bg-red-1 text-negative q-mb-md">
          {{ error }}
        </q-banner>

        <q-list bordered separator>
          <q-item v-for="release in filteredReleases" :key="release.tagName">
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ release.tagName }}
                <q-badge
                  v-if="isEvenPatch(release.tagName)"
                  color="positive"
                  class="q-ml-sm"
                  label="even"
                />
              </q-item-label>
              <q-item-label caption>
                {{ release.name || "No title" }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ formatDate(release.publishedAt) }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="!loading && !filteredReleases.length">
            <q-item-section>
              <q-item-label>No versions found for current filter.</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="loading">
            <q-item-section avatar>
              <q-spinner color="primary" size="20px" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Loading releases…</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

declare const __APP_VERSION__: string

const appVersion = __APP_VERSION__ || '0.0.0'
const evenOnly = ref(true)
const loading = ref(false)
const error = ref('')

interface Release {
  tagName: string
  name: string
  publishedAt: string
}

const releases = ref<Release[]>([])

function normalizeTag(tag: string): string {
  return (tag || '').trim().replace(/^v/i, '')
}

function parsePatch(tag: string): number | null {
  const normalized = normalizeTag(tag)
  const match = normalized.match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!match) return null
  return Number(match[3])
}

function isEvenPatch(tag: string): boolean {
  const patch = parsePatch(tag)
  return patch !== null && patch % 2 === 0
}

const filteredReleases = computed(() => {
  if (!evenOnly.value) return releases.value
  return releases.value.filter((r) => isEvenPatch(r.tagName))
})

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Unknown date'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return 'Unknown date'
  return d.toLocaleDateString()
}

async function loadReleases() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch('https://api.github.com/repos/peace2074/peace2074.com/releases?per_page=100')
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data = await response.json()
    releases.value = (Array.isArray(data) ? data : [])
      .map((item: any) => ({
        tagName: String(item.tag_name || '').trim(),
        name: String(item.name || '').trim(),
        publishedAt: String(item.published_at || '').trim(),
      }))
      .filter((r) => !!r.tagName)
  } catch (e: any) {
    error.value = e?.message || 'Failed to load versions from GitHub releases.'
    releases.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReleases()
})
</script>

<style scoped>
.admin-page {
  max-width: 980px;
  margin: 0 auto;
}

.header h1 {
  letter-spacing: 0.01em;
}
</style>

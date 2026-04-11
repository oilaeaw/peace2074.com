<template>
  <Teleport to="body">
    <div class="offline-recitation-manager-teleport">
      <q-btn
        unelevated
        rounded
        color="primary"
        icon="arrow_back"
        :label="backButtonLabel"
        :aria-label="backButtonLabel"
        @click="closeManager"
      />
    </div>
  </Teleport>

  <q-card class="offline-recitation-manager">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">
        <q-icon name="download" class="q-mr-sm" />
        {{ t('offline.title') }}
      </div>
      <div class="text-caption">
        {{ t('offline.subtitle') }}
      </div>
    </q-card-section>

    <q-card-section>
      <!-- Quality Selection -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">
          {{ t('offline.selectQuality') }}
        </div>
        <q-option-group
          v-model="selectedQuality"
          :options="qualityOptions"
          color="primary"
          @update:model-value="onQualityChange"
        />
      </div>

      <q-separator class="q-my-md" />

      <!-- Storage Info -->
      <div class="storage-info q-mb-md">
        <div class="row items-center justify-between q-mb-sm">
          <span class="text-subtitle2">{{ t('offline.storageUsed') }}</span>
          <span class="text-weight-bold">{{ formatBytes(cacheSize) }}</span>
        </div>
        <div class="row items-center justify-between q-mb-sm">
          <span class="text-body2">{{ t('offline.surasDownloaded') }}</span>
          <span>{{ totalDownloadedSuras }} / 114</span>
        </div>
        <q-linear-progress
          :value="downloadPercentage"
          color="positive"
          class="q-mt-sm"
        />
      </div>

      <q-separator class="q-my-md" />

      <!-- Download Options -->
      <div class="download-options">
        <div class="text-subtitle2 q-mb-md">
          {{ t('offline.downloadOptions') }}
        </div>

        <q-btn
          v-if="!isDownloading && totalDownloadedSuras < 114"
          outline
          color="primary"
          icon="download"
          :label="t('offline.downloadAllQuran')"
          class="full-width q-mb-sm"
          @click="confirmDownloadAll"
        />

        <q-btn
          v-if="!isDownloading && props.currentSuraId"
          outline
          color="primary"
          icon="download"
          :label="t('offline.downloadCurrentSura')"
          class="full-width q-mb-sm"
          @click="downloadCurrentSura"
        />

        <q-btn
          v-if="totalDownloadedSuras > 0"
          outline
          color="negative"
          icon="delete"
          :label="t('offline.clearAllCache')"
          class="full-width"
          @click="confirmClearCache"
        />
      </div>

      <!-- Active Downloads -->
      <div v-if="activeDownloads.length > 0" class="q-mt-md">
        <div class="text-subtitle2 q-mb-sm">
          {{ t('offline.downloading') }}
        </div>
        <q-list bordered separator>
          <q-item v-for="progress in activeDownloads" :key="progress.suraId">
            <q-item-section>
              <q-item-label>
                {{ t('offline.sura') }} {{ progress.suraId }}
              </q-item-label>
              <q-item-label caption>
                {{ progress.current }} / {{ progress.total }}
                {{ t('offline.verses') }}
              </q-item-label>
              <q-linear-progress
                :value="progress.current / progress.total"
                color="primary"
                class="q-mt-xs"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import {
  useOfflineRecitation,
  type RecitationQuality,
} from '@/composables/useOfflineRecitation'
import { useQ2P } from '@/stores/q2p.pinia'

export interface Props {
  currentSuraId?: number
  currentSuraTotalVerses?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  qualityChanged: [quality: RecitationQuality]
  downloadComplete: [suraId: number]
  close: []
}>()

const { t } = useI18n()
const $q = useQuasar()
const q2pStore = useQ2P()

const {
  selectedQuality,
  downloadProgress,
  isDownloading,
  downloadedSuras,
  qualityInfo,
  totalDownloadedSuras,
  QUALITY_INFO,
  downloadSura,
  clearAllCache,
  getCacheSize,
  loadCachedSurasList,
} = useOfflineRecitation()

const cacheSize = ref(0)

const qualityOptions = computed(() => [
  {
    label: `${t('offline.regular')} (${QUALITY_INFO.regular.bitrate})`,
    value: 'regular',
    description: QUALITY_INFO.regular.description,
  },
  {
    label: `${t('offline.highQuality')} (${QUALITY_INFO.hiq.bitrate})`,
    value: 'hiq',
    description: QUALITY_INFO.hiq.description,
  },
])

const activeDownloads = computed(() => {
  return Array.from(downloadProgress.value.values()).filter(
    (p) => p.status === 'downloading'
  )
})

const backButtonLabel = computed(() => {
  const translated = t('common.close')
  return translated && translated !== 'common.close'
    ? translated
    : 'Back to Quran'
})

const downloadPercentage = computed(() => {
  return totalDownloadedSuras.value / 114
})

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

async function updateCacheSize() {
  cacheSize.value = await getCacheSize()
}

function onQualityChange(newQuality: RecitationQuality) {
  emit('qualityChanged', newQuality)
}

function closeManager() {
  emit('close')
}

async function downloadCurrentSura() {
  if (!props.currentSuraId || !props.currentSuraTotalVerses) {
    $q.notify({
      type: 'warning',
      message: t('offline.noSuraSelected'),
      position: 'top',
    })
    return
  }

  $q.notify({
    type: 'info',
    message: t('offline.downloadingStarted'),
    icon: 'downloading',
    position: 'top',
  })

  const success = await downloadSura(
    props.currentSuraId,
    props.currentSuraTotalVerses
  )

  if (success) {
    $q.notify({
      type: 'positive',
      message: t('offline.downloadComplete'),
      icon: 'check_circle',
      position: 'top',
    })
    emit('downloadComplete', props.currentSuraId)
    await updateCacheSize()
  } else {
    $q.notify({
      type: 'negative',
      message: t('offline.downloadFailed'),
      icon: 'error',
      position: 'top',
    })
  }
}

function confirmDownloadAll() {
  $q.dialog({
    title: t('offline.confirmDownloadAll.title'),
    message: t('offline.confirmDownloadAll.message', {
      size: qualityInfo.value.estimatedSizeFullQuran,
      quality: qualityInfo.value.bitrate,
    }),
    persistent: false,
    ok: {
      label: t('general.download'),
      color: 'primary',
    },
    cancel: {
      label: t('general.cancel'),
      flat: true,
    },
  }).onOk(async () => {
    await downloadAllQuran()
  })
}

async function downloadAllQuran() {
  isDownloading.value = true

  // Get all 114 suras with their verse counts
  await q2pStore.init()
  const allSuras = q2pStore.Book

  let completed = 0
  let failed = 0

  for (const sura of allSuras) {
    if (downloadedSuras.value.has(sura.id)) {
      continue // Skip already downloaded
    }

    const success = await downloadSura(sura.id, sura.total_verses)
    if (success) {
      completed++
    } else {
      failed++
    }

    // Update UI between downloads
    await updateCacheSize()
  }

  isDownloading.value = false

  $q.notify({
    type: completed > 0 ? 'positive' : 'warning',
    message: t('offline.downloadAllComplete', { completed, failed }),
    icon: 'check_circle',
    position: 'top',
    timeout: 5000,
  })
}

function confirmClearCache() {
  $q.dialog({
    title: t('offline.confirmClear.title'),
    message: t('offline.confirmClear.message'),
    persistent: false,
    ok: {
      label: t('general.delete'),
      color: 'negative',
    },
    cancel: {
      label: t('general.cancel'),
      flat: true,
    },
  }).onOk(async () => {
    const success = await clearAllCache()
    if (success) {
      cacheSize.value = 0
      $q.notify({
        type: 'positive',
        message: t('offline.cacheCleared'),
        icon: 'check_circle',
        position: 'top',
      })
    }
  })
}

onMounted(async () => {
  await loadCachedSurasList()
  await updateCacheSize()
})

watch(
  downloadedSuras,
  async () => {
    await updateCacheSize()
  },
  { deep: true }
)
</script>

<script lang="ts">
export default {
  name: 'OfflineRecitationManager',
}
</script>

<style scoped lang="scss">
.offline-recitation-manager-teleport {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 16px);
  left: 16px;
  z-index: 7000;
}

.offline-recitation-manager {
  max-width: 600px;
  margin: 0 auto;
}

.storage-info {
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.download-options {
  .q-btn {
    text-transform: none;
  }
}
</style>

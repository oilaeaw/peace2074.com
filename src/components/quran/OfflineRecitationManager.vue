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
      <q-banner
        v-if="managerNotice"
        data-testid="offline-download-notification"
        rounded
        dense
        class="q-mb-md"
        :class="`bg-${managerNotice.type} text-white`"
      >
        <template #avatar>
          <q-icon :name="managerNotice.icon" color="white" />
        </template>
        <div class="text-weight-bold">{{ managerNotice.title }}</div>
        <div class="text-caption">{{ managerNotice.message }}</div>
      </q-banner>

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

        <q-banner
          rounded
          dense
          class="q-mt-md offline-readiness-banner"
          :class="
            offlineStatus?.currentSuraAvailable
              ? 'bg-positive text-white'
              : 'bg-warning text-dark'
          "
        >
          <template #avatar>
            <q-icon :name="offlineAvailabilityIcon" color="white" />
          </template>
          <div class="text-weight-bold">{{ offlineAvailabilityTitle }}</div>
          <div class="text-caption">{{ offlineAvailabilityMessage }}</div>
        </q-banner>
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
              <q-item-label caption>
                {{ getDownloadPercentage(progress) }}%
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
  type RecitationDownloadProgress,
  type OfflineRecitationStatus,
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
  downloadStatus: [
    status: {
      scope: 'current' | 'all'
      status: 'started' | 'completed' | 'failed'
      percent: number
      completed?: number
      total?: number
    },
  ]
  offlineStateChanged: []
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
  getOfflineRecitationStatus,
  loadCachedSurasList,
  loadCachedSurasListForQuality,
  setSelectedQualityPreference,
} = useOfflineRecitation()

const cacheSize = ref(0)
const offlineStatus = ref<OfflineRecitationStatus | null>(null)
const managerNotice = ref<{
  type: 'positive' | 'warning' | 'negative' | 'info'
  title: string
  message: string
  icon: string
} | null>(null)

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

const offlineAvailabilityIcon = computed(() => {
  return offlineStatus.value?.currentSuraAvailable ? 'offline_pin' : 'cloud_off'
})

const offlineAvailabilityTitle = computed(() => {
  if (offlineStatus.value?.fullQuranAvailable) {
    return t('offline.fullLibraryReady')
  }

  if (offlineStatus.value?.currentSuraAvailable) {
    return t('offline.currentSuraReady')
  }

  return t('offline.internetRequired')
})

const offlineAvailabilityMessage = computed(() => {
  if (offlineStatus.value?.fullQuranAvailable) {
    return t('offline.fullLibraryReadyHint')
  }

  if (offlineStatus.value?.currentSuraAvailable) {
    return t('offline.currentSuraReadyHint')
  }

  return t('offline.internetRequiredHint')
})

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function getDownloadPercentage(progress: RecitationDownloadProgress) {
  if (!progress.total) return 0
  return Math.round((progress.current / progress.total) * 100)
}

function setManagerNotice(
  type: 'positive' | 'warning' | 'negative' | 'info',
  title: string,
  message: string,
  icon: string
) {
  managerNotice.value = {
    type,
    title,
    message,
    icon,
  }
}

async function updateCacheSize() {
  cacheSize.value = await getCacheSize()
}

async function refreshOfflineStatus() {
  offlineStatus.value = await getOfflineRecitationStatus(
    props.currentSuraId,
    selectedQuality.value
  )
}

async function onQualityChange(newQuality: RecitationQuality) {
  setSelectedQualityPreference(newQuality)
  await loadCachedSurasListForQuality(newQuality)
  await updateCacheSize()
  await refreshOfflineStatus()
  emit('qualityChanged', newQuality)
  emit('offlineStateChanged')
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
  setManagerNotice(
    'info',
    t('offline.downloading'),
    t('offline.downloadingStarted'),
    'downloading'
  )
  emit('downloadStatus', {
    scope: 'current',
    status: 'started',
    percent: 0,
  })

  const success = await downloadSura(
    props.currentSuraId,
    props.currentSuraTotalVerses
  )

  if (success) {
    await loadCachedSurasList()
    await refreshOfflineStatus()
    $q.notify({
      type: 'positive',
      message: t('offline.downloadComplete'),
      icon: 'check_circle',
      position: 'top',
    })
    setManagerNotice(
      'positive',
      t('offline.downloadComplete'),
      `${t('offline.downloadComplete')} (100%)`,
      'check_circle'
    )
    emit('downloadStatus', {
      scope: 'current',
      status: 'completed',
      percent: 100,
      completed: 1,
      total: 1,
    })
    emit('downloadComplete', props.currentSuraId)
    emit('offlineStateChanged')
    await updateCacheSize()
  } else {
    $q.notify({
      type: 'negative',
      message: t('offline.downloadFailed'),
      icon: 'error',
      position: 'top',
    })
    setManagerNotice(
      'negative',
      t('offline.downloadFailed'),
      t('offline.downloadFailed'),
      'error'
    )
    emit('downloadStatus', {
      scope: 'current',
      status: 'failed',
      percent: 0,
      completed: 0,
      total: 1,
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
  managerNotice.value = null

  // Get all 114 suras with their verse counts
  await q2pStore.init()
  const allSuras = q2pStore.Book
  const surasToDownload = allSuras.filter(
    (sura) => !downloadedSuras.value.has(sura.id)
  )
  const totalTargets = surasToDownload.length

  if (totalTargets > 0) {
    emit('downloadStatus', {
      scope: 'all',
      status: 'started',
      percent: 0,
      completed: 0,
      total: totalTargets,
    })
    setManagerNotice(
      'info',
      t('offline.downloading'),
      `${t('offline.surasDownloaded')}: 0 / ${totalTargets} (0%)`,
      'downloading'
    )
  }

  let completed = 0
  let failed = 0
  let processed = 0

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
    processed++

    const percent = totalTargets
      ? Math.round((processed / totalTargets) * 100)
      : 100
    setManagerNotice(
      success ? 'info' : 'warning',
      t('offline.downloading'),
      `${t('offline.surasDownloaded')}: ${processed} / ${totalTargets} (${percent}%)`,
      success ? 'downloading' : 'warning'
    )

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

  const finalPercent = totalTargets
    ? Math.round((completed / totalTargets) * 100)
    : 100
  setManagerNotice(
    completed > 0 ? 'positive' : 'warning',
    t('offline.downloadAllComplete', { completed, failed }),
    `${t('offline.surasDownloaded')}: ${completed} / ${totalTargets} (${finalPercent}%)`,
    completed > 0 ? 'check_circle' : 'warning'
  )
  emit('downloadStatus', {
    scope: 'all',
    status: completed > 0 ? 'completed' : 'failed',
    percent: finalPercent,
    completed,
    total: totalTargets,
  })

  await loadCachedSurasList()
  await refreshOfflineStatus()
  emit('offlineStateChanged')
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
      await loadCachedSurasList()
      await updateCacheSize()
      await refreshOfflineStatus()
      $q.notify({
        type: 'positive',
        message: t('offline.cacheCleared'),
        icon: 'check_circle',
        position: 'top',
      })
      emit('offlineStateChanged')
    }
  })
}

onMounted(async () => {
  await loadCachedSurasList()
  await updateCacheSize()
  await refreshOfflineStatus()
})

watch(
  downloadedSuras,
  async () => {
    await updateCacheSize()
    await refreshOfflineStatus()
  },
  { deep: true }
)

watch(
  downloadProgress,
  () => {
    if (!props.currentSuraId) return
    const progress = downloadProgress.value.get(props.currentSuraId)
    if (!progress || progress.status !== 'downloading') return

    emit('downloadStatus', {
      scope: 'current',
      status: 'started',
      percent: getDownloadPercentage(progress),
      completed: progress.current,
      total: progress.total,
    })
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

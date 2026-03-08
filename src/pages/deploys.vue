<template>
  <q-page class="deploys-page q-pa-md">
    <div class="page-container">
      <div class="page-header q-mb-lg">
        <h1 class="text-h3 q-mb-sm">{{ t('pages.deploys.title') }}</h1>
        <p class="text-subtitle1 text-grey-7">{{ t('pages.deploys.subtitle') }}</p>
      </div>

      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner color="primary" size="3em" />
      </div>

      <q-timeline v-else color="secondary" class="deploy-timeline">
        <q-timeline-entry
          v-for="deploy in deploys"
          :key="deploy.version"
          :title="deploy.version"
          :subtitle="deploy.date"
          :icon="deploy.icon || 'rocket_launch'"
          :color="deploy.color || 'secondary'"
        >
          <div class="deploy-entry">
            <div class="deploy-header q-mb-sm row items-center justify-between">
              <div class="deploy-message">
                {{ deploy.message }}
              </div>
              <q-btn
                :icon="isLiked(deploy.version) ? 'favorite' : 'favorite_border'"
                :color="isLiked(deploy.version) ? 'red' : 'grey-7'"
                flat
                round
                dense
                :loading="likingInProgress[deploy.version]"
                @click.stop="toggleLike(deploy.version)"
              >
                <q-tooltip>
                  {{ isLiked(deploy.version) ? (t('pages.deploys.unlike') || 'Unlike') : (t('pages.deploys.like') || 'Like') }}
                </q-tooltip>
                <q-badge
                  v-if="getLikeCount(deploy.version) > 0"
                  :label="getLikeCount(deploy.version)"
                  color="red"
                  floating
                />
              </q-btn>
            </div>
            
            <div v-if="deploy.features && deploy.features.length > 0" class="deploy-features q-mb-sm">
              <div class="text-weight-medium text-positive q-mb-xs">
                <q-icon name="fiber_new" size="sm" class="q-mr-xs" />
                {{ t('pages.deploys.features') }}
              </div>
              <ul class="feature-list">
                <li v-for="(feature, idx) in deploy.features" :key="idx">
                  {{ feature }}
                </li>
              </ul>
            </div>

            <div v-if="deploy.fixes && deploy.fixes.length > 0" class="deploy-fixes q-mb-sm">
              <div class="text-weight-medium text-info q-mb-xs">
                <q-icon name="bug_report" size="sm" class="q-mr-xs" />
                {{ t('pages.deploys.fixes') }}
              </div>
              <ul class="feature-list">
                <li v-for="(fix, idx) in deploy.fixes" :key="idx">
                  {{ fix }}
                </li>
              </ul>
            </div>

            <div v-if="deploy.chores && deploy.chores.length > 0" class="deploy-chores">
              <div class="text-weight-medium text-grey-7 q-mb-xs">
                <q-icon name="build" size="sm" class="q-mr-xs" />
                {{ t('pages.deploys.chores') }}
              </div>
              <ul class="feature-list">
                <li v-for="(chore, idx) in deploy.chores" :key="idx">
                  {{ chore }}
                </li>
              </ul>
            </div>
          </div>
        </q-timeline-entry>
      </q-timeline>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { sendDeployLike, fetchDeployLikes, fetchChangelog } from '@/stores/services'

const { t } = useI18n()
const $q = useQuasar()

interface Deploy {
  version: string
  date: string
  message: string
  icon?: string
  color?: string
  features?: string[]
  fixes?: string[]
  chores?: string[]
}

const deploys = ref<Deploy[]>([])
const loading = ref(true)
const likeCounts = ref<Record<string, number>>({})
const userLiked = ref<string[]>([])
const likingInProgress = ref<Record<string, boolean>>({})

onMounted(async () => {
  await Promise.all([loadChangelog(), loadLikes()])
  loading.value = false
})

async function loadChangelog() {
  try {
    const response = await fetchChangelog()
    if (response.ok && Array.isArray(response.deploys)) {
      deploys.value = response.deploys
    }
  } catch (error) {
    console.error('Failed to load changelog:', error)
    $q.notify({
      type: 'warning',
      message: 'Failed to load deployment history',
      timeout: 2500
    })
  }
}

async function loadLikes() {
  try {
    const response = await fetchDeployLikes()
    if (response.ok) {
      likeCounts.value = response.likeCounts || {}
      userLiked.value = response.userLiked || []
    }
  } catch (error) {
    console.error('Failed to load likes:', error)
  }
}

function isLiked(version: string): boolean {
  return userLiked.value.includes(version)
}

function getLikeCount(version: string): number {
  return likeCounts.value[version] || 0
}

async function toggleLike(version: string) {
  if (likingInProgress.value[version]) return

  likingInProgress.value[version] = true

  try {
    const response = await sendDeployLike(version)
    
    if (response.authRequired) {
      $q.notify({
        type: 'warning',
        message: t('auth.loginRequired') || 'Please login to like deployments',
        position: 'top',
        timeout: 2500,
        actions: [
          {
            label: t('appShell.nav.login') || 'Login',
            color: 'white',
            handler: () => {
              window.location.href = '/login'
            }
          }
        ]
      })
      return
    }

    if (response.ok) {
      // Update local state
      if (response.liked) {
        userLiked.value.push(version)
      } else {
        userLiked.value = userLiked.value.filter(v => v !== version)
      }
      likeCounts.value[version] = response.count || 0

      $q.notify({
        type: 'positive',
        message: response.liked 
          ? (t('pages.deploys.liked') || '❤️ Liked!')
          : (t('pages.deploys.unliked') || 'Unliked'),
        position: 'top',
        timeout: 1500,
      })
    } else {
      throw new Error(response.error || 'Failed to toggle like')
    }
  } catch (error: any) {
    console.error('Failed to toggle like:', error)
    $q.notify({
      type: 'negative',
      message: error?.message || 'Failed to toggle like',
      position: 'top',
      timeout: 2500,
    })
  } finally {
    likingInProgress.value[version] = false
  }
}
</script>

<style scoped lang="scss">
.deploys-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  padding: 2rem 0;

  h1 {
    color: var(--q-primary);
    font-weight: 600;
  }
}

.deploy-timeline {
  :deep(.q-timeline__entry) {
    padding-bottom: 2rem;
  }

  :deep(.q-timeline__subtitle) {
    font-size: 0.875rem;
    color: var(--q-secondary);
    font-weight: 500;
  }
}

.deploy-entry {
  .deploy-message {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--q-dark);
  }

  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding: 0.25rem 0 0.25rem 1.5rem;
      position: relative;
      line-height: 1.5;
      font-size: 0.9rem;

      &:before {
        content: '•';
        position: absolute;
        left: 0.5rem;
        color: var(--q-secondary);
        font-weight: bold;
      }
    }
  }
}

body.body--dark {
  .deploy-entry {
    .deploy-message {
      color: var(--q-dark-page);
    }
  }
}
</style>

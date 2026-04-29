<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { Capacitor } from '@capacitor/core'

const CONSENT_KEY = 'consent-banner-v1'
const show = ref(false)
const { t } = useI18n()
const route = useRoute()

onMounted(() => {
  try {
    if (Capacitor.isNativePlatform() || route.query.native === '1') {
      show.value = false
      return
    }

    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(CONSENT_KEY)
      if (saved === 'accepted') {
        window.allConsentGranted?.()
        show.value = false
        return
      }

      if (saved === null) {
        show.value = true
      }
    }
  } catch {
    show.value = true
  }
})

function accept() {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CONSENT_KEY, 'accepted')
      // Grant Google Analytics consent
      if (window.allConsentGranted) {
        window.allConsentGranted()
      }
    }
  } catch {}
  show.value = false
}

function decline() {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CONSENT_KEY, 'declined')
    }
  } catch {}
  show.value = false
}
</script>

<template>
  <transition name="fade">
    <div v-if="show" class="consent-banner">
      <q-banner dense class="consent-card" inline-actions>
        <div>
          <div class="text-body1">{{ t('consent.message') }}</div>
          <div class="text-caption text-grey-7">
            {{ t('consent.details') }}
          </div>
        </div>
        <template #action>
          <q-btn
            flat
            color="primary"
            :label="t('consent.accept')"
            @click="accept"
          />
          <q-btn
            flat
            color="grey-7"
            :label="t('consent.decline')"
            @click="decline"
          />
        </template>
      </q-banner>
    </div>
  </transition>
</template>

<style scoped>
.consent-banner {
  position: fixed;
  bottom: calc(36px + env(safe-area-inset-bottom, 0px));
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 2000;
  pointer-events: none;
  padding: 0 max(16px, env(safe-area-inset-left, 0px)) 0
    max(16px, env(safe-area-inset-right, 0px));
}

.consent-card {
  width: min(960px, 90vw);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  background: rgba(255, 255, 255, 0.95);
  pointer-events: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>

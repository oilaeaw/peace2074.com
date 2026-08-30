<template>
  <div class="un-flags-wrapper q-my-xl">
    <div class="un-flags-header text-center q-mb-md">
      <div class="un-badge">
        <q-icon name="public" size="20px" class="q-mr-xs" />
        <span>Multilingual Unity · 10 Languages</span>
      </div>
      <h2 class="un-title">United Nations Flag Circle</h2>
      <p class="un-subtitle">
        Click any flag to read the Holy Quran & Peace2074 in your native language
      </p>
    </div>

    <!-- Circular Interactive Flag Display -->
    <div class="flag-ring-container">
      <!-- Center Emblem -->
      <div class="ring-center-emblem">
        <q-icon name="language" size="48px" class="globe-icon" />
        <div class="center-text">
          <div class="current-lang-name">{{ currentLocaleObj?.name || 'English' }}</div>
          <div class="current-lang-code">{{ (locale || 'en').toUpperCase() }}</div>
        </div>
      </div>

      <!-- Orbital Ring of Flags -->
      <div class="orbital-ring" :class="{ 'paused': isHovered }" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
        <div
          v-for="(item, index) in flagList"
          :key="item.code"
          class="flag-node"
          :style="getFlagNodeStyle(index, flagList.length)"
          :class="{ 'active-flag': locale === item.code }"
          @click="selectLanguage(item.code)"
        >
          <div class="flag-pill">
            <span class="flag-emoji">{{ item.flag }}</span>
            <span class="flag-label">{{ item.name }}</span>
          </div>
          <q-tooltip class="bg-primary text-white text-subtitle2" anchor="top middle" self="bottom middle">
            Switch to {{ item.name }} ({{ item.nativeName }})
          </q-tooltip>
        </div>
      </div>
    </div>

    <!-- Quick Horizontal Switcher for Mobile/Small Screens -->
    <div class="mobile-flag-bar row justify-center items-center gap-xs q-mt-lg">
      <q-btn
        v-for="item in flagList"
        :key="'mobile-' + item.code"
        flat
        round
        dense
        :class="{ 'mobile-active': locale === item.code }"
        @click="selectLanguage(item.code)"
      >
        <span class="mobile-flag-emoji">{{ item.flag }}</span>
        <q-tooltip>{{ item.name }}</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useMyLangsStore } from '@/stores/langs.pinia'
import { persistLocale } from '@/utils/locale-routing'

const { locale } = useI18n()
const $q = useQuasar()
const langsStore = useMyLangsStore()
const isHovered = ref(false)

type FlagItem = {
  code: string
  name: string
  nativeName: string
  flag: string
}

const flagList: FlagItem[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha', flag: '🇺🇿' },
]

const currentLocaleObj = computed(() => {
  return flagList.find((f) => f.code === locale.value)
})

function getFlagNodeStyle(index: number, total: number) {
  const angle = (index / total) * 360
  const radius = 170 // px distance from center
  const rad = (angle * Math.PI) / 180
  const x = Math.round(Math.cos(rad) * radius)
  const y = Math.round(Math.sin(rad) * radius)

  return {
    transform: `translate(${x}px, ${y}px)`,
  }
}

function selectLanguage(code: string) {
  if (locale.value === code) return
  locale.value = code
  langsStore.setLocale(code)
  persistLocale(code as any)

  const selected = flagList.find((f) => f.code === code)
  $q.notify({
    message: `${selected?.flag || '🌐'} Switched language to ${selected?.name} (${selected?.nativeName})`,
    color: 'primary',
    icon: 'language',
    position: 'top',
    timeout: 2200,
  })
}
</script>

<style scoped lang="scss">
.un-flags-wrapper {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  padding: 2rem 1rem;
}

.un-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(84, 104, 167, 0.12);
  color: #5468a7;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.88rem;
  font-weight: 600;
  border: 1px solid rgba(84, 104, 167, 0.25);
  margin-bottom: 0.5rem;
}

.un-title {
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.un-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.flag-ring-container {
  position: relative;
  width: 440px;
  height: 440px;
  margin: 2.5rem auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-center-emblem {
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 0 0 8px rgba(84, 104, 167, 0.15);
  z-index: 2;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.globe-icon {
  color: #fbbf24;
  animation: spinSlow 30s linear infinite;
}

@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.center-text {
  text-align: center;
  margin-top: 4px;
}

.current-lang-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #f8fafc;
}

.current-lang-code {
  font-size: 0.75rem;
  color: #fbbf24;
  letter-spacing: 1px;
  font-weight: 700;
}

/* Orbital Ring */
.orbital-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: rotateRing 45s linear infinite;

  &.paused {
    animation-play-state: paused;
  }
}

@keyframes rotateRing {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.flag-node {
  position: absolute;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 3;
}

.flag-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  padding: 6px 14px;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
  /* Counter-rotate text so flags remain upright while ring rotates */
  animation: counterRotateRing 45s linear infinite;
}

.orbital-ring.paused .flag-pill {
  animation-play-state: paused;
}

@keyframes counterRotateRing {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

.flag-emoji {
  font-size: 1.4rem;
  line-height: 1;
}

.flag-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
}

.flag-node:hover .flag-pill {
  transform: scale(1.15);
  border-color: #38bdf8;
  box-shadow: 0 8px 24px rgba(56, 189, 248, 0.3);
  background: #f8fafc;
}

.active-flag .flag-pill {
  border-color: #fbbf24;
  background: #fffbeb;
  box-shadow: 0 0 16px rgba(251, 191, 36, 0.4);
}

.active-flag .flag-label {
  color: #b45309;
  font-weight: 700;
}

.mobile-flag-bar {
  display: none;
}

@media (max-width: 600px) {
  .flag-ring-container {
    width: 320px;
    height: 320px;
  }
  .ring-center-emblem {
    width: 110px;
    height: 110px;
  }
  .mobile-flag-bar {
    display: flex;
  }
}

/* Dark mode styles */
.body--dark {
  .un-title {
    color: #f8fafc;
  }
  .un-subtitle {
    color: #94a3b8;
  }
  .un-badge {
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
    border-color: rgba(56, 189, 248, 0.3);
  }
  .flag-pill {
    background: #1e293b;
    border-color: #334155;
  }
  .flag-label {
    color: #e2e8f0;
  }
  .flag-node:hover .flag-pill {
    background: #0f172a;
    border-color: #38bdf8;
  }
  .active-flag .flag-pill {
    background: #2e1065;
    border-color: #fbbf24;
  }
  .active-flag .flag-label {
    color: #fbbf24;
  }
}
</style>

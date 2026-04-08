<template>
  <div v-if="!hidden" class="support-ai-widget">
    <div v-if="!open" class="ai-fab-row">
      <q-btn
        class="ai-fab ai-fab--visible"
        color="primary"
        text-color="white"
        icon="smart_toy"
        :label="t('pages.support.aiTitle', 'Ask support AI')"
        unelevated
        @click="open = true"
      />
      <q-btn
        class="ai-hide-btn"
        flat
        round
        dense
        icon="close"
        color="grey-7"
        @click.stop="hideForSession"
        :aria-label="t('general.close', 'Hide AI widget')"
      >
        <q-tooltip class="text-caption">{{
          t('general.close', 'Hide AI widget')
        }}</q-tooltip>
      </q-btn>
    </div>

    <transition name="fade">
      <q-card v-if="open" class="ai-card glassy" bordered>
        <q-card-section
          class="row items-start justify-between q-col-gutter-sm ai-card__header"
        >
          <div class="col">
            <div class="text-h6">
              {{ t('pages.support.aiTitle', 'Ask support AI') }}
            </div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              {{
                t(
                  'pages.support.aiSubtitle',
                  'Describe your issue and DeepSeek will suggest next steps.'
                )
              }}
            </div>
          </div>
          <div class="row items-center q-gutter-xs">
            <q-btn
              flat
              round
              dense
              icon="refresh"
              @click="reset"
              :aria-label="t('general.reload', 'Reset')"
            >
              <q-tooltip class="text-caption">{{
                t('general.reload', 'Reset conversation')
              }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="visibility_off"
              color="grey-7"
              @click="hideForSession"
              :aria-label="t('general.close', 'Hide AI widget')"
            >
              <q-tooltip class="text-caption">{{
                t('general.close', 'Hide AI widget')
              }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="close"
              color="grey-7"
              @click="close"
              :aria-label="t('general.close', 'Hide AI panel')"
            >
              <q-tooltip class="text-caption">{{
                t('general.close', 'Hide panel')
              }}</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-md">
          <div class="text-caption text-grey-7">
            {{
              t(
                'pages.support.aiHintInline',
                'Use the header icons to hide. A reopen button sits bottom-right.'
              )
            }}
          </div>
          <q-input
            v-model="prompt"
            type="textarea"
            autogrow
            outlined
            :label="
              t(
                'pages.support.aiPlaceholder',
                'Describe the problem or question'
              )
            "
            :disable="loading"
          />
          <div class="row items-center justify-between">
            <q-btn
              color="primary"
              unelevated
              :label="t('pages.support.aiAsk', 'Ask')"
              @click="ask"
              :loading="loading"
            />
            <q-btn
              flat
              color="primary"
              icon="content_copy"
              :disable="!answer"
              @click="copy"
              :aria-label="t('general.copy', 'Copy')"
            />
          </div>
          <q-banner
            v-if="error"
            rounded
            dense
            color="negative"
            text-color="white"
          >
            {{ error }}
          </q-banner>
          <q-banner v-if="answer" rounded dense class="ai-answer">
            <div class="text-body1 ai-response-text">{{ answer }}</div>
          </q-banner>
        </q-card-section>
      </q-card>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@vueuse/core'
import { sendDeepSeekChat } from '@/stores/services'

const { t } = useI18n()
const HIDE_STORAGE_KEY = 'support-ai-hidden'
const prompt = ref('')
const answer = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const open = ref(false)
const hidden = ref(false)

const { copy: copyToClipboard } = useClipboard({ source: answer })

if (typeof window !== 'undefined') {
  hidden.value = window.sessionStorage.getItem(HIDE_STORAGE_KEY) === '1'
}

async function ask() {
  const content = prompt.value.trim()
  if (!content) return
  loading.value = true
  error.value = null
  try {
    const res = await sendDeepSeekChat({
      messages: [{ role: 'user', content }],
    })

    // Check if response contains an error field (API error with 200 OK)
    if (res?.error) {
      const errorMsg =
        res.error.message ||
        res.error.data ||
        (typeof res.error === 'string' ? res.error : 'API error')
      throw new Error(errorMsg)
    }

    // Extract text from various possible response structures
    let text =
      res?.message?.content ||
      res?.choices?.[0]?.message?.content ||
      res?.raw?.[0]?.message?.content ||
      (typeof res?.message === 'string' ? res.message : '')

    // Ensure text is always a string
    if (!text) {
      text = typeof res === 'string' ? res : JSON.stringify(res, null, 2)
    } else if (typeof text !== 'string') {
      text = JSON.stringify(text, null, 2)
    }

    answer.value = text
  } catch (e: any) {
    error.value = e?.message || String(e) || 'Request failed'
  } finally {
    loading.value = false
  }
}

function copy() {
  copyToClipboard()
}

function reset() {
  prompt.value = ''
  answer.value = ''
  error.value = null
}

function close() {
  open.value = false
}

function hideForSession() {
  hidden.value = true
  open.value = false
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(HIDE_STORAGE_KEY, '1')
  }
}
</script>

<style scoped>
.support-ai-widget {
  position: fixed;
  right: 32px;
  bottom: calc(64px + env(safe-area-inset-bottom));
  z-index: 1400;
}
.ai-fab-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ai-fab {
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}
.ai-fab--visible {
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.ai-hide-btn {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.85);
}
.ai-card {
  position: fixed;
  right: 16px;
  bottom: 16px;
  width: min(420px, 92vw);
  max-height: calc(100vh - 120px);
  overflow: auto;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.3);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
}
.glassy {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px) saturate(1.05);
}
.ai-card__header {
  background: linear-gradient(
    135deg,
    rgba(74, 144, 226, 0.12),
    rgba(56, 189, 248, 0.18)
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.32);
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
}
.ai-answer {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.ai-response-text {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
@media (max-width: 640px) {
  .support-ai-widget {
    right: 28px;
    bottom: calc(120px + env(safe-area-inset-bottom));
  }
  .ai-card {
    right: 12px;
    bottom: 12px;
    width: 94vw;
    max-height: calc(100vh - 100px);
    border-radius: 12px;
  }
  .ai-card__header {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }
}
</style>

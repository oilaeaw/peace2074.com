<template>
  <q-page padding class="support-page">
    <section class="hero">
      <h1>{{ t("pages.support.title") }}</h1>
      <p class="subtitle">{{ t("pages.support.subtitle") }}</p>
      <div class="hero-actions q-mt-md">
        <q-btn
          color="primary"
          unelevated
          :label="t('pages.support.ctaChat')"
          to="/chat"
        />
        <q-btn
          flat
          color="primary"
          :label="t('pages.support.ctaContact')"
          to="/contact"
          class="q-ml-sm"
        />
      </div>
    </section>

    <div class="q-gutter-md q-mt-lg">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t("pages.support.helpTitle") }}</div>
          <div class="text-body2 q-mt-xs">{{ t("pages.support.helpBody") }}</div>
        </q-card-section>
      </q-card>

      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t("pages.support.contactTitle") }}</div>
          <div class="text-body2 q-mt-xs">{{ t("pages.support.contactBody") }}</div>
        </q-card-section>
      </q-card>

      <q-card class="deepseek-card">
        <q-card-section class="row items-center justify-between q-col-gutter-sm">
          <div>
            <div class="text-h6">{{ t("pages.support.aiTitle", "Ask support AI") }}</div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              {{ t("pages.support.aiSubtitle", "Describe your issue and DeepSeek will suggest next steps.") }}
            </div>
          </div>
          <q-btn icon="refresh" flat round dense @click="reset" :aria-label="t('general.reload', 'Reset')" />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="prompt"
            type="textarea"
            autogrow
            outlined
            :label="t('pages.support.aiPlaceholder', 'Describe the problem or question')"
            :disable="loading"
          />
          <div class="row items-center justify-between">
            <q-btn color="primary" unelevated :label="t('pages.support.aiAsk', 'Ask')" @click="ask" :loading="loading" />
            <q-btn flat color="primary" icon="content_copy" :disable="!answer" @click="copy" :aria-label="t('general.copy', 'Copy')" />
          </div>
          <q-banner v-if="error" rounded dense color="negative" text-color="white">
            {{ error }}
          </q-banner>
          <q-banner v-if="answer" rounded dense class="ai-answer">
            <div class="text-body1">{{ answer }}</div>
          </q-banner>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useClipboard } from "@vueuse/core";
import { sendDeepSeekChat } from "@/stores/services";

const { t } = useI18n();
const prompt = ref("");
const answer = ref("");
const error = ref<string | null>(null);
const loading = ref(false);

const { copy: copyToClipboard } = useClipboard({ source: answer });

async function ask() {
  const content = prompt.value.trim();
  if (!content) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await sendDeepSeekChat({ messages: [{ role: "user", content }] });
    const text = res?.choices?.[0]?.message?.content || res?.message || JSON.stringify(res);
    answer.value = text;
  } catch (e: any) {
    error.value = e?.message || "Request failed";
  } finally {
    loading.value = false;
  }
}

function copy() {
  copyToClipboard();
}

function reset() {
  prompt.value = "";
  answer.value = "";
  error.value = null;
}
</script>

<style scoped>
.support-page {
  max-width: 900px;
  margin: 0 auto;
}
.hero {
  text-align: center;
}
.subtitle {
  color: #475569;
  margin-top: 6px;
}
.hero-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}
.deepseek-card {
  border: 1px solid #e2e8f0;
}
.ai-answer {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
@media (max-width: 640px) {
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  .hero-actions .q-btn {
    width: 100%;
  }
}
</style>

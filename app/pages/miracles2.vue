<script lang="ts" setup>
import { computed, ref, onMounted, watch } from "#imports";
import { useQ2P } from '~/store/q2p.pinia'

definePageMeta({
  title: "pages.miracles.pageTitle",
  description: "meta.miracles",
});

const q2p = useQ2P();
const quran: any = q2p.Book;
const { t } = useI18n();

// --- Pilot 1: Linguistic Metrics ---
const pilotSura = ref(1);
const pilotVerse = ref(1);

const arabicText = computed(() => {
  try {
    const sura = quran && quran[pilotSura.value - 1];
    if (!sura || !Array.isArray((sura as any).ayat)) return "";
    const ayah = (sura as any).ayat.find((a: any) => a.verse === pilotVerse.value);
    return ayah?.text || "";
  } catch (e) {
    return "";
  }
});

const translation = computed(() => {
  try {
    const sura = quran && quran[pilotSura.value - 1];
    if (!sura || !Array.isArray((sura as any).ayat)) return "";
    const ayah = (sura as any).ayat.find((a: any) => a.verse === pilotVerse.value);
    return ayah && (ayah.trans || ayah.translation || "");
  } catch (e) {
    return "";
  }
});

const metrics = ref({ chars: 0, words: 0, unique: 0 });

function computeMetrics(text: string) {
  if (!text) return { chars: 0, words: 0, unique: 0 };
  const chars = Array.from(text).length;
  const wordsArr = text.trim().split(/\s+/).filter(Boolean);
  const uniq = new Set(wordsArr).size;
  return { chars, words: wordsArr.length, unique: uniq };
}

function nextVerse() {
  pilotVerse.value = pilotVerse.value + 1;
}

// --- Lifecycle Hooks ---
onMounted(() => {
  metrics.value = computeMetrics(arabicText.value || "");
});

watch(arabicText, (val) => {
  metrics.value = computeMetrics(val || "");
});

// Websocket demo removed
</script>

<template>
  <ClientOnly>
    <Suspense>
      <q-page padding>
        <MiraclesSwitcher />
        <!-- Realtime demo removed for this deployment platform -->

        <!-- Pilot card 1: linguistic metrics for a single verse -->
        <q-card class="q-pa-md q-mx-auto q-mt-md" style="max-width: 820px">
          <q-card-section>
            <h3 class="text-h6">
              {{ t("pages.miracles.linguisticPilotTitle") || "Linguistic pilot" }}
            </h3>
            <div dir="rtl" lang="ar" class="q-mb-md">{{ arabicText }}</div>
            <div class="text-caption">{{ translation }}</div>
            <div class="row q-mt-md">
              <div class="col">
                <div>{{ t('pages.miracles.metrics.chars') }}: {{ metrics.chars }}</div>
                <div>{{ t('pages.miracles.metrics.words') }}: {{ metrics.words }}</div>
                <div>{{ t('pages.miracles.metrics.unique') }}: {{ metrics.unique }}</div>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn flat :label="t('pages.miracles.changeVerse')" @click="nextVerse" />
          </q-card-actions>
        </q-card>

        <!-- Numeric miracles: provided examples section -->
        <q-card class="q-pa-md q-mx-auto q-mt-md" style="max-width: 820px">
          <q-card-section>
            <h3 class="text-h6">
              {{
                t("pages.miracles.numericExamplesTitle") ||
                "Examples of numerical miracles in the Qur’an"
              }}
            </h3>
            <div class="q-mt-sm">
              <ul class="q-pl-lg">
                <li class="q-mb-sm">
                  <strong>{{ t('pages.miracles.numericExamples.oppositesTitle') }}</strong>
                  {{ t('pages.miracles.numericExamples.oppositesBody') }}
                </li>
                <li class="q-mb-sm">
                  <strong>{{ t('pages.miracles.numericExamples.structureTitle') }}</strong>
                  {{ t('pages.miracles.numericExamples.structureBody') }}
                </li>
                <li class="q-mb-sm">
                  <strong>{{ t('pages.miracles.numericExamples.conceptsTitle') }}</strong>
                  {{ t('pages.miracles.numericExamples.conceptsBody') }}
                </li>
                <li class="q-mb-sm">
                  <strong>{{ t('pages.miracles.numericExamples.lettersTitle') }}</strong>
                  {{ t('pages.miracles.numericExamples.lettersBody') }}
                </li>
              </ul>
            </div>
          </q-card-section>
        </q-card>
      </q-page>
    </Suspense>
  </ClientOnly>
</template>
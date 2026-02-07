<script lang="ts" setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import useQ2P from '@/composables/useQ2P'
import MiraclesSwitcher from '@/components/common/MiraclesSwitcher.vue'
// definePageMeta removed — title handled in main.ts

const q2p = useQ2P();
const quran: any = q2p.GetQ;
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
                <div>Chars: {{ metrics.chars }}</div>
                <div>Words: {{ metrics.words }}</div>
                <div>Unique: {{ metrics.unique }}</div>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn flat label="Change verse" @click="nextVerse" />
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
                  <strong>Repetition of opposite words:</strong>
                  The numbers of some opposite words are equal, such as “the world” and
                  “the hereafter” (115 times each), “angels” and “devils” (88 times each),
                  and “light” and “darkness” (24 times each).
                </li>
                <li class="q-mb-sm">
                  <strong>
                    Relationships between the numbers of words, letters, verses, and
                    surahs:
                  </strong>
                  The focus is on numbers, such as the number of chapters in the Qur’an
                  being 114.
                </li>
                <li class="q-mb-sm">
                  <strong>Relationships between words and concepts:</strong>
                  Relating the number of times certain words are repeated to other
                  numbers, such as the word “month” being repeated 12 times (the number of
                  months in a year).
                </li>
                <li class="q-mb-sm">
                  <strong>Number of letters in the verses:</strong>
                  It is worth noting that the number of letters in some verses corresponds
                  to a specific number, such as the number of letters from the beginning
                  of a particular verse to its end being the same number mentioned in the
                  verse itself.
                </li>
              </ul>
            </div>
          </q-card-section>
        </q-card>
      </q-page>
    </Suspense>
</template>
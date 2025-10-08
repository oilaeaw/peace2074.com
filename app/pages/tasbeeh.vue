<script lang="ts" setup>
const { t } = useI18n();
const router = useRouter();
const $q = useQuasar();

// Reactive state
const currentCount = ref(0);
const targetCount = ref(33);
const selectedTasbeeh = ref(0);
const showSettings = ref(false);
const completedSets = ref(0);

// Settings
const settings = ref({
  vibration: true,
  sound: true,
  autoNext: false,
});

// Target count options
const targetOptions = [
  { label: "33", value: 33 },
  { label: "99", value: 99 },
  { label: "100", value: 100 },
  { label: "∞", value: 999999 },
];

// Tasbeeh phrases
const tasbeehList = [
  {
    arabic: "سُبْحَانَ اللّٰهِ",
    transliteration: "SubhanAllah",
    translation: "Glory be to Allah",
  },
  {
    arabic: "الْحَمْدُ لِلّٰهِ",
    transliteration: "Alhamdulillah",
    translation: "Praise be to Allah",
  },
  {
    arabic: "اللّٰهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is Greatest",
  },
  {
    arabic: "لَا إِلٰهَ إِلَّا اللّٰهُ",
    transliteration: "La ilaha illa Allah",
    translation: "There is no god but Allah",
  },
  {
    arabic: "أَسْتَغْفِرُ اللّٰهَ",
    transliteration: "Astaghfirullah",
    translation: "I seek forgiveness from Allah",
  },
  {
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ",
    transliteration: "La hawla wa la quwwata illa billah",
    translation: "There is no power except with Allah",
  },
];

// Computed properties
const currentTasbeeh = computed(() => tasbeehList[selectedTasbeeh.value]);
const progressPercentage = computed(() => (currentCount.value / targetCount.value) * 100);

// Today's statistics
const todayStats = ref({
  total: 0,
  sessions: 0,
  date: new Date().toDateString(),
});

// Functions
function incrementCount() {
  currentCount.value++;

  // Vibration feedback
  if (settings.value.vibration && navigator.vibrate) {
    navigator.vibrate(50);
  }

  // Sound feedback
  if (settings.value.sound) {
    // Could add audio feedback here
    $q.notify({
      message: "",
      timeout: 100,
      position: "center",
      color: "transparent",
    });
  }

  // Check if target reached
  if (currentCount.value >= targetCount.value && targetCount.value !== 999999) {
    onTargetReached();
  }

  // Update today's stats
  updateTodayStats();
}

function onTargetReached() {
  completedSets.value++;

  $q.notify({
    message: t("tasbeeh.completed") || "Set completed! ماشاء الله",
    type: "positive",
    position: "center",
    timeout: 2000,
    actions: [
      {
        label: t("tasbeeh.continue") || "Continue",
        color: "white",
        handler: () => resetCount(),
      },
    ],
  });

  // Auto next phrase
  if (settings.value.autoNext) {
    setTimeout(() => {
      nextTasbeeh();
      resetCount();
    }, 2000);
  }

  // If authenticated, send session to server
  sendStatsToServer({
    session: {
      phraseIndex: selectedTasbeeh.value,
      count: currentCount.value,
      target: targetCount.value,
    },
    date: new Date().toDateString(),
  });
}

function resetCount() {
  currentCount.value = 0;
}

function selectTasbeeh(index: number) {
  selectedTasbeeh.value = index;
  resetCount();
}

function nextTasbeeh() {
  selectedTasbeeh.value = (selectedTasbeeh.value + 1) % tasbeehList.length;
}

function updateTodayStats() {
  const today = new Date().toDateString();

  // Reset if new day
  if (todayStats.value.date !== today) {
    todayStats.value = {
      total: 0,
      sessions: 0,
      date: today,
    };
  }

  todayStats.value.total++;

  // Save to localStorage
  localStorage.setItem("tasbeeh_stats", JSON.stringify(todayStats.value));

  // Send incremental update to server if authenticated
  sendStatsToServer({
    date: todayStats.value.date,
    total: todayStats.value.total,
    sessions: todayStats.value.sessions,
  });
}

async function sendStatsToServer(payload: any) {
  try {
    await useFetch("/api/tasbeeh", {
      method: "POST",
      body: payload,
      credentials: "include",
    });
  } catch (e) {
    // ignore network errors — keep local copy
    console.warn("Failed to persist tasbeeh to server", e);
  }
}

// Lifecycle
onMounted(async () => {
  // Load saved stats from localStorage first
  const saved = localStorage.getItem("tasbeeh_stats");
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.date === new Date().toDateString()) {
      todayStats.value = parsed;
    }
  }

  // Load settings
  const savedSettings = localStorage.getItem("tasbeeh_settings");
  if (savedSettings) {
    settings.value = { ...settings.value, ...JSON.parse(savedSettings) };
  }

  // If authenticated, try to fetch server-side stored stats
  try {
    const { data, error } = await useFetch("/api/tasbeeh", { credentials: "include" });
    if (!error.value && data.value && data.value.data) {
      const remote = data.value.data;
      // Merge today's stats if present
      if (remote.daily && Array.isArray(remote.daily)) {
        const today = new Date().toDateString();
        const rec = remote.daily.find((d: any) => d.date === today);
        if (rec) {
          todayStats.value = {
            total: rec.total || 0,
            sessions: rec.sessions || 0,
            date: rec.date,
          };
        }
      }
    }
  } catch (e) {
    // ignore fetch errors and continue with local-only data
    console.warn("Failed to fetch remote tasbeeh data", e);
  }
});

// Watch settings changes
watch(
  settings,
  (newSettings) => {
    localStorage.setItem("tasbeeh_settings", JSON.stringify(newSettings));
  },
  { deep: true }
);

// Page meta
useHead({
  title: "Digital Tasbeeh - Peace2074",
  meta: [
    {
      name: "description",
      content: "Digital prayer beads for Islamic remembrance and dhikr",
    },
  ],
});
</script>

<template>
  <q-page padding class="tasbeeh-page islamic-design">
    <div class="tasbeeh-container">
      <!-- Header -->
      <div class="page-header">
        <q-btn
          flat
          icon="arrow_back"
          color="primary"
          class="back-btn"
          @click="router.push('/')"
        >
          {{ t("back") }}
        </q-btn>
        <h1 class="page-title">
          {{ t("tasbeeh.title") || "تسبيح" }}
        </h1>
        <p class="page-subtitle">
          {{ t("tasbeeh.subtitle") || "Digital Prayer Beads" }}
        </p>
      </div>

      <!-- Current Tasbeeh Display -->
      <div class="current-tasbeeh">
        <div class="tasbeeh-card">
          <div class="arabic-text">
            {{ currentTasbeeh.arabic }}
          </div>
          <div class="transliteration">
            {{ currentTasbeeh.transliteration }}
          </div>
          <div class="translation">
            {{ currentTasbeeh.translation }}
          </div>
        </div>
      </div>

      <!-- Counter Display -->
      <div class="counter-section">
        <div class="counter-display">
          <div class="count-number">
            {{ currentCount }}
          </div>
          <div class="count-label">/ {{ targetCount }}</div>
        </div>
        <div class="progress-ring">
          <q-circular-progress
            :value="progressPercentage"
            size="200px"
            :thickness="0.15"
            color="primary"
            track-color="grey-3"
            class="progress-circle"
          />
        </div>
      </div>

      <!-- Main Action Button -->
      <div class="action-section">
        <q-btn
          round
          size="xl"
          color="primary"
          class="tasbeeh-button"
          @click="incrementCount"
        >
          <q-icon name="touch_app" size="48px" />
        </q-btn>
        <p class="tap-instruction">
          {{ t("tasbeeh.tapToCount") || "Tap to Count" }}
        </p>
      </div>

      <!-- Controls -->
      <div class="controls-section">
        <div class="control-row">
          <q-btn
            flat
            icon="refresh"
            :label="t('tasbeeh.reset') || 'Reset'"
            @click="resetCount"
          />
          <q-btn
            flat
            icon="settings"
            :label="t('tasbeeh.settings') || 'Settings'"
            @click="showSettings = true"
          />
        </div>

        <!-- Target Count Selector -->
        <div class="target-selector">
          <q-btn-toggle
            v-model="targetCount"
            :options="targetOptions"
            color="primary"
            outline
            @update:model-value="resetCount"
          />
        </div>
      </div>

      <!-- Tasbeeh Selection -->
      <div class="tasbeeh-selection">
        <h3>{{ t("tasbeeh.selectPhrase") || "Select Phrase" }}</h3>
        <div class="tasbeeh-grid">
          <div
            v-for="(item, index) in tasbeehList"
            :key="index"
            class="tasbeeh-item"
            :class="{ active: selectedTasbeeh === index }"
            @click="selectTasbeeh(index)"
          >
            <div class="item-arabic">
              {{ item.arabic }}
            </div>
            <div class="item-transliteration">
              {{ item.transliteration }}
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="stats-section">
        <h3>{{ t("tasbeeh.todayStats") || "Today's Count" }}</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">
              {{ todayStats.total }}
            </div>
            <div class="stat-label">
              {{ t("tasbeeh.total") || "Total" }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-number">
              {{ todayStats.sessions }}
            </div>
            <div class="stat-label">
              {{ t("tasbeeh.sessions") || "Sessions" }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-number">
              {{ completedSets }}
            </div>
            <div class="stat-label">
              {{ t("tasbeeh.completed") || "Completed Sets" }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Dialog -->
    <q-dialog v-model="showSettings">
      <q-card class="settings-card">
        <q-card-section>
          <div class="text-h6">
            {{ t("tasbeeh.settings") || "Tasbeeh Settings" }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-toggle
            v-model="settings.vibration"
            :label="t('tasbeeh.vibration') || 'Vibration'"
            color="primary"
          />
          <q-toggle
            v-model="settings.sound"
            :label="t('tasbeeh.sound') || 'Sound'"
            color="primary"
          />
          <q-toggle
            v-model="settings.autoNext"
            :label="t('tasbeeh.autoNext') || 'Auto Next Phrase'"
            color="primary"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat :label="t('close') || 'Close'" color="primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped lang="scss">
.tasbeeh-page {
  background: var(--background-pattern);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  min-height: 100vh;
  color: var(--text-color);
}

.tasbeeh-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;

  .back-btn {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 2;
  }

  .page-title {
    font-family: "Scheherazade", "Amiri", serif;
    font-size: 2.5rem;
    color: var(--title-color);
    margin: 0;
  }

  .page-subtitle {
    color: var(--subtitle-color);
    margin: 0.5rem 0 0 0;
  }
}

.current-tasbeeh {
  margin-bottom: 2rem;

  .tasbeeh-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 3px solid #d6b76e;

    .arabic-text {
      font-family: "Noto Naskh Arabic", "Amiri", "Scheherazade", serif;
      font-size: 2.5rem;
      color: #155724;
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .transliteration {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c5530;
      margin-bottom: 0.5rem;
    }

    .translation {
      font-size: 1rem;
      color: #6c757d;
      font-style: italic;
    }
  }
}

.counter-section {
  position: relative;
  text-align: center;
  margin-bottom: 3rem;

  .counter-display {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;

    .count-number {
      font-size: 3rem;
      font-weight: bold;
      color: var(--title-color);
      line-height: 1;
    }

    .count-label {
      font-size: 1.2rem;
      color: var(--subtitle-color);
    }
  }

  .progress-ring {
    display: flex;
    justify-content: center;
  }
}

.action-section {
  text-align: center;
  margin-bottom: 3rem;

  .tasbeeh-button {
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, #155724, #28a745);
    box-shadow: 0 8px 24px rgba(21, 87, 36, 0.3);
    transition: all 0.2s ease;

    &:active {
      transform: scale(0.95);
      box-shadow: 0 4px 12px rgba(21, 87, 36, 0.5);
    }
  }

  .tap-instruction {
    margin-top: 1rem;
    color: var(--subtitle-color);
    font-size: 0.9rem;
  }
}

.controls-section {
  margin-bottom: 2rem;

  .control-row {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .target-selector {
    display: flex;
    justify-content: center;
  }
}

.tasbeeh-selection {
  margin-bottom: 2rem;

  h3 {
    text-align: center;
    color: var(--title-color);
    margin-bottom: 1rem;
  }

  .tasbeeh-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .tasbeeh-item {
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #d6b76e;
      transform: translateY(-2px);
    }

    &.active {
      border-color: #155724;
      background: #f8f9fa;
    }

    .item-arabic {
      font-family: "Noto Naskh Arabic", "Amiri", serif;
      font-size: 1.4rem;
      color: #155724;
      margin-bottom: 0.25rem;
    }

    .item-transliteration {
      font-size: 0.9rem;
      color: #6c757d;
    }
  }
}

.stats-section {
  h3 {
    text-align: center;
    color: var(--title-color);
    margin-bottom: 1rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-item {
    background: white;
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    border: 2px solid #e9ecef;

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #155724;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #6c757d;
      margin-top: 0.25rem;
    }
  }
}

.settings-card {
  min-width: 300px;
}

// Dark mode
@media (prefers-color-scheme: dark) {
  .tasbeeh-card,
  .tasbeeh-item,
  .stat-item {
    background: #333;
    color: #e0e0e0;
  }

  .tasbeeh-item.active {
    background: #444;
  }
}

// Mobile responsiveness
@media (max-width: 600px) {
  .tasbeeh-container {
    padding: 0.5rem;
  }

  .current-tasbeeh .tasbeeh-card {
    padding: 1.5rem;

    .arabic-text {
      font-size: 2rem;
    }
  }

  .action-section .tasbeeh-button {
    width: 100px;
    height: 100px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .stat-item {
    padding: 0.75rem 0.5rem;

    .stat-number {
      font-size: 1.5rem;
    }
  }
}
</style>

<template>
  <q-page class="miracles-page">
    <div class="miracles-shell">
      <section class="hero-panel">
        <div class="hero-icon">
          <q-icon name="calculate" size="28px" />
        </div>
        <h1 class="page-title text-h4">
          {{ t('pages.miracles.pageTitle') }}
        </h1>
        <p class="page-subtitle text-subtitle1">
          {{ t('pages.miracles.numericExamplesTitle') }}
        </p>
      </section>

      <section class="miracles-grid">
        <q-card
          v-for="section in miracleSections"
          :key="section.title"
          class="miracle-card"
          flat
          bordered
        >
          <q-card-section class="card-header">
            <q-icon :name="section.icon" size="24px" class="section-icon" />
            <div class="text-h6 card-title">{{ section.title }}</div>
          </q-card-section>

          <q-card-section class="card-body text-body1">
            {{ section.description }}
          </q-card-section>
        </q-card>
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const miracleSections = computed(() => [
  {
    icon: 'balance',
    title: t('pages.miracles.oppositeWords'),
    description: t('pages.miracles.oppositeWordsDesc'),
  },
  {
    icon: 'auto_graph',
    title: t('pages.miracles.wordRelations'),
    description: t('pages.miracles.wordRelationsDesc'),
  },
  {
    icon: 'hub',
    title: t('pages.miracles.conceptRelations'),
    description: t('pages.miracles.conceptRelationsDesc'),
  },
  {
    icon: 'functions',
    title: t('pages.miracles.letterCounts'),
    description: t('pages.miracles.letterCountsDesc'),
  },
])
</script>

<style scoped>
.miracles-page {
  min-height: 100vh;
  padding: 24px 16px 48px;
  color: var(--text-color);
  background:
    radial-gradient(circle at top, rgba(214, 183, 110, 0.18), transparent 34%),
    linear-gradient(
      180deg,
      rgba(250, 245, 232, 0.98) 0%,
      rgba(244, 236, 216, 0.96) 100%
    );
}

.miracles-shell {
  width: min(100%, 1080px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-panel {
  text-align: center;
  padding: 2rem 1.25rem;
  border-radius: 32px;
  background: linear-gradient(
    180deg,
    rgba(247, 235, 202, 0.98) 0%,
    rgba(241, 226, 186, 0.92) 100%
  );
  border: 1px solid rgba(180, 134, 32, 0.26);
  box-shadow: 0 22px 48px rgba(122, 86, 23, 0.12);
}

.hero-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(214, 183, 110, 0.16);
  color: #9a6b00;
}

.page-title {
  margin: 0 0 0.5rem;
  font-family: 'DM Serif Display', 'Georgia', serif;
  color: var(--title-color);
}

.page-subtitle {
  max-width: 720px;
  margin: 0 auto;
  color: var(--subtitle-color);
}

.miracles-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.miracle-card {
  height: 100%;
  border-radius: 24px;
  background: linear-gradient(
    180deg,
    rgba(250, 242, 221, 0.97) 0%,
    rgba(245, 233, 203, 0.94) 100%
  );
  border-color: rgba(180, 134, 32, 0.2);
  box-shadow: 0 14px 30px rgba(122, 86, 23, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.25rem;
}

.section-icon {
  color: #9a6b00;
  flex-shrink: 0;
}

.card-title {
  color: var(--title-color);
}

.card-body {
  color: var(--subtitle-color);
  line-height: 1.7;
}

:global(body.body--dark) .miracles-page {
  background: #000;
}

:global(body.body--dark) .miracles-page .hero-panel,
:global(body.body--dark) .miracles-page .miracle-card {
  background: #000;
  border-color: rgba(214, 183, 110, 0.3);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
}

:global(body.body--dark) .miracles-page .hero-icon {
  background: rgba(214, 183, 110, 0.16);
  color: #f0c96c;
}

:global(body.body--dark) .miracles-page .section-icon {
  color: #f0c96c;
}

@media (max-width: 900px) {
  .miracles-page {
    padding-inline: 12px;
  }

  .hero-panel {
    padding: 1.5rem 1rem;
    border-radius: 24px;
  }

  .miracles-grid {
    grid-template-columns: 1fr;
  }
}
</style>

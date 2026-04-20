<template>
  <q-page class="about-page">
    <div class="ambient ambient-a" aria-hidden="true" />
    <div class="ambient ambient-b" aria-hidden="true" />
    <div class="ambient ambient-c" aria-hidden="true" />

    <section class="shell hero-section">
      <div class="glass-panel hero-copy">
        <q-badge rounded color="primary" class="eyebrow-badge">
          {{ t('pages.about.hero.eyebrow') }}
        </q-badge>

        <h1 class="hero-title">{{ t('pages.about.hero.title') }}</h1>
        <p class="hero-lead">{{ t('pages.about.hero.lead') }}</p>

        <div class="hero-tags">
          <q-chip v-for="tag in heroTags" :key="tag" dense class="hero-chip">
            {{ tag }}
          </q-chip>
        </div>

        <div class="hero-actions">
          <q-btn
            color="primary"
            unelevated
            size="lg"
            to="/quran"
            :label="t('pages.about.hero.primaryCta')"
          />
          <q-btn
            outline
            color="primary"
            size="lg"
            to="/holynames"
            :label="t('pages.about.hero.secondaryCta')"
          />
        </div>
      </div>

      <div class="glass-panel spotlight-panel">
        <div class="section-kicker">{{ t('pages.about.spotlight.label') }}</div>
        <h2 class="spotlight-title">{{ t('pages.about.spotlight.title') }}</h2>
        <p class="spotlight-body">{{ t('pages.about.spotlight.body') }}</p>

        <div class="stats-grid">
          <article v-for="stat in stats" :key="stat.label" class="stat-card">
            <div class="stat-icon-wrap">
              <q-icon :name="stat.icon" size="24px" />
            </div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </article>
        </div>
      </div>
    </section>

    <section class="shell story-section">
      <q-card flat class="glass-panel story-card">
        <div class="section-kicker">{{ t('pages.about.story.eyebrow') }}</div>
        <h2 class="section-title">{{ t('pages.about.story.title') }}</h2>
        <p class="section-lead">{{ t('pages.about.story.body') }}</p>

        <q-separator class="story-separator" />

        <div class="story-note">
          <div class="story-icon">
            <q-icon name="favorite" size="24px" />
          </div>
          <div>
            <div class="story-note-title">
              {{ t('pages.about.story.cardTitle') }}
            </div>
            <div class="story-note-body">
              {{ t('pages.about.story.cardBody') }}
            </div>
          </div>
        </div>
      </q-card>

      <q-card flat class="glass-panel quote-card">
        <div class="section-kicker">{{ t('pages.about.verse.label') }}</div>
        <blockquote class="quote-text">
          “{{ t('pages.about.verse.quote') }}”
        </blockquote>
        <div class="quote-source">{{ t('pages.about.verse.source') }}</div>
      </q-card>
    </section>

    <section class="shell content-section">
      <div class="section-heading centered">
        <div class="section-kicker">{{ t('pages.about.pillars.eyebrow') }}</div>
        <h2 class="section-title">{{ t('pages.about.pillars.title') }}</h2>
        <p class="section-lead">{{ t('pages.about.pillars.lead') }}</p>
      </div>

      <div class="pillar-grid">
        <q-card
          v-for="pillar in pillars"
          :key="pillar.title"
          flat
          class="pillar-card"
        >
          <div class="pillar-icon-wrap">
            <q-icon :name="pillar.icon" size="28px" />
          </div>
          <h3 class="card-title">{{ pillar.title }}</h3>
          <p class="card-body">{{ pillar.body }}</p>
        </q-card>
      </div>
    </section>

    <section class="shell content-section">
      <div class="section-heading centered">
        <div class="section-kicker">{{ t('pages.about.journey.eyebrow') }}</div>
        <h2 class="section-title">{{ t('pages.about.journey.title') }}</h2>
        <p class="section-lead">{{ t('pages.about.journey.lead') }}</p>
      </div>

      <div class="journey-grid">
        <q-card
          v-for="step in journeySteps"
          :key="step.step"
          flat
          class="step-card"
        >
          <div class="step-badge">{{ step.step }}</div>
          <h3 class="card-title">{{ step.title }}</h3>
          <p class="card-body">{{ step.body }}</p>
        </q-card>
      </div>
    </section>

    <section class="shell content-section">
      <q-card flat class="glass-panel promise-panel">
        <div class="section-kicker">{{ t('pages.about.promise.eyebrow') }}</div>
        <h2 class="section-title">{{ t('pages.about.promise.title') }}</h2>
        <p class="section-lead promise-body">
          {{ t('pages.about.promise.body') }}
        </p>

        <div class="promise-grid">
          <article
            v-for="item in promises"
            :key="item.text"
            class="promise-item"
          >
            <div class="promise-icon-wrap">
              <q-icon :name="item.icon" size="22px" />
            </div>
            <div class="promise-text">{{ item.text }}</div>
          </article>
        </div>
      </q-card>
    </section>

    <section class="shell cta-section">
      <q-card flat class="cta-panel">
        <div class="cta-copy">
          <div class="section-kicker cta-kicker">
            {{ t('pages.about.cta.eyebrow') }}
          </div>
          <h2 class="cta-title">{{ t('pages.about.cta.title') }}</h2>
          <p class="cta-body">{{ t('pages.about.cta.body') }}</p>
        </div>

        <div class="cta-actions">
          <q-btn
            color="primary"
            text-color="dark"
            unelevated
            size="lg"
            to="/quran"
            :label="t('pages.about.cta.primary')"
          />
          <q-btn
            outline
            color="white"
            size="lg"
            to="/holynames"
            :label="t('pages.about.cta.secondary')"
          />
          <q-btn
            flat
            color="white"
            size="lg"
            to="/contact"
            :label="t('pages.about.cta.tertiary')"
          />
        </div>
      </q-card>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

type StatCard = {
  icon: string
  value: string
  label: string
}

type FeatureCard = {
  icon: string
  title: string
  body: string
}

type JourneyStep = {
  step: string
  title: string
  body: string
}

type PromiseCard = {
  icon: string
  text: string
}

const heroTags = computed(() => [
  t('pages.about.hero.tags.read'),
  t('pages.about.hero.tags.remember'),
  t('pages.about.hero.tags.reflect'),
  t('pages.about.hero.tags.connect'),
])

const stats = computed<StatCard[]>(() => [
  {
    icon: 'translate',
    value: t('pages.about.stats.languages.value'),
    label: t('pages.about.stats.languages.label'),
  },
  {
    icon: 'menu_book',
    value: t('pages.about.stats.suras.value'),
    label: t('pages.about.stats.suras.label'),
  },
  {
    icon: 'phone_iphone',
    value: t('pages.about.stats.experience.value'),
    label: t('pages.about.stats.experience.label'),
  },
])

const pillars = computed<FeatureCard[]>(() => [
  {
    icon: 'auto_stories',
    title: t('pages.about.pillars.read.title'),
    body: t('pages.about.pillars.read.body'),
  },
  {
    icon: 'spa',
    title: t('pages.about.pillars.remember.title'),
    body: t('pages.about.pillars.remember.body'),
  },
  {
    icon: 'forum',
    title: t('pages.about.pillars.connect.title'),
    body: t('pages.about.pillars.connect.body'),
  },
])

const journeySteps = computed<JourneyStep[]>(() => [
  {
    step: t('pages.about.journey.discover.step'),
    title: t('pages.about.journey.discover.title'),
    body: t('pages.about.journey.discover.body'),
  },
  {
    step: t('pages.about.journey.reflect.step'),
    title: t('pages.about.journey.reflect.title'),
    body: t('pages.about.journey.reflect.body'),
  },
  {
    step: t('pages.about.journey.return.step'),
    title: t('pages.about.journey.return.title'),
    body: t('pages.about.journey.return.body'),
  },
])

const promises = computed<PromiseCard[]>(() => [
  {
    icon: 'visibility',
    text: t('pages.about.promise.one'),
  },
  {
    icon: 'language',
    text: t('pages.about.promise.two'),
  },
  {
    icon: 'devices',
    text: t('pages.about.promise.three'),
  },
])
</script>

<style scoped lang="scss">
.about-page {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  padding: 32px 0 88px;
  background:
    radial-gradient(
      circle at top left,
      rgba(56, 189, 248, 0.2),
      transparent 30%
    ),
    radial-gradient(
      circle at top right,
      rgba(129, 140, 248, 0.18),
      transparent 34%
    ),
    linear-gradient(180deg, #f8fbff 0%, #eef4ff 48%, #f9fbff 100%);
  color: #0f172a;
}

.shell {
  position: relative;
  z-index: 1;
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
}

.ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(60px);
  opacity: 0.6;
  pointer-events: none;
  animation: aboutFloat 16s ease-in-out infinite;
}

.ambient-a {
  top: 24px;
  left: -80px;
  width: 260px;
  height: 260px;
  background: rgba(59, 130, 246, 0.24);
}

.ambient-b {
  top: 180px;
  right: -70px;
  width: 320px;
  height: 320px;
  background: rgba(16, 185, 129, 0.18);
  animation-delay: -5s;
}

.ambient-c {
  bottom: 120px;
  left: 18%;
  width: 220px;
  height: 220px;
  background: rgba(168, 85, 247, 0.16);
  animation-delay: -9s;
}

.glass-panel,
.pillar-card,
.step-card {
  border: 1px solid rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.74);
  backdrop-filter: blur(20px);
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 24px;
  align-items: stretch;
}

.hero-copy,
.spotlight-panel,
.story-card,
.quote-card,
.promise-panel,
.cta-panel {
  border-radius: 30px;
}

.hero-copy {
  position: relative;
  overflow: hidden;
  padding: 34px;
}

.hero-copy::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent 45%),
    radial-gradient(
      circle at top right,
      rgba(14, 165, 233, 0.18),
      transparent 35%
    );
  pointer-events: none;
}

.eyebrow-badge {
  margin-bottom: 18px;
  padding: 8px 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-title,
.section-title,
.cta-title,
.spotlight-title {
  margin: 0;
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.hero-title {
  font-size: clamp(2.8rem, 7vw, 4.9rem);
  max-width: 12ch;
}

.hero-lead,
.section-lead,
.spotlight-body,
.cta-body,
.card-body,
.promise-text,
.quote-source,
.stat-label {
  color: #475569;
}

.hero-lead {
  margin: 18px 0 0;
  max-width: 62ch;
  font-size: 1.08rem;
  line-height: 1.8;
}

.hero-tags,
.hero-actions,
.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-tags {
  margin-top: 24px;
}

.hero-chip {
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(255, 255, 255, 0.8);
  color: #1d4ed8;
  font-weight: 600;
}

.hero-actions {
  margin-top: 24px;
}

.spotlight-panel {
  position: relative;
  overflow: hidden;
  padding: 30px;
}

.spotlight-panel::before {
  content: '';
  position: absolute;
  inset: auto -24% 16% auto;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    rgba(14, 165, 233, 0.16),
    transparent 70%
  );
}

.section-kicker {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #2563eb;
}

.spotlight-title {
  margin-top: 14px;
  font-size: clamp(2rem, 4vw, 2.8rem);
}

.spotlight-body {
  margin-top: 14px;
  line-height: 1.8;
  font-size: 1rem;
}

.stats-grid,
.pillar-grid,
.journey-grid,
.promise-grid {
  display: grid;
  gap: 16px;
}

.stats-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 28px;
}

.stat-card {
  position: relative;
  z-index: 1;
  min-height: 144px;
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.stat-icon-wrap,
.pillar-icon-wrap,
.promise-icon-wrap,
.story-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
}

.stat-icon-wrap {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
}

.stat-value {
  margin-top: 18px;
  font-size: clamp(1.9rem, 5vw, 2.8rem);
  font-weight: 800;
  line-height: 1;
}

.stat-label {
  margin-top: 10px;
  line-height: 1.55;
}

.story-section {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(280px, 0.92fr);
  gap: 24px;
  margin-top: 26px;
}

.story-card,
.quote-card,
.promise-panel {
  padding: 30px;
}

.section-title {
  margin-top: 14px;
  font-size: clamp(2rem, 4vw, 2.9rem);
}

.section-lead {
  margin: 16px 0 0;
  line-height: 1.85;
  font-size: 1rem;
}

.story-separator {
  margin: 24px 0;
  opacity: 0.5;
}

.story-note {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.story-icon {
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.14),
    rgba(14, 165, 233, 0.18)
  );
  color: #2563eb;
}

.story-note-title,
.card-title {
  margin: 0;
  font-size: 1.18rem;
  font-weight: 700;
  color: #0f172a;
}

.story-note-body {
  margin-top: 8px;
  color: #475569;
  line-height: 1.7;
}

.quote-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background:
    linear-gradient(145deg, rgba(15, 23, 42, 0.94), rgba(30, 41, 59, 0.9)),
    radial-gradient(
      circle at top left,
      rgba(56, 189, 248, 0.22),
      transparent 35%
    );
  color: white;
  border-color: rgba(255, 255, 255, 0.08);
}

.quote-card .section-kicker,
.cta-kicker {
  color: #7dd3fc;
}

.quote-text {
  margin: 18px 0 16px;
  font-size: clamp(1.5rem, 4vw, 2.3rem);
  line-height: 1.5;
  letter-spacing: -0.02em;
}

.quote-source {
  color: rgba(226, 232, 240, 0.82);
}

.content-section {
  margin-top: 36px;
}

.section-heading {
  margin-bottom: 22px;
}

.centered {
  max-width: 760px;
  margin-inline: auto;
  text-align: center;
}

.pillar-grid,
.journey-grid,
.promise-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.pillar-card,
.step-card {
  position: relative;
  overflow: hidden;
  min-height: 100%;
  padding: 26px;
  border-radius: 26px;
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    border-color 0.28s ease;
}

.pillar-card::after,
.step-card::after {
  content: '';
  position: absolute;
  inset: auto -15% -24% auto;
  width: 150px;
  height: 150px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    rgba(14, 165, 233, 0.12),
    transparent 70%
  );
  pointer-events: none;
}

.pillar-card:hover,
.step-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 30px 85px rgba(15, 23, 42, 0.14);
  border-color: rgba(37, 99, 235, 0.2);
}

.pillar-icon-wrap,
.promise-icon-wrap {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #0f172a, #2563eb);
  color: white;
  margin-bottom: 18px;
}

.card-body,
.promise-text {
  margin: 12px 0 0;
  line-height: 1.75;
}

.step-card {
  padding-top: 30px;
}

.step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.promise-body {
  max-width: 72ch;
}

.promise-grid {
  margin-top: 26px;
}

.promise-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.promise-icon-wrap {
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  margin-bottom: 0;
}

.cta-section {
  margin-top: 36px;
}

.cta-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 34px;
  background:
    radial-gradient(
      circle at top left,
      rgba(56, 189, 248, 0.18),
      transparent 30%
    ),
    linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.92));
  border: 1px solid rgba(125, 211, 252, 0.18);
  color: white;
}

.cta-copy {
  max-width: 640px;
}

.cta-title {
  margin-top: 14px;
  font-size: clamp(1.9rem, 4vw, 3rem);
}

.cta-body {
  margin-top: 12px;
  color: rgba(226, 232, 240, 0.88);
  line-height: 1.8;
}

@keyframes aboutFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(0, -18px, 0) scale(1.05);
  }
}

@media (max-width: 1024px) {
  .hero-section,
  .story-section,
  .cta-panel {
    grid-template-columns: 1fr;
    display: grid;
  }

  .stats-grid,
  .pillar-grid,
  .journey-grid,
  .promise-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .about-page {
    padding-top: 20px;
  }

  .shell {
    width: min(100%, calc(100% - 20px));
  }

  .hero-copy,
  .spotlight-panel,
  .story-card,
  .quote-card,
  .promise-panel,
  .cta-panel,
  .pillar-card,
  .step-card {
    padding: 22px;
    border-radius: 24px;
  }

  .hero-title {
    max-width: none;
  }

  .hero-actions,
  .cta-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions .q-btn,
  .cta-actions .q-btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient,
  .pillar-card,
  .step-card {
    animation: none !important;
    transition: none !important;
  }
}

:deep(body.body--dark) .about-page,
.body--dark .about-page {
  background:
    radial-gradient(
      circle at top left,
      rgba(37, 99, 235, 0.22),
      transparent 30%
    ),
    radial-gradient(
      circle at top right,
      rgba(16, 185, 129, 0.14),
      transparent 34%
    ),
    linear-gradient(180deg, #020617 0%, #020b18 48%, #01050f 100%);
  color: #e2e8f0;
}

:deep(body.body--dark) .glass-panel,
:deep(body.body--dark) .pillar-card,
:deep(body.body--dark) .step-card,
.body--dark .glass-panel,
.body--dark .pillar-card,
.body--dark .step-card {
  background: rgba(7, 15, 28, 0.78);
  border-color: rgba(148, 163, 184, 0.16);
  box-shadow: 0 24px 80px rgba(2, 6, 23, 0.48);
}

:deep(body.body--dark) .hero-lead,
:deep(body.body--dark) .section-lead,
:deep(body.body--dark) .spotlight-body,
:deep(body.body--dark) .card-body,
:deep(body.body--dark) .story-note-body,
:deep(body.body--dark) .promise-text,
:deep(body.body--dark) .stat-label,
.body--dark .hero-lead,
.body--dark .section-lead,
.body--dark .spotlight-body,
.body--dark .card-body,
.body--dark .story-note-body,
.body--dark .promise-text,
.body--dark .stat-label {
  color: #94a3b8;
}

:deep(body.body--dark) .hero-chip,
.body--dark .hero-chip {
  background: rgba(15, 23, 42, 0.74);
  border-color: rgba(125, 211, 252, 0.12);
  color: #7dd3fc;
}

:deep(body.body--dark) .story-note-title,
:deep(body.body--dark) .card-title,
:deep(body.body--dark) .hero-title,
:deep(body.body--dark) .section-title,
:deep(body.body--dark) .spotlight-title,
.body--dark .story-note-title,
.body--dark .card-title,
.body--dark .hero-title,
.body--dark .section-title,
.body--dark .spotlight-title {
  color: #f8fafc;
}

:deep(body.body--dark) .stat-card,
:deep(body.body--dark) .promise-item,
.body--dark .stat-card,
.body--dark .promise-item {
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(148, 163, 184, 0.14);
}

:deep(body.body--dark) .step-badge,
.body--dark .step-badge {
  background: rgba(56, 189, 248, 0.12);
  color: #7dd3fc;
}

:deep(body.body--dark) .quote-card,
.body--dark .quote-card {
  background:
    linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.94)),
    radial-gradient(
      circle at top left,
      rgba(56, 189, 248, 0.2),
      transparent 35%
    );
}
</style>

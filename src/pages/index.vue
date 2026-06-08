<route lang="json">
{ "meta": { "layout": "home" } }
</route>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const features = [
  {
    to: '/quran',
    icon: 'menu_book',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    accent: '#60a5fa',
    labelKey: 'appShell.nav.quran',
    descKey: 'pages.quran.title',
  },
  {
    to: '/holynames',
    icon: 'auto_awesome',
    gradient: 'linear-gradient(135deg, #3b1f6e 0%, #7c3aed 100%)',
    accent: '#c4b5fd',
    labelKey: 'appShell.nav.holynames',
    desc: 'The 99 Holy Names of Allah',
  },
  {
    to: '/tasbeeh',
    icon: 'loop',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
    accent: '#6ee7b7',
    labelKey: 'appShell.nav.tasbeeh',
    descKey: 'pages.tasbeeh',
  },
]
</script>

<template>
  <q-page class="home-page">

    <!-- ── Hero ── -->
    <section class="hero">
      <div class="hero-glow" />
      <div class="hero-inner">
        <img src="/logo.svg" alt="PEACE2074" class="hero-logo" />
        <h1 class="hero-title">{{ t('welcome') }} {{ t('general.SiteTitle') }}</h1>
        <p class="hero-lead">{{ t('pages.home.hero.lead') }}</p>
      </div>
    </section>

    <!-- ── Feature Cards ── -->
    <section class="features">
      <RouterLink
        v-for="f in features"
        :key="f.to"
        :to="f.to"
        class="feature-card"
        :style="{ '--grad': f.gradient, '--accent': f.accent }"
      >
        <div class="card-bg" />
        <div class="card-icon">
          <q-icon :name="f.icon" size="2rem" />
        </div>
        <div class="card-text">
          <span class="card-title">{{ t(f.labelKey) }}</span>
          <span class="card-desc">{{ f.desc ?? t(f.descKey!) }}</span>
        </div>
        <q-icon name="arrow_forward" class="card-arrow" size="1.1rem" />
      </RouterLink>
    </section>

    <!-- ── App Preview Video ── -->
    <section class="media-section">
      <h2 class="section-heading">{{ t('pages.home.video.title', 'App Preview') }}</h2>
      <div class="video-wrap">
        <iframe
          src="https://www.youtube.com/embed/?enablejsapi=1&rel=0&autoplay=0&playsinline=1&fs=1"
          title="PEACE2074 App Preview"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          class="video-frame"
        />
      </div>
    </section>

    <!-- ── Screenshots ── -->
    <section class="media-section">
      <h2 class="section-heading">Available on Apple TV &amp; Apple Watch</h2>

      <div class="screenshot-row">
        <h3 class="device-label">Apple TV</h3>
        <div class="screenshot-scroll">
          <img src="/screenshots/tv-1.png" alt="Apple TV Home" loading="lazy" class="ss-tv" />
          <img src="/screenshots/tv-2.png" alt="Apple TV Player" loading="lazy" class="ss-tv" />
          <img src="/screenshots/tv-3.png" alt="Apple TV Bookmarks" loading="lazy" class="ss-tv" />
        </div>
      </div>

      <div class="screenshot-row">
        <h3 class="device-label">Apple Watch</h3>
        <div class="screenshot-scroll">
          <img src="/screenshots/watch-1.png" alt="Apple Watch Home" loading="lazy" class="ss-watch" />
          <img src="/screenshots/watch-2.png" alt="Apple Watch Player" loading="lazy" class="ss-watch" />
          <img src="/screenshots/watch-3.png" alt="Apple Watch Bookmarks" loading="lazy" class="ss-watch" />
        </div>
      </div>
    </section>

  </q-page>
</template>

<style scoped>
/* ── Page ── */
.home-page {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'DM Sans', sans-serif;
}

/* ── Hero ── */
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%);
  padding: 5rem 1.5rem 4rem;
  text-align: center;
  color: #fff;
}
.hero-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 50% at 50% -10%, rgba(139, 92, 246, 0.45) 0%, transparent 70%),
    radial-gradient(ellipse 40% 30% at 80% 110%, rgba(37, 99, 235, 0.3) 0%, transparent 60%);
  pointer-events: none;
}
.hero-inner {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}
.hero-logo {
  width: 88px;
  height: auto;
  margin-bottom: 1.25rem;
  filter: drop-shadow(0 0 24px rgba(139, 92, 246, 0.6));
  animation: float 4s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
.hero-title {
  font-size: clamp(1.9rem, 5vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 0.75rem;
  background: linear-gradient(135deg, #fff 30%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-lead {
  color: rgba(255,255,255,0.7);
  font-size: 1.05rem;
  line-height: 1.7;
  margin: 0;
}

/* ── Feature Cards ── */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
  max-width: 1000px;
  margin: -2rem auto 0;
  padding: 0 1.5rem;
  position: relative;
  z-index: 10;
}

.feature-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.4rem 1.25rem;
  border-radius: 18px;
  text-decoration: none;
  color: #fff;
  overflow: hidden;
  background: var(--grad);
  box-shadow: 0 4px 20px rgba(0,0,0,0.18);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.feature-card:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 16px 40px rgba(0,0,0,0.28);
}
.card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top right, rgba(255,255,255,0.12) 0%, transparent 60%);
  pointer-events: none;
}
.card-icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  backdrop-filter: blur(4px);
}
.card-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}
.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}
.card-desc {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-arrow {
  flex-shrink: 0;
  color: rgba(255,255,255,0.5);
  transition: transform 0.2s ease, color 0.2s ease;
}
.feature-card:hover .card-arrow {
  transform: translateX(4px);
  color: #fff;
}

/* ── Media Sections ── */
.media-section {
  max-width: 1000px;
  margin: 2.5rem auto 0;
  padding: 0 1.5rem;
}
.section-heading {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0 0 1.1rem;
  padding-bottom: 0.6rem;
  border-bottom: 2px solid #e0e7ff;
}

/* Video */
.video-wrap {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 12px 32px rgba(0,0,0,0.14);
}
.video-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

/* Screenshots */
.screenshot-row {
  margin-bottom: 1.75rem;
}
.device-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.75rem;
}
.screenshot-scroll {
  display: flex;
  gap: 0.875rem;
  overflow-x: auto;
  padding-bottom: 0.75rem;
  scroll-snap-type: x mandatory;
}
.screenshot-scroll::-webkit-scrollbar { height: 4px; }
.screenshot-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
.screenshot-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.ss-tv {
  width: 300px;
  flex-shrink: 0;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  scroll-snap-align: start;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}
.ss-tv:hover { transform: scale(1.02); }
.ss-watch {
  width: 140px;
  flex-shrink: 0;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  scroll-snap-align: start;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}
.ss-watch:hover { transform: scale(1.03); }

/* ── Responsive ── */
@media (max-width: 600px) {
  .hero { padding: 3.5rem 1.25rem 3rem; }
  .features { margin-top: -1.5rem; }
  .feature-card { padding: 1.1rem 1rem; }
}
</style>

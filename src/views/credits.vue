<script setup lang="ts">
import { ref } from 'vue'

const search = ref('')

interface CreditEntry {
  name: string
  description: string
  url: string
  license?: string
  category: string
  icon?: string
  author?: string
}

const credits: CreditEntry[] = [
  // ── Quran & Islamic Data ───────────────────────────────────────────────────
  {
    name: 'Quran API (api.quran.com)',
    description: 'The definitive source for Quran text, translations, audio, and tafsir. Powers all Quran reading and recitation features.',
    url: 'https://api.quran.com',
    category: 'Quran & Islamic Data',
    icon: 'menu_book',
  },
  {
    name: 'EveryAyah.com',
    description: 'High-quality mp3 audio for every verse of the Quran by multiple reciters. Used for verse-by-verse audio playback and offline recitation.',
    url: 'https://everyayah.com',
    category: 'Quran & Islamic Data',
    icon: 'hearing',
  },
  {
    name: 'abodehq / Athan-MP3',
    description: 'Open-source collection of 14 authentic Athan audio recordings from beloved reciters including Mishary Alafasy and Makkah Haram.',
    url: 'https://github.com/abodehq/Athan-MP3',
    license: 'Open Source',
    category: 'Quran & Islamic Data',
    icon: 'volume_up',
    author: 'abodehq',
  },
  {
    name: 'adhan-js',
    description: 'Precise Islamic prayer time calculations. Supports all major calculation methods (MWL, ISNA, Egypt, Makkah, Karachi, Tehran, Shia).',
    url: 'https://github.com/batoulapps/adhan-js',
    license: 'MIT',
    category: 'Quran & Islamic Data',
    icon: 'schedule',
    author: 'batoulapps',
  },
  // ── Core Framework ─────────────────────────────────────────────────────────
  {
    name: 'Vue.js 3',
    description: 'The progressive JavaScript framework. The entire UI of Peace2074 is built with Vue 3 Composition API.',
    url: 'https://vuejs.org',
    license: 'MIT',
    category: 'Core Framework',
    icon: 'code',
    author: 'Evan You & Vue Core Team',
  },
  {
    name: 'Quasar Framework',
    description: 'Vue-based UI component library providing buttons, dialogs, drawers, and the entire design system of the app.',
    url: 'https://quasar.dev',
    license: 'MIT',
    category: 'Core Framework',
    icon: 'dashboard',
    author: 'Razvan Stoenescu',
  },
  {
    name: 'Vite',
    description: 'Next-generation frontend tooling. Blazing-fast development server and production bundler used to build Peace2074.',
    url: 'https://vitejs.dev',
    license: 'MIT',
    category: 'Core Framework',
    icon: 'flash_on',
    author: 'Evan You & Vite Team',
  },
  {
    name: 'Pinia',
    description: 'Vue state management. Powers the authentication store, user preferences, and application state.',
    url: 'https://pinia.vuejs.org',
    license: 'MIT',
    category: 'Core Framework',
    icon: 'store',
    author: 'Eduardo San Martin Morote',
  },
  {
    name: 'Vue Router',
    description: 'Official Vue.js router enabling multi-page navigation across Quran, Tasbeeh, settings, and all other pages.',
    url: 'https://router.vuejs.org',
    license: 'MIT',
    category: 'Core Framework',
    icon: 'route',
  },
  {
    name: 'vue-i18n',
    description: 'Internationalization plugin. Enables Peace2074 in Arabic, English, German, Spanish, Russian, Hebrew, Italian, and Turkish.',
    url: 'https://vue-i18n.intlify.dev',
    license: 'MIT',
    category: 'Core Framework',
    icon: 'language',
    author: 'kazupon',
  },
  // ── @waelio Ecosystem ──────────────────────────────────────────────────────
  {
    name: '@waelio/realdb',
    description: 'Local-first reactive database. Persists offline recitation download state across sessions with a clean collection API.',
    url: 'https://www.npmjs.com/package/@waelio/realdb',
    license: 'MIT',
    category: '@waelio Ecosystem',
    icon: 'storage',
    author: 'Waelio (waelio.com)',
  },
  {
    name: '@waelio/ustore',
    description: 'Universal reactive storage layer. Manages localStorage, sessionStorage, and memory state with optional encryption.',
    url: 'https://www.npmjs.com/package/@waelio/ustore',
    license: 'MIT',
    category: '@waelio Ecosystem',
    icon: 'save',
    author: 'Waelio (waelio.com)',
  },
  {
    name: '@waelio/utils',
    description: 'Storage utilities including reactive signal storage for theme, locale, and user preferences.',
    url: 'https://www.npmjs.com/package/@waelio/utils',
    license: 'MIT',
    category: '@waelio Ecosystem',
    icon: 'build',
    author: 'Waelio (waelio.com)',
  },
  {
    name: '@waelio/sync',
    description: 'Edge-first data sync SDK backed by Cloudflare KV. Powers cross-device reading position and bookmark sync.',
    url: 'https://www.npmjs.com/package/@waelio/sync',
    license: 'MIT',
    category: '@waelio Ecosystem',
    icon: 'sync',
    author: 'Waelio (waelio.com)',
  },
  {
    name: '@waelio/messaging',
    description: 'Real-time pub/sub messaging. Powers the live chat and cross-tab event communication.',
    url: 'https://www.npmjs.com/package/@waelio/messaging',
    license: 'MIT',
    category: '@waelio Ecosystem',
    icon: 'chat',
    author: 'Waelio (waelio.com)',
  },
  {
    name: '@waelio/data',
    description: 'Local secure reactive database layer for structured client-side data management.',
    url: 'https://www.npmjs.com/package/@waelio/data',
    license: 'MIT',
    category: '@waelio Ecosystem',
    icon: 'table_chart',
    author: 'Waelio (waelio.com)',
  },
  {
    name: 'waelio-utils',
    description: 'Core utility functions including encryption/decryption (AES) for secure local storage.',
    url: 'https://www.npmjs.com/package/waelio-utils',
    license: 'MIT',
    category: '@waelio Ecosystem',
    icon: 'security',
    author: 'Waelio (waelio.com)',
  },
  // ── Infrastructure ─────────────────────────────────────────────────────────
  {
    name: 'Cloudflare Pages',
    description: 'Hosts and serves Peace2074 globally. Edge caching, DDoS protection, and global CDN with zero-config deployment.',
    url: 'https://pages.cloudflare.com',
    category: 'Infrastructure',
    icon: 'cloud',
  },
  {
    name: 'Appwrite',
    description: 'Open-source backend platform providing authentication, user management, and database for Peace2074 accounts.',
    url: 'https://appwrite.io',
    license: 'BSD-3-Clause',
    category: 'Infrastructure',
    icon: 'dns',
  },
  {
    name: 'MongoDB',
    description: 'Document database powering the chat history, user profiles, and blog content via the Nitro API.',
    url: 'https://mongodb.com',
    category: 'Infrastructure',
    icon: 'dataset',
    author: 'MongoDB, Inc.',
  },
  {
    name: 'Firebase',
    description: 'Web push notifications via Firebase Cloud Messaging — delivers prayer time alerts to subscribed users.',
    url: 'https://firebase.google.com',
    category: 'Infrastructure',
    icon: 'notifications',
    author: 'Google',
  },
  // ── PWA & Offline ──────────────────────────────────────────────────────────
  {
    name: 'Workbox',
    description: 'Google\'s service worker toolkit. Powers Peace2074\'s offline experience — precaching, background sync, and cache strategies.',
    url: 'https://developer.chrome.com/docs/workbox',
    license: 'MIT',
    category: 'PWA & Offline',
    icon: 'offline_bolt',
    author: 'Google Chrome Team',
  },
  {
    name: 'vite-plugin-pwa',
    description: 'Integrates Workbox with Vite for seamless PWA generation. Enables offline mode, install prompts, and update banners.',
    url: 'https://vite-pwa-org.netlify.app',
    license: 'MIT',
    category: 'PWA & Offline',
    icon: 'install_mobile',
    author: 'antfu & vite-pwa team',
  },
  // ── Fonts & Icons ──────────────────────────────────────────────────────────
  {
    name: 'Amiri Font',
    description: 'Classical Arabic typeface inspired by traditional Naskh style. Used for Quran text rendering throughout the app.',
    url: 'https://github.com/alif-type/amiri',
    license: 'OFL-1.1',
    category: 'Fonts & Design',
    icon: 'text_fields',
    author: 'Khaled Hosny',
  },
  {
    name: 'Noto Naskh Arabic',
    description: 'Google\'s Naskh Arabic font ensuring consistent rendering of Arabic text across all devices and operating systems.',
    url: 'https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic',
    license: 'OFL-1.1',
    category: 'Fonts & Design',
    icon: 'font_download',
    author: 'Google Fonts',
  },
  {
    name: 'DM Sans / DM Serif / DM Mono',
    description: 'Google\'s DM type family used for all Latin text — headings, body copy, and monospace code throughout the interface.',
    url: 'https://fonts.google.com/specimen/DM+Sans',
    license: 'OFL-1.1',
    category: 'Fonts & Design',
    icon: 'format_size',
    author: 'Google Fonts / Colophon Foundry',
  },
  {
    name: 'Material Icons',
    description: 'Google\'s open-source icon set. Every icon in navigation, buttons, and the UI comes from Material Symbols.',
    url: 'https://fonts.google.com/icons',
    license: 'Apache 2.0',
    category: 'Fonts & Design',
    icon: 'star',
    author: 'Google',
  },
  {
    name: 'Font Awesome',
    description: 'Supplementary icon library used for brand logos and social media icons in the app.',
    url: 'https://fontawesome.com',
    license: 'CC BY 4.0 (icons)',
    category: 'Fonts & Design',
    icon: 'flag',
    author: 'Fonticons, Inc.',
  },
  // ── Utilities ──────────────────────────────────────────────────────────────
  {
    name: 'VueUse',
    description: 'Collection of essential Vue composition utilities. Used for reactive device detection, scroll behavior, and more.',
    url: 'https://vueuse.org',
    license: 'MIT',
    category: 'Utilities',
    icon: 'extension',
    author: 'antfu & VueUse contributors',
  },
  {
    name: 'Three.js',
    description: '3D graphics library powering visual effects and animations on the home page and special interactive elements.',
    url: 'https://threejs.org',
    license: 'MIT',
    category: 'Utilities',
    icon: 'view_in_ar',
    author: 'Mr.doob & Three.js contributors',
  },
  {
    name: '@casl/ability',
    description: 'Role-based access control library. Manages admin vs. user permissions throughout the app.',
    url: 'https://casl.js.org',
    license: 'MIT',
    category: 'Utilities',
    icon: 'lock',
    author: 'Sergii Stotskyi',
  },
  {
    name: 'EmailJS',
    description: 'Send emails directly from the browser without a backend. Powers the contact form.',
    url: 'https://www.emailjs.com',
    category: 'Utilities',
    icon: 'email',
  },
  {
    name: 'Socket.io',
    description: 'Real-time bidirectional event-based communication. Powers the live chat feature.',
    url: 'https://socket.io',
    license: 'MIT',
    category: 'Utilities',
    icon: 'swap_horiz',
    author: 'Socket.io contributors',
  },
  {
    name: 'SimpleWebAuthn',
    description: 'WebAuthn / passkey authentication library. Powers passwordless sign-in for Peace2074 accounts.',
    url: 'https://simplewebauthn.dev',
    license: 'MIT',
    category: 'Utilities',
    icon: 'fingerprint',
    author: 'Matthew Miller',
  },
  {
    name: 'Axios',
    description: 'Promise-based HTTP client for the browser. Used for API calls to Quran data and backend services.',
    url: 'https://axios-http.com',
    license: 'MIT',
    category: 'Utilities',
    icon: 'http',
  },
  {
    name: 'jose',
    description: 'JSON Web Tokens and signing. Used for secure session handling and API authentication.',
    url: 'https://github.com/panva/jose',
    license: 'MIT',
    category: 'Utilities',
    icon: 'vpn_key',
    author: 'Filip Skokan',
  },
]

const categories = [...new Set(credits.map((c) => c.category))]

const categoryIcons: Record<string, string> = {
  'Quran & Islamic Data': 'menu_book',
  'Core Framework': 'code',
  '@waelio Ecosystem': 'hub',
  'Infrastructure': 'cloud',
  'PWA & Offline': 'offline_bolt',
  'Fonts & Design': 'palette',
  'Utilities': 'build_circle',
}

const categoryColors: Record<string, string> = {
  'Quran & Islamic Data': '#10b981',
  'Core Framework': '#6366f1',
  '@waelio Ecosystem': '#f59e0b',
  'Infrastructure': '#3b82f6',
  'PWA & Offline': '#8b5cf6',
  'Fonts & Design': '#ec4899',
  'Utilities': '#64748b',
}

function filteredByCategory(cat: string) {
  const q = search.value.toLowerCase()
  return credits.filter(
    (c) => c.category === cat && (!q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
  )
}

function visibleCategories() {
  if (!search.value) return categories
  return categories.filter((cat) => filteredByCategory(cat).length > 0)
}
</script>

<template>
  <q-page class="credits-page">
    <!-- Hero -->
    <div class="credits-hero">
      <div class="hero-bg" />
      <div class="hero-content">
        <div class="hero-badge">Open Source</div>
        <h1 class="hero-title">Built on the shoulders of giants</h1>
        <p class="hero-subtitle">
          Peace2074 exists because of the open-source community, Islamic scholars who digitized the
          Quran, and developers who freely share their work. This page credits everyone whose work
          we depend on.
        </p>
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          placeholder="Search libraries, APIs, tools…"
          class="hero-search"
          aria-label="Search credits"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Credit sections -->
    <div class="credits-body">
      <section
        v-for="cat in visibleCategories()"
        :key="cat"
        class="credit-section"
      >
        <!-- Section header -->
        <div class="section-header">
          <div class="section-icon" :style="{ background: categoryColors[cat] + '22', color: categoryColors[cat] }">
            <q-icon :name="categoryIcons[cat] || 'star'" size="1.25rem" />
          </div>
          <h2 class="section-title">{{ cat }}</h2>
          <div class="section-count">{{ filteredByCategory(cat).length }}</div>
        </div>

        <!-- Cards grid -->
        <div class="cards-grid">
          <a
            v-for="credit in filteredByCategory(cat)"
            :key="credit.name"
            :href="credit.url"
            target="_blank"
            rel="noopener noreferrer"
            class="credit-card"
            :style="{ '--accent': categoryColors[cat] }"
          >
            <div class="card-icon-wrap">
              <q-icon :name="credit.icon || 'link'" size="1.5rem" :style="{ color: categoryColors[cat] }" />
            </div>
            <div class="card-body">
              <div class="card-name">{{ credit.name }}</div>
              <div v-if="credit.author" class="card-author">by {{ credit.author }}</div>
              <div class="card-desc">{{ credit.description }}</div>
            </div>
            <div class="card-footer">
              <span v-if="credit.license" class="license-badge">{{ credit.license }}</span>
              <q-icon name="open_in_new" size="0.875rem" class="card-link-icon" />
            </div>
          </a>
        </div>
      </section>

      <!-- Closing note -->
      <div class="closing-note">
        <q-icon name="favorite" color="negative" size="1.5rem" class="q-mb-sm" />
        <p>
          This project stands on the work of hundreds of open-source contributors, Islamic scholars,
          and developers worldwide. If you believe your work should be credited and isn't listed here,
          please <a href="/contact" class="contact-link">reach out</a>.
        </p>
        <p class="q-mt-sm text-caption">
          Peace2074 is also open source. Our code, composables, and @waelio packages are freely available at
          <a href="https://github.com/waelio" target="_blank" rel="noopener" class="contact-link">github.com/waelio</a>
          and <a href="https://waelio.com" target="_blank" rel="noopener" class="contact-link">waelio.com</a>.
        </p>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.credits-page {
  min-height: 100vh;
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */
.credits-hero {
  position: relative;
  padding: 4rem 2rem 3rem;
  overflow: hidden;
  text-align: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 65%),
    radial-gradient(ellipse at 80% 100%, rgba(16, 185, 129, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  max-width: 640px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-block;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #818cf8;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  margin-bottom: 1rem;
}

.hero-title {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 1rem;
  background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.body--light .hero-title {
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.hero-subtitle {
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.7;
  margin: 0 0 1.5rem;
}

.body--light .hero-subtitle {
  color: #64748b;
}

.hero-search {
  max-width: 420px;
  margin: 0 auto;
}

/* ── Body ──────────────────────────────────────────────────────────────────── */
.credits-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem 4rem;
}

/* ── Section ───────────────────────────────────────────────────────────────── */
.credit-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.body--light .section-header {
  border-bottom-color: rgba(0, 0, 0, 0.07);
}

.section-icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
}

.section-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
}

.body--light .section-count {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.08);
}

/* ── Cards ─────────────────────────────────────────────────────────────────── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.credit-card {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1.125rem;
  border-radius: 0.875rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.18s, background 0.18s, transform 0.18s, box-shadow 0.18s;
  cursor: pointer;
}

.body--light .credit-card {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.07);
}

.credit-card:hover {
  border-color: var(--accent, #6366f1);
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--accent, #6366f1) inset;
}

.body--light .credit-card:hover {
  background: rgba(0, 0, 0, 0.03);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px var(--accent, #6366f1) inset;
}

.card-icon-wrap {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.body--light .card-icon-wrap {
  background: rgba(0, 0, 0, 0.04);
}

.card-body {
  flex: 1;
}

.card-name {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 0.125rem;
  color: #e2e8f0;
}

.body--light .card-name {
  color: #1e293b;
}

.card-author {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.375rem;
}

.card-desc {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: #94a3b8;
}

.body--light .card-desc {
  color: #64748b;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
}

.license-badge {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #64748b;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
}

.body--light .license-badge {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.08);
}

.card-link-icon {
  color: #475569;
  transition: color 0.15s;
}

.credit-card:hover .card-link-icon {
  color: var(--accent, #6366f1);
}

/* ── Closing note ──────────────────────────────────────────────────────────── */
.closing-note {
  margin-top: 3rem;
  padding: 2rem;
  border-radius: 1rem;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.12);
  text-align: center;
  color: #94a3b8;
  font-size: 0.9375rem;
  line-height: 1.7;
}

.body--light .closing-note {
  background: rgba(99, 102, 241, 0.04);
  color: #64748b;
}

.contact-link {
  color: #818cf8;
  text-decoration: none;
  font-weight: 500;
}

.contact-link:hover {
  text-decoration: underline;
}
</style>

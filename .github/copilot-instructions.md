# Peace2074.com - AI Coding Agent Instructions

## Architecture Overview

**Hybrid Application**: Vue 3 SPA (frontend) + Nitro API (backend)

```
src/                          # Vue 3 + TypeScript frontend
├── views/                    # File-based routing (unplugin-vue-router)
│   ├── quran/[...lok].vue   # Quran reader with verse navigation
│   ├── tasbeeh.vue          # Islamic counter with haptic feedback
│   ├── holynames.vue        # 99 Names of Allah (multi-language)
│   └── chat.vue             # AI chat (DeepSeek integration)
├── stores/                   # Pinia state management
│   ├── q2p.pinia.ts        # Quran data loader (lazy JSON imports)
│   ├── auth.pinia.ts       # Netlify Identity authentication
│   └── bookmarks.pinia.ts  # User bookmark persistence
├── layouts/AppShell.vue     # Main app layout (nav, footer, theme toggle)
├── composables/             # Vue composables (useAthanPlayer, useQ2P)
├── locale/                  # i18n translations (ar, en, he, ru, de, fr)
└── plugins/                 # Quasar UI, Font Awesome, Pinia

apps/nitro-api/              # Nitro backend (separate workspace)
└── server/routes/           # API endpoints (/deepseek, /quran, /auth)

dist/                        # Built SPA output (committed to git)
```

**Key Technologies**:
- **Vite** - Build tool with PWA plugin, auto-imports, chunking
- **Vue Router** - File-based routes from `src/views/`
- **Pinia** - State stores with HMR
- **Quasar** - UI framework (dark mode, RTL support)
- **PWA** - Service worker via vite-plugin-pwa (workbox)
- **i18n** - Vue I18n with RTL detection (Arabic, Hebrew)
- **Three.js** - 3D background effects (ThreeBackground.vue)

## Development Workflow

**Setup & Run**:
```bash
pnpm install              # Always use pnpm (Node 22.12+ required)
pnpm dev                  # Runs Vite (port 5173) + Nitro API (port 3000) concurrently
pnpm dev:vite             # Frontend only
pnpm dev:nitro            # Backend only
```

**Build & Deploy**:
```bash
pnpm build                # Vite build → dist/
pnpm lint                 # ESLint + Prettier (auto-fixes)
pnpm typecheck            # Vue TSC type checking
pnpm check:locales        # Validate i18n files are in sync
```

**Build Optimizations**:
- Manual chunks: `vendor-vue`, `vendor-quasar`, `vendor-i18n`, `three`
- Chunk size limit: 600KB (vite.config.ts)
- Lazy-loaded Quran data (31MB JSON split by edition)

## Code Patterns & Conventions

**Pinia Stores** (stores/*.pinia.ts):
```typescript
import { defineStore, acceptHMRUpdate } from 'pinia'

export const useQ2P = defineStore('q2p', {
  state: () => ({
    Book: [] as any[],  // Lazy-loaded via loadLocalQuran()
    Sura: {} as SuraI,
    Index: 1,
  }),
  actions: {
    async init() {
      await ensureBook(this.$state, 1)  // Load JSON on demand
    }
  }
})

// Enable HMR
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useQ2P, import.meta.hot))
}
```

**File-Based Routes** (src/views/*.vue):
```vue
<script setup lang="ts">
// Auto-imported: ref, computed, onMounted, useRouter, etc.
const route = useRoute()
const q2p = useQ2P()

onMounted(() => q2p.init())
</script>

<template>
  <q-page><!-- Quasar components auto-resolved --></q-page>
</template>
```

**i18n Usage**:
```vue
<script setup>
const { t, locale } = useI18n()  // Auto-imported
</script>
<template>
  <h1>{{ t('quran.title') }}</h1>
</template>
```

**API Integration** (apps/nitro-api):
```typescript
// apps/nitro-api/server/routes/quran.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  return { chapters: await getQuranData() }
})
```

## Deployment & Configuration

**Platform**: Netlify (committed `dist/` folder)
- Build: `vite build` → `dist/`
- PWA assets: manifest.webmanifest, sw.js, icons (Android, iOS, Windows)
- No SSR - pure SPA with client-side routing

**Environment Variables** (Vite requires `VITE_` prefix):
```bash
# Frontend (prefix with VITE_)
VITE_QURAN_API_BASE=http://localhost:3000
VITE_DEEPSEEK_API_KEY=sk-...  # For chat feature

# Backend (Nitro API in apps/nitro-api)
DEEPSEEK_API_KEY=sk-...
MONGODB_URI=mongodb+srv://...
```

**Config Files**:
- `vite.config.ts` - Plugins (PWA, auto-import, Quasar, unplugin-vue-router)
- `apps/nitro-api/nitro.config.ts` - Backend server config
- `src/locale/*.json` - i18n translation files (must stay in sync)
- `uno.config.ts` - UnoCSS utility classes (if used)

## Data Architecture

**Quran Data Strategy**:
- **Lazy Loading**: JSON imports delayed until user navigates to Quran
- **Storage**: `src/shared/data/editions/*.json` (31MB total, split by language)
- **Caching**: HMR-safe readyCache in q2p.pinia.ts
- **Pattern**:
  ```typescript
  await import('@shared/data/quran.json').then(m => m.default)
  await import('@shared/data/chapters/en.json').then(m => m.default)
  ```

**Bookmarks**: Pinia store + localStorage (unstorage driver)
**Auth**: Netlify Identity widget + JWT validation
**Analytics**: Google Analytics with consent management (ConsentBanner.vue)

## PR & Change Requirements

Per `CONTRIBUTING.md`:
1. Never push directly to `one` (default branch)
2. PRs must include:
   - Description of changes with affected components/routes
   - Test plan (manual or automated)
   - Passing lint, typecheck, build
3. Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
4. Locale changes require running `pnpm check:locales`
5. Get CODEOWNER approval before merge

## Common Pitfalls

❌ **Don't** use `VITE_` prefix for backend env vars (they're exposed to client)
❌ **Don't** import all Quran data upfront (lazy-load per src/stores/q2p.pinia.ts)
❌ **Don't** break RTL layout (test with Arabic/Hebrew locales)
❌ **Don't** forget dark mode compatibility (Quasar's `$q.dark`)
❌ **Don't** add heavy deps without checking bundle size

✅ **Do** use auto-imports (Vue, Router, Pinia already configured)
✅ **Do** add new routes as `src/views/*.vue` (auto-detected)
✅ **Do** test PWA offline behavior (service worker caching)
✅ **Do** use Quasar components (no manual imports needed)
✅ **Do** validate i18n completeness with `check:locales` script

**Node Version**: Requires Node 22.12+ (enforced in predev script)

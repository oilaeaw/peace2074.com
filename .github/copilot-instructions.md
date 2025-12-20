## AI coding guide for this repo (PEACE2074)

Vue 3 + TypeScript + Vite app with Quasar UI, Vue Router, Pinia, and vue-i18n for a multi-language Islamic knowledge platform. Follow existing patterns closely.

### Architecture at a glance

**Entry and Shell:** `src/main.ts` initializes Router, Pinia, i18n, FontAwesome, and Quasar. `src/layouts/AppShell.vue` (Quasar layout with header/drawer/page/footer) wraps all pages via `<RouterView/>`.

**Routing:** `src/router/routes.ts` defines routes with `meta.titleKey` (e.g., `pages.quran.title`) for automatic i18n-driven document titles via `router.afterEach()` in main.ts. Always prefer `titleKey` over hard-coded `title`.

**Pages and Components:** Primary pages in `src/pages/**` (using Nuxt-like `[id].vue` for dynamic routes). Some legacy views in `src/views/**`. Shared UI components auto-register from `src/core/components/**` (via unplugin-vue-components + QuasarResolver in vite.config.ts).

**State management:** Pinia stores in `src/stores/**` (e.g., `q2p.pinia.ts` for Quran data, `langs.pinia.ts` for locale). Stores with `.pinia.ts` suffix are auto-imported via unplugin-auto-import scanning `src/modules/**/store`.

**i18n:** Four locales (en, ar, de, ru) in `src/locale/*.json`, initialized in `src/i18n.ts`. Locale changes propagate automatically through `watch(i18n.global.locale.value)` in AppShell, updating document titles via router's current route.

### Data flow: Quran with fallback strategy

`src/composables/useQ2P.ts` is the single entry point for Quran data:

1. **Prefers HTTP:** Calls `/api/quran` (list) or `/api/quran/:id` (single sura)
2. **On API failure:** Falls back to bundled JSON in `src/shared/data/` (quran.json for verses, chapters/{en,ar,...}.json for metadata)
3. **Usage:** Call `useQ2P().init(index, locale)` to load; access via computed `GetQ` and `GetSura` getters

When adding new Quran features, reuse this pattern—never fetch directly; always go through useQ2P.

### State management patterns

**Composable vs Store distinction:**

- **Use composable (`useQ2P()`)** for page components that fetch and manage their own data lifecycle. Example: `src/pages/quran/index.vue` calls `useQ2P().init()` in `onMounted`, updates refs reactively, handles loading/error states locally. Each component gets its own instance, preventing cross-page pollution.
- **Use Pinia store (`useQ2P` from q2p.pinia.ts)** for global state that persists across navigation or is shared by multiple unrelated components (style config, legends, computed maps). Store state is auto-injected and cached. Use when you need consistent data across routes or for frequently accessed reference data.
- **Pattern:** Pages typically use the composable for data fetching + their own reactive state; the store provides stable, pre-computed data and constants (e.g., `LLegend` for letter-to-number mappings).

**Real examples:**

- ✅ Composable: `src/pages/quran/index.vue` uses `useQ2P()` to fetch and manage surah list with local loading/error states
- ✅ Store: `src/stores/q2p.pinia.ts` maintains `LLegend` (letter-value mappings) and computed style maps for shared use across components
- ✅ Mixed: A detail page might use composable to fetch current sura, but access store for `LLegend` decorations

**Decision tree:**

1. Does data need to persist across route changes? → Use **Pinia store**
2. Is it needed by multiple unrelated components? → Use **Pinia store**
3. Is it page-specific state (loading, form data, local UI)? → Use **composable**
4. Is it expensive to compute and accessed repeatedly? → Use **Pinia store** with getters
5. Is it API-fetched data for one page/flow? → Use **composable**, store in Pinia only if needed elsewhere

**When in doubt:** Start with the composable in page components; promote to the store only when the data or computed values are needed by sibling pages or persistent across route changes.

### Auto-imports and aliases

- **Components:** vite.config.ts auto-registers from `src/core/components` and `src/modules/**/components`; Quasar components resolved automatically
- **Functions/stores:** `unplugin-auto-import` scans `src/modules/**/composables` and `src/modules/**/store` (`.pinia.ts` files)
- **Aliases:** `@` and `~` → `src`, `@shared` → `src/shared`. Prefer these over relative paths

### Build, dev, test

- **Node:** 22.12+ required (checked by `npm predev` script)
- **Dev:** `pnpm dev` runs Vite on port 3000
- **Commands:** `build`, `preview`, `lint` (ESLint + Prettier), `typecheck` (vue-tsc)
- **E2E:** Playwright tests in `tests/e2e.spec.ts` expect `.sura-card` selector on Quran page and "Read Quran" text on home
- **Unit tests:** Directory is `test/` (singular); add files there as needed; runs via vitest

### Quasar integration

Globally registered in `src/plugins/quasar.ts` with Notify plugin enabled. Import `useQuasar()` to show notifications: `$q.notify({ type: 'positive', message: '...' })`. Styles combine Quasar CSS + project SCSS in `src/styles/scss/`.

### Common patterns

1. **Add translated route:** Create page file, add route to `src/router/routes.ts` with `meta: { titleKey: 'pages.new.title' }`, add translation key to `src/locale/*.json`
2. **Quran list/detail:** Follow `src/pages/quran/index.vue` and `[id].vue`—use `useQ2P().init()`, handle loading/error, notify user changes
3. **Global component:** Drop into `src/core/components/MyComponent.vue`, auto-imported and typed
4. **Locale-aware data:** Store locale in `useI18n().locale.value`, watch for changes if caching

### Legacy code and gradual migration

**Two-directory situation:** Some routes import from `src/views/` (e.g., Home.vue, contact.vue, privacy.vue) while new routes use `src/pages/`. Both are functional; prefer migrating to `src/pages/**` for new routes to enable auto-component registration and follow the Nuxt-like convention.

**Migration path:** When refactoring legacy views, move the `.vue` file to `src/pages/`, update the import in `src/router/routes.ts` from `import` to dynamic `() => import()`, and ensure `meta.titleKey` is set. Legacy files in `src/views/quran/` (e.g., `[...lok].vue`) are unused; safe to remove once `src/pages/quran/` routes are stable.

### Linting and type-checking

ESLint (flat config, `eslint.config.js` is active; ignore `.mjs` variant) with Prettier. Run `pnpm lint` and `pnpm typecheck` before commits.

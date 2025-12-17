## AI coding guide for this repo (PEACE2074)

This is a Vue 3 + TypeScript + Vite app using Quasar UI, Vue Router, Pinia, and vue-i18n. Use these notes to navigate the codebase and follow its actual patterns.

### Project shape and architecture

- Entry: `src/main.ts` wires Router, Pinia, i18n, FontAwesome, and Quasar (`registerQuasar`).
- Shell: `src/layouts/AppShell.vue` provides the Quasar layout (header/drawer/page/footer) and renders `<RouterView/>`.
- Routing: `src/router/routes.ts` exports route constants and meta. Document titles are computed from `meta.titleKey` via i18n in `main.ts` (router.afterEach and locale watch). Prefer setting `meta: { titleKey: 'pages.<x>.<y>' }` over hard-coded strings.
- Views/Pages: Primary pages live in `src/pages/**` (e.g., `quran/index.vue`, `quran/[id].vue`, `tasbeeh.vue`) and some in `src/views/**` (e.g., `Home.vue`). Dynamic routes use Nuxt-like conventions (`[id].vue`).
- Components: Shared UI in `src/core/components/**` (auto-registered via unplugin-vue-components + `QuasarResolver`).
- State: `src/plugins/pinia` creates the Pinia instance; individual stores live in `src/stores/**`.
- i18n: Locales under `src/locale/{en,ar,de,ru}.json`, exported via `src/locale/index.ts`; configured in `src/i18n.ts` (default `en`).

### Data and APIs (Quran modules)

- Use `src/composables/useQ2P.ts` to access Quran data. It prefers HTTP endpoints `/api/quran` and `/api/quran/:id`; on failure, it falls back to bundled data in `src/shared/data/quran.json` and `src/shared/data/chapters/*.json`.
- When building new Quran features, reuse `useQ2P.init(index, locale)` and its computed getters `GetQ` and `GetSura`. Update or extend local data in `src/shared/data/**` if no API is available.

### Auto-imports, aliases, and UI

- Auto components: `vite.config.ts` registers components from `src/core/components` and `src/modules/**/components` and resolves Quasar components automatically.
- Auto imports: `unplugin-auto-import` adds `vue`, `vue-router`, and `pinia`, and scans `src/modules/**/composables` and `src/modules/**/store`. Type stubs are emitted to `src/types/{auto-imports,components}.d.ts`.
- Aliases: use `@` and `~` for `src`, and `@shared` for `src/shared`. Prefer alias imports over long relative paths.

### Build, dev, and tests

- Node: requires 22.12+ (enforced by `predev`). Package manager: pnpm.
- Dev server: Vite on port 3000 (`vite.config.ts: server.port = 3000`).
- Scripts: `dev`, `build`, `preview`, `lint`, `typecheck` (see `package.json`).
- E2E: Playwright reads tests from `tests/` (`playwright.config.ts`) and auto-starts the dev server with `pnpm run dev` at `http://localhost:3000`.
  - Current test `tests/e2e.spec.ts` expects a "Read Quran" CTA on home and list items with `.sura-card` on the Quran page. If you change selectors in `src/pages/quran/index.vue`, update the test accordingly (or add `.sura-card` to list items).
- Unit tests: `vitest.config.ts` points to `test/**` (singular). No unit tests are present by default; add files under `test/` if you create unit tests.

### Quasar usage

- Quasar is globally registered in `src/plugins/quasar.ts` with `Notify` plugin enabled; import `useQuasar()` where needed. Global styles come from Quasar CSS and project SCSS in `src/styles/scss/**`.

### Practical examples and patterns

- Route with translated title: add `meta: { titleKey: 'pages.example.title' }` and a key in locale JSON; the document title updates automatically.
- Quran list/detail: follow `src/pages/quran/index.vue` and `src/pages/quran/[id].vue`—load via `useQ2P`, show loading/error, and notify via `$q.notify`.
- Component placement: drop shared components into `src/core/components` to enable auto-registration and typed imports.

### Linting/formatting

- ESLint flat config via `eslint.config.js` (Vue + TS + Prettier). Run `pnpm lint` and `pnpm typecheck`. The alternative `eslint.config.mjs` (antfu) exists but is not the active setup.

### Quick references

- Entry/layout: `src/main.ts`, `src/layouts/AppShell.vue`
- Routing: `src/router/routes.ts`
- Data: `src/composables/useQ2P.ts`, `src/shared/data/**`
- i18n: `src/i18n.ts`, `src/locale/**`
- Vite/plugins: `vite.config.ts`
- E2E: `tests/e2e.spec.ts`, `playwright.config.ts`

Keep documentation concrete: mirror existing patterns; if you introduce new files under `src/modules/**`, they benefit from the auto-import setup configured in Vite.

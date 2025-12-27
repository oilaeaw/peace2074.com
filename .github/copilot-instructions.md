# PEACE2074 AI Guide

## Stack & entrypoints

- Vue 3 + TS + Vite + Quasar front-end; start via `pnpm dev` (runs Vite on port 4000 + Nitro API on 3000). A `predev` gate enforces Node ≥22.12.
- Nitro API lives in `apps/nitro-api` (pure API, no SSR renderer). Direct start: `pnpm --filter nitro-api dev`; ports override with `PORT`.
- Tooling is `pnpm`-first: `pnpm lint`, `pnpm typecheck`, `pnpm exec playwright test`. Husky + lint-staged auto-format staged files.

## Architecture, routing & layout

- `src/main.ts` wires router, Pinia, i18n, Quasar, FontAwesome, and registers the PWA service worker. New globals belong here.
- Primary shell: `src/layouts/AppShell.vue` (Quasar `q-layout` with search, athan audio, locale picker). Extend nav inside this shell.
- Routing is typed via `unplugin-vue-router`; files in `src/views` define pages. `src/router/routes.ts` holds legacy route objects. Prefer `src/views` over `src/pages` for new screens.

## Data sources & stores

- Quran data is shared in `src/shared/data/chapters/*.json` + `src/shared/data/quran.json`; the API reads the same files. Preserve the `{ id, name, e_name, type, total_verses, ayat[] }` shape.
- Front-end surah loading: `src/stores/q2p.pinia.ts` hydrates the book and persists to `localStorage`; `src/composables/useQ2P.ts` tries Nitro `/quran/:id`, then Waelio `/api/quran?s=`, then bundled JSON.
- `.sura-card` markup in `src/views/quran/index.vue` is coupled to Playwright specs (`tests/e2e.spec.ts`) and `scripts/debug-e2e.mjs`; rename with care.

## API surface & DeepSeek

- Nitro routes: `/health`, `/quran` (list), `/quran/:id` (detail), `/deepseek` (chat proxy). See `apps/nitro-api/server/routes/*`.
- Runtime config expects `DEEPSEEK_API_KEY` (or `NITRO_DEEPSEEK_API_KEY`), optional `DEEPSEEK_BASE_URL`; errors if missing.
- Front-end helper `sendDeepSeekChat` in `src/stores/services/index.ts` targets Nitro using `https://api.waelio.com/api/quran` (or same-origin fallback). Keep payload validation.

## UI, styling & assets

- Quasar setup in `src/plugins/quasar.ts` (Notify + brand palette). Stick to `q-*` components and register extra plugins there.
- Auto-imports in `vite.config.ts` cover Vue/Pinia/router + modules under `src/modules/**`; avoid manual duplicates. Components auto-resolve with QuasarResolver.
- Global styles at `src/styles/scss`; component styles should use `<style scoped lang="scss">`. FontAwesome icons live in `src/plugins/font-awesome/index.ts` and expose the global `FontAwesomeIcon`.
- PWA config in `vite.config.ts`; add new static assets/manifests there so the service worker caches them.

## Internationalization & titles

- Locales at `src/locale/{en,ar,de,ru,he}.json`; add keys to all files before use. Mounted via `src/i18n.ts`.
- Routes need `meta.title` or `meta.titleKey`; `src/main.ts` recomputes `document.title` on route/locale changes. Default locale comes from `localStorage` `app-locale`, then browser prefs; AppShell header `q-select` switches.

## Dev workflows & safety

- `pnpm build` + `pnpm preview` validate PWA output; `pnpm typecheck` must stay green. Front/back should run together for API-dependent pages.
- Quran data edits must keep `tests/`, `playwright-report/`, and `public/data/` in sync to prevent selector/visual drift.
- Use alias imports (`@`, `~`, `@shared`) instead of deep relatives. Guard browser-only APIs (`localStorage`, `window`) for Nitro reuse.
- `.env` already exists with secrets—never echo real values; document placeholders only.

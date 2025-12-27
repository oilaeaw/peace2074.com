# PEACE2074 AI Guide

## Stack & entrypoints

- Vue 3 + TS + Vite + Quasar; run the UI via `pnpm dev` (port 4000) after the Node ≥22.12 check enforced by the `predev` script.
- Monorepo also ships a Nitro backend in `apps/nitro-api`; start it separately with `pnpm --filter nitro-api dev` (port 3000).
- `pnpm` is canonical. Use `pnpm lint`, `pnpm typecheck`, and `pnpm exec playwright test` before PRs; Husky + lint-staged auto-format staged files.

## Layout, routing & navigation

- `src/main.ts` wires router, Pinia, i18n, Quasar, FontAwesome, and service worker registration—add new globals here.
- The visible frame lives in `src/layouts/AppShell.vue` (Quasar `q-layout` with search, athan audio, locale selector); extend nav inside this shell.
- Route objects live in `src/router/routes.ts` while typed file-based routes live under `src/views`; keep filenames aligned for `unplugin-vue-router` helpers.
- Legacy `src/pages` files exist, but routeable screens should prefer `src/views` going forward.

## Data & Pinia flows

- Quran metadata comes from `@shared/data/chapters/*.json` plus verses in `@shared/data/quran.json`; keep the `{ id, name, e_name, type, total_verses, ayat[] }` shape intact.
- `src/stores/q2p.pinia.ts` hydrates the `Book` array, persists it via `localStorage`, and exposes `GetQ`/`GetSura`; guard browser APIs with `typeof window !== 'undefined'` when reusing logic.
- `src/composables/useQ2P.ts` fetches from Nitro `/quran/:id`, then Waelio `/api/quran?s=`, finally bundled JSON—extend this sequence when adding sources.
- `.sura-card` markup in `src/views/quran/index.vue` drives Playwright tests and `scripts/debug-e2e.mjs`; update selectors everywhere if you rename them.

## API & env

- Nitro routes `/quran`, `/quran/:id`, and `/deepseek` all read the shared JSON; edit schemas in one place and mirror them both sides.
- Frontend uses `VITE_QURAN_API_BASE` (see `.env`) to target the backend; never log real secrets and add new config as `VITE_*`.
- DeepSeek proxy needs `DEEPSEEK_API_KEY`; call it through `sendDeepSeekChat()` in `src/stores/services/index.ts`.
- `vite.config.ts` hosts the `vite-plugin-pwa` setup—register new static assets there so the service worker caches them.

## UI, styling & assets

- Quasar plugin (`src/plugins/quasar.ts`) registers Notify + brand palette; register additional Quasar plugins here and stick to `q-*` components.
- Auto-imports (see `vite.config.ts`) expose Vue/Pinia/router/Quasar APIs to components; avoid redundant manual imports unless missing.
- Global styles live in `src/styles/scss`; scope feature-specific rules inside each SFC with `<style scoped lang="scss">`.
- Font Awesome icons are declared in `src/plugins/font-awesome/index.ts`; add icons there and reuse the global `FontAwesomeIcon` component.

## Internationalization & document titles

- Locale JSON files live under `src/locale/{en,ar,de,ru,he}.json` and mount via `src/i18n.ts`; new keys must exist in every locale before use.
- Routes must define `meta.title` or `meta.titleKey`; `src/main.ts` recomputes `document.title` whenever route or locale changes.
- Initial locale resolves from the `app-locale` localStorage key, then browser preference; AppShell’s header `q-select` controls the switcher.

## Developer workflows & testing

- Run `pnpm dev` (UI) and `pnpm --filter nitro-api dev` (API) together—API-dependent screens hang without both.
- Use `node scripts/debug-e2e.mjs` after servers start to capture DOM dumps/screens for failing Playwright specs.
- `pnpm build` + `pnpm preview` validate the PWA/service worker path, while `pnpm typecheck` (vue-tsc) should stay green before merging.
- Quran data tweaks must keep `tests/`, `playwright-report/`, and `public/data/` in sync to avoid visual and selector regressions.

## Conventions & safety

- Stick to alias imports (`@`, `~`, `@shared`) from `tsconfig.json`/`vite.config.ts` to avoid brittle relative paths.
- Browser-only Pinia persistence needs guards (`typeof window !== 'undefined'`) to stay SSR-safe for Nitro reuse.
- `.env` already exists with sensitive values; never print real secrets and document placeholders instead.
- When adding routes, selectors, or locales, update both translation keys and Playwright tests in lockstep.

# PEACE2074 AI Guide

## Stack snapshot
- Vue 3 + TypeScript + Vite with Quasar UI, Pinia stores, vue-i18n, vue-router, and PWA via `vite-plugin-pwa` (see `vite.config.ts`).
- Node 22.12+ is enforced (`package.json` `predev`), and `pnpm` is the expected package manager (`pnpm-lock.yaml`).

## Layout & routing
- `src/main.ts` wires AppShell, router, Pinia, i18n, Quasar, FontAwesome, and service worker registration; keep new globals registered there.
- The visible frame lives in `src/layouts/AppShell.vue` (Quasar `q-layout`, search, athan audio, language selector). Extend navigation via this shell, not by patching individual pages.
- Canonical routes live in `src/router/routes.ts` using typed constants plus meta `title/titleKey` for localized document titles; update both route entry + translation key when adding pages.
- `unplugin-vue-router` also scans `src/views` to emit type-safe helpers (`useRoute('/quran/[id]')`). Keep filenames aligned with their paths so typing stays correct.

## State, data, and quran flows
- Quran data originates from `src/shared/data/chapters/en.json` + `src/shared/data/quran.json` accessed through the `@shared/*` alias defined in `tsconfig.json`/`vite.config.ts`.
- `src/stores/q2p.pinia.ts` hydrates a `Book` array on init, persists it to `localStorage`, and exposes getters (`GetQ`, `GetSura`) plus actions (`init`, `fetchSura`, `setLegend`). Always keep the `{ id, name, e_name, type, total_verses, ayat[] }` shape intact.
- Detail pages rely on the `src/composables/useQ2P.ts` helper, which attempts API fetches (Nitro `/quran/:id`, Waelio `/api/quran?s=`) before falling back to bundled JSON. When adding endpoints, extend the sequential fetch list.
- The e2e suite (`tests/e2e.spec.ts`) and debugging script (`scripts/debug-e2e.mjs`) look for `.sura-card` elements as defined in `src/views/quran/index.vue`; preserve that class or update the tests/scripts accordingly.

## API integration
- A lightweight Nitro service lives in `apps/nitro-api` with `/quran` and `/quran/:id` routes that read from the same shared JSON. Run it locally with `pnpm --filter nitro-api dev` (defaults to port 3334).
- Frontend defaults `VITE_QURAN_API_BASE` (see `.env`) to the Nitro port; keep this variable updated per environment and never commit real secrets.

## UI, styling, and assets
- Quasar is registered through `src/plugins/quasar.ts` with Notify + brand colors; use `q-*` components for layout or register additional Quasar plugins here.
- Auto-imports (configured in `vite.config.ts`) already provide Vue, router, Pinia APIs, and Quasar components in `src/core/components`; avoid redundant manual imports.
- Global SCSS lives in `src/styles/scss`, while view-specific styling typically sits in each SFC via `<style scoped lang="scss">`.
- Font Awesome icons are whitelisted in `src/plugins/font-awesome`; add icons there and consume the global `FontAwesomeIcon` component.

## Internationalization & meta
- Locale files sit under `src/locale/{en,ar,de,ru}.json` and are mounted in `src/i18n.ts`. Any new `meta.titleKey` must exist in all locale files (e.g., `pages.quran.title`).
- `src/main.ts` watches both route changes and locale changes to recompute `document.title`; ensure new routes include either `meta.title` or `meta.titleKey`.

## Developer workflows
- Primary commands: `pnpm install`, `pnpm dev` (frontend on 3000), `pnpm build`, `pnpm preview`, `pnpm lint`, `pnpm typecheck`, `pnpm exec playwright test` (or `pnpm run test:e2e` if you add a script).
- For debugging e2e UIs, run `node scripts/debug-e2e.mjs` after starting the dev server(s) to capture screenshots and DOM dumps.
- Service worker caching is enabled only in production builds; when adding new static assets ensure they are included in the PWA manifest/workbox patterns in `vite.config.ts`.

## Conventions & gotchas
- Respect the alias map (`@`, `~`, `@shared`) to avoid brittle relative paths.
- Pinia persistence depends on browser-only APIs; guard any store access in SSR contexts (e.g., Nitro) with `typeof window !== 'undefined'` as seen in the store definitions.
- `.env` already exists with many secrets—never print or check them into logs; introduce new frontend config via `VITE_*` keys only.
- Keep `tests/`, `playwright-report/`, and `public/data/` in sync when tweaking Quran presentation to avoid regressions across automated + visual checks.

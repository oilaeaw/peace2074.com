# PEACE2074 AI Guide

## What this project is
- Vue 3 + TS + Vite + Quasar SPA (port 4000) with a Nitro API (port 3000) sharing Quran data. `pnpm dev` runs both via `concurrently`; `predev` enforces Node ≥22.12.
- Source aliases: `@`, `~`, `@shared` (see `tsconfig.json`). Prefer these over deep relatives.

## Run, test, verify
- Dev: `pnpm dev` (both) or `pnpm --filter nitro-api dev` (API only). Ports override with `PORT` for Nitro, `--port` for Vite.
- Quality gates: `pnpm lint`, `pnpm typecheck`, `pnpm build` + `pnpm preview`. E2E: `pnpm exec playwright test`; `scripts/debug-e2e.mjs` depends on `.sura-card` selectors.
- Locales sync: `pnpm check:locales` ensures every key exists across `src/locale/{en,ar,de,ru,he}.json` before shipping.

## Front-end patterns that matter
- Entry wiring lives in `src/main.ts`: router, Pinia, i18n, Quasar (`registerQuasar`), FontAwesome, PWA SW (`virtual:pwa-register`). Document titles come from route `meta.title|titleKey`; RTL applied when locale is `ar|he`.
- Global shell is `src/layouts/AppShell.vue` (search overlay via `useSiteSearch`, nav drawer with draggable/pinned items persisted to `localStorage`, Athan audio controls). Respect its CSS hooks (e.g., `.search`, `.sura-card`, `.arabic-text`) used by tests.
- Auto-imports/components via `unplugin-auto-import` and `unplugin-vue-components` with `QuasarResolver`; avoid manual imports for covered APIs. Additional components auto-resolve from `src/core/components` and `src/modules/**/components`.
- Routing: `unplugin-vue-router` scans `src/views` for typed routes (`src/types/typed-router.d.ts`), while `src/router/routes.ts` holds the current route table. Add new screens under `src/views` and keep `meta.titleKey` wired to locales.
- Quran data hydration: `src/stores/q2p.pinia.ts` loads chapters from bundled JSON, persists to `localStorage` (`q2p-store`), and `fetchSura` tries Nitro `/quran/:id` → Waelio `/api/quran?s=` → bundled data. `src/composables/useQ2P.ts` mirrors this fallback chain for composable use.

## API surface (apps/nitro-api)
- Routes: `/health`, `/quran` (list), `/quran/:id` (detail with `ayat`), `/deepseek` (proxy), `/contact` (SMTP). Data is read from `src/shared/data/chapters/en.json` + `src/shared/data/quran.json`; keep `{ id, name, e_name, type, total_verses, ayat[] }` stable.
- DeepSeek proxy (`deepseek.post.ts`) requires **both** `DEEPSEEK_API_KEY` (or `NITRO_DEEPSEEK_API_KEY`, camelCase variants) **and** `DEEPSEEK_BASE_URL`; missing either returns 500. CORS is opened via `server/utils/cors.ts`.
- Contact form (`contact.post.ts`) needs SMTP env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`/`CONTACT_TO`; rejects when absent.

## Client ↔ API integration
- `src/stores/services/index.ts` computes a Nitro base (`VITE_NITRO_BASE` override → localhost:3000 in dev → same-origin in prod) for `sendDeepSeekChat` and `sendContactMessage`. Keep payload validation; returns JSON or throws with server error text.
- Bookmark helpers hit `/api/bookmarks` with `credentials: 'include'`.

## Styling, assets, PWA
- Quasar theme registered in `src/plugins/quasar.ts`; stick to `q-*` components. Global styles in `src/assets/app.scss` + `src/styles/scss/**`; component styles should stay `scoped` and `lang="scss"`.
- PWA config lives in `vite.config.ts` (`VitePWA`); new static assets/manifests should be added there to be cached. Build-time version exposed as `__APP_VERSION__` (used in `AppShell` footer).

## Safety & secrets
- `.env` exists with real secrets—never print them. For docs/templates use `.env.example`; client-side envs need `VITE_` prefix. Do not store secrets in `localStorage`/session/config stores.

# PEACE2074 — AI coding instructions

## Big picture

- Monorepo-style app: Vue 3 + TypeScript + Vite + Quasar UI at repo root, Nitro API in `apps/nitro-api`.
- Runtime is dual-server in dev: Vite on `:4000`, Nitro on `:3000`; `pnpm dev` starts both.
- Deploy target is Netlify; Nitro uses `preset: "netlify"` and API base handling differs dev vs build (`apps/nitro-api/nitro.config.ts`).
- Prefer path aliases from `vite.config.ts` / `tsconfig.json`: `@`, `~` -> `src`, `@shared` -> `src/shared`.

## Daily workflows that matter

- Node version is enforced: `>=22.12` (`package.json` `predev`).
- Main checks: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm preview`.
- E2E uses Playwright (`playwright.config.ts`) with `baseURL` default `http://localhost:4000` and `webServer.command = pnpm run dev`.
- Locale parity is CI-critical: run `pnpm check:locales` after any i18n key edits.

## Frontend conventions (project-specific)

- Route titles are driven by route meta + i18n in `src/main.ts` (`meta.titleKey` preferred). Add a `titleKey` for new routes in `src/router/routes.ts`.
- RTL direction is applied in `src/main.ts` for `ar` and `he`; locale persistence key is `app-locale`.
- Keep E2E selectors stable unless tests are updated: `.search`, `.sura-card`, `.arabic-text` (see `tests/e2e.spec.ts`).
- Quasar is the UI baseline (`src/plugins/quasar.ts`); use `q-*` components and scoped SCSS in SFCs.
- Auto-imports are enabled (`vite.config.ts`), so many Vue/Pinia/Vue Router APIs are intentionally used without explicit imports.

## Data and integration patterns

- Quran data path: store `src/stores/q2p.pinia.ts` lazy-loads bundled JSON, then `fetchSura()` tries API sources/fallbacks.
- Service layer lives in `src/stores/services/index.ts`; it computes Nitro base from `VITE_NITRO_BASE` (dev override) and same-origin `/api` in prod.
- Auth/session is cookie-based, not JWT: `apps/nitro-api/server/utils/auth.ts` signs `waelio_session` with HMAC.
- Auth-required client requests must send `credentials: 'include'` (bookmarks/auth flows).

## API and env requirements

- DeepSeek endpoint: `apps/nitro-api/server/routes/deepseek.post.ts` requires both `DEEPSEEK_API_KEY` (or `NITRO_DEEPSEEK_API_KEY`) and `DEEPSEEK_BASE_URL`.
- Contact endpoint: `apps/nitro-api/server/routes/contact.post.ts` expects SMTP vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_TO`).
- Keep Quran response shape stable for UI consumers: `{ id, name, e_name, type, total_verses, ayat[] }`.

## Storage + i18n caveats

- Prefer `src/composables/useUStore.ts` and Pinia persist plugin (`src/plugins/pinia/ustore-plugin.ts`) for new persistence work.
- Legacy direct `localStorage` usage exists (for layout/preferences in `src/layouts/AppShell.vue` and locale bootstrap in `src/main.ts`); preserve existing keys/behavior when refactoring.
- When adding UI copy, update all locale files in `src/locale/{en,ar,de,ru,he}.json`.

## Safety

- Never commit or print secrets from `.env`; use `.env.example` patterns.
- Browser storage is not a secure secret store; avoid placing credentials there.

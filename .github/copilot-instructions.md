# PEACE2074 AI Guide

## Architecture overview

- **Dual-server setup**: Vue 3 + TS + Vite + Quasar SPA (port 4000) with separate Nitro API (port 3000). `pnpm dev` runs both via `concurrently`; `predev` enforces Node ≥22.12.
- **Monorepo structure**: Front-end at root, API in `apps/nitro-api/`, shared types/data in `src/shared/`.
- **Source aliases**: `@`, `~` → `src/`; `@shared` → `src/shared/`. Always prefer aliases over relative paths (see `tsconfig.json` paths).
- **Deployment**: Vite build outputs static site; Nitro builds serverless functions for Netlify (`preset: "netlify"`).

## Run, test, verify

- **Dev modes**: `pnpm dev` (both servers) or `pnpm --filter nitro-api dev` (API only). Override ports: `PORT=3001` for Nitro, `--port 4001` for Vite.
- **Quality gates**: `pnpm lint` (ESLint), `pnpm typecheck` (vue-tsc), `pnpm build` + `pnpm preview` (production simulation).
- **E2E testing**: `pnpm exec playwright test` targets `http://localhost:4000`. Config in `playwright.config.ts` assumes dev server running. Tests depend on stable selectors like `.sura-card`, `.arabic-text`, `.search`.
- **Locale validation**: `pnpm check:locales` ensures key parity across `src/locale/{en,ar,de,ru,he}.json`. Run before commits affecting i18n. Script uses TypeScript (`--experimental-strip-types`).

## Front-end patterns that matter

- **Entry wiring** (`src/main.ts`): Registers router, Pinia, vue-i18n, Quasar (`registerQuasar`), FontAwesome, PWA service worker (`virtual:pwa-register`). Initializes locale from `localStorage` → browser prefs → fallback `en`. RTL applied when locale is `ar|he`.
- **Document titles**: Route `meta.title` or `meta.titleKey` (i18n) → `updateTitleForRoute()` in `main.ts`. Always add `titleKey` to new routes pointing to locale keys.
- **Global shell** (`src/layouts/AppShell.vue`): Houses site search overlay (via `useSiteSearch`), nav drawer (draggable/pinned items persisted to `localStorage`), Athan audio controls. CSS hooks like `.search`, `.sura-card`, `.arabic-text` are used by E2E tests—don't rename without updating `tests/e2e.spec.ts`.
- **Auto-imports**: `unplugin-auto-import` covers Vue, VueRouter, Pinia APIs—no manual imports needed. `unplugin-vue-components` with `QuasarResolver` auto-imports Quasar components. Additional directories: `src/core/components`, `src/modules/**/components` (see `vite.config.ts`).
- **Routing**: `unplugin-vue-router` scans `src/views` for file-based routes, generates types in `src/types/typed-router.d.ts`. Manual route table in `src/router/routes.ts` for explicit control. Add new pages under `src/views/` or extend `routes.ts`.
- **Quran data flow**: `src/stores/q2p.pinia.ts` lazy-loads chapters from bundled JSON (`src/shared/data/chapters/en.json` + `src/shared/data/quran.json`), persists to `localStorage` key `q2p-store`. `fetchSura()` tries: Nitro `/quran/:id` → fallback Waelio API → bundled data. Composable `src/composables/useQ2P.ts` mirrors this chain for non-store usage.
- **Storage management**: All client-side storage uses `@waelio/ustore` via `src/composables/useUStore.ts`. Provides unified API for localStorage, sessionStorage, memoryStorage with optional encryption, namespacing, and Vue 3 reactivity. Pinia stores support auto-persistence via `persist` option (see `src/plugins/pinia/ustore-plugin.ts`). Never use native `localStorage` directly—use `useUStore()` composable or Pinia persistence. See `docs/USTORE_IMPLEMENTATION.md` for complete guide.

## API surface (apps/nitro-api)

- **Routes**: `/health` (uptime), `/quran` (list), `/quran/:id` (detail with `ayat`), `/deepseek` (AI proxy), `/contact` (SMTP). File-based routing in `server/routes/`.
- **Data schema**: Quran endpoints return `{ id, name, e_name, type, total_verses, ayat[] }`. Keep stable; UI relies on these keys.
- **DeepSeek integration** (`server/routes/deepseek.post.ts`): Requires **both** `DEEPSEEK_API_KEY` (or `NITRO_DEEPSEEK_API_KEY`) **and** `DEEPSEEK_BASE_URL`. Missing either → 500 error. Uses OpenAI SDK for chat completions. CORS enabled via `server/utils/cors.ts` (applies preflight headers).
- **Contact form** (`server/routes/contact.post.ts`): Needs SMTP env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_TO`. Missing vars reject requests.
- **Runtime config** (`nitro.config.ts`): Secrets auto-read from env vars prefixed `NITRO_` (e.g., `NITRO_DEEPSEEK_API_KEY`). CamelCase variants (e.g., `deepSeekApi`) also supported for backward compatibility.

## Authentication & authorization

- **Session mechanism** (`apps/nitro-api/server/utils/auth.ts`): HMAC-signed tokens (sha256) in httpOnly cookies (`waelio_session`, 7-day TTL). Payload: `{ id, role, name, exp }`. No JWT—lighter custom implementation with `crypto.timingSafeEqual()` for signature verification.
- **Login flow**: `POST /api/auth/login` verifies `AUTH_PASSCODE` env var, calls `createSession()` → sets cookie. `GET /api/auth/me` validates session via `readSession()`. Logout clears cookie + client-side storage (`localStorage` keys: `user`, `pinia_user`, `pinia`).
- **Client state** (`src/stores/auth.pinia.ts`): Pinia store wraps session. `isAuthenticated` computed from user object presence. On login, infers permissions from `user.role` (admin → MANAGE:ADMIN, editor → UPDATE:POST). Logout hits `/api/auth/logout` then purges local state.
- **CASL integration**: Singleton `ability` instance from `@casl/ability` (createMongoAbility). Store updates abilities via `ability.update(permissions)` after role changes. Actions: `READ|CREATE|UPDATE|DELETE|MANAGE`, subjects: `CATEGORY|POST|USER|ADMIN` (see `src/shared/types/core.d.ts`).
- **Protected routes**: Call `requireSecrets()` in handlers to enforce `AUTH_SECRET` + optionally `AUTH_PASSCODE`. Missing config → 500 error. Check session with `readSession(event)` → null if invalid/expired.
- **Credential passing**: All API calls needing auth must include `credentials: 'include'` (e.g., bookmarks, logout). Cookie auto-sent; no manual Authorization headers needed.

## Client ↔ API integration

- **Service layer** (`src/stores/services/index.ts`): Computes Nitro base URL from `VITE_NITRO_BASE` override → `localhost:3000` (dev) → same-origin (prod). Functions: `sendDeepSeekChat()`, `sendContactMessage()`, bookmark CRUD.
- **Bookmark API**: Hits `/api/bookmarks` with `credentials: 'include'` for cookie-based auth.
- **Error handling**: Service functions return JSON on success, throw with server error text on failure. No silent errors—always surface issues to UI.

## Styling, assets, PWA

- **Quasar theme**: Registered in `src/plugins/quasar.ts`. Use `q-*` components exclusively for UI consistency.
- **Global styles**: Entry point `src/assets/app.scss`. Additional partials in `src/styles/scss/**`. Component styles should be `<style scoped lang="scss">`.
- **PWA setup** (`vite.config.ts`): `VitePWA` plugin with `registerType: "autoUpdate"`. Caches static assets via Workbox. Add new assets to `manifest.icons` or `workbox.globPatterns` as needed.
- **Build-time variables**: `__APP_VERSION__` exposed from `package.json.version` (see `vite.config.ts` define). Used in `AppShell` footer.

## Safety & secrets

- **Never commit secrets**: `.env` contains real credentials—never print or expose them. Use `.env.example` for templates.
- **Client-side env vars**: Must be prefixed `VITE_` to be accessible in browser code. API keys without prefix stay server-only.
- **Secure storage**: Never store real secrets in `localStorage`/`sessionStorage`/config stores—even if "encrypted". Browser storage is inherently insecure.
- **Pre-push checklist**: Run `git status` to verify no `.env` or secrets-containing files are staged.

## Critical development patterns

- **i18n updates**: When adding UI text, always add keys to all locale files (`src/locale/{en,ar,de,ru,he}.json`). Run `pnpm check:locales` to verify sync.
- **Type safety**: Prefer typed Pinia stores over raw `localStorage`. Use `typed-router.d.ts` for route autocomplete.
- **Dependency management**: Use `pnpm` exclusively (not npm/yarn). Workspace filter syntax: `pnpm --filter nitro-api <cmd>`.
- **Code style**: Lint-staged enforces Prettier + ESLint on commit. Use `pnpm lint` to fix issues manually.
- **Debugging E2E**: If tests fail on selectors, check `scripts/debug-e2e.mjs` for selector dependencies. Update both test and script when changing component classes.

## Troubleshooting common issues

- **PWA service worker conflicts**: If seeing 404s for wrong paths (e.g., `/_nuxt/` or paths from other projects), unregister stale service workers. In DevTools → Application → Service Workers → Unregister, then hard refresh (Cmd+Shift+R). Clear site data in Application → Storage → Clear site data.
- **Port conflicts**: If Nitro fails to start on 3000 or Vite on 4000, check for processes: `lsof -ti:3000 | xargs kill -9`. Override with `PORT=3001` or `--port 4001`.
- **Build failures**: Run `pnpm typecheck` first to isolate TS errors. Check node version matches `>=22.12` (`.nvmrc` or `engines` in `package.json`). Clear `.vite` cache if seeing stale module errors.
- **Locale mismatches**: `pnpm check:locales` will fail CI if keys are out of sync. Add missing keys or remove extras before pushing.
- **API connection issues**: Verify Nitro is running on correct port (`http://localhost:3000/health` should return `{ status: 'ok' }`). Check CORS headers if calling from different origin.

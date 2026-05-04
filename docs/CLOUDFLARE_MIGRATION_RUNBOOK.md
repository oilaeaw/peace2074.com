# Cloudflare migration runbook

This project is safest to migrate in two pieces:

- Cloudflare Pages serves the static Vue/Vite frontend.
- Nitro API stays on a dedicated Node host (Railway, Fly.io, Render, etc.).
- Cloudflare Pages keeps the public contract stable by proxying same-origin `/api/*` requests to the Node host through `functions/api/[[catchall]].ts`.

That preserves the URLs already hardcoded into the mobile app and web app:

- `https://peace2074.com`
- `https://peace2074.com/api/*`

## Files added for the migration

- `functions/api/[[catchall]].ts` — Cloudflare Pages Function that proxies `/api/*` to `API_ORIGIN`.
- `public/_redirects` — SPA fallback for Cloudflare Pages so direct route visits still load the Vue app.
- `tests/deployment-smoke.spec.ts` — HTTP-level smoke checks for health, Quran, and changelog endpoints.
- `scripts/smoke-deployment.ts` — quick post-deploy verification script for staging/production.

## Environment matrix

### Cloudflare Pages

- `API_ORIGIN=https://<node-api-host>`
  - Use the backend origin without a trailing slash.
  - The Pages proxy preserves the incoming `/api/*` path.

### Node-hosted Nitro API

- `PUBLIC_URL=https://peace2074.com` (production)
- `PUBLIC_URL=https://staging.peace2074.com` (staging)
- `NITRO_APP_BASE_URL=/api`
- existing production secrets from `.env.example`

### Native app / Xcode Cloud

- `VITE_NITRO_BASE=https://peace2074.com/api` (production)
- `VITE_NITRO_BASE=https://staging.peace2074.com/api` (staging build)

## Build commands

- Frontend only: `pnpm build:frontend`
- Nitro API for standalone Node host: `pnpm build:node-api`
- Existing Netlify path: `pnpm build:netlify`

## Local verification

Run these before touching staging:

1. `pnpm typecheck`
2. `pnpm build:node-api`
3. `pnpm test:e2e`
4. Start the local app stack and run `pnpm test:smoke:deployment`

## Staging verification

After deploying Pages + the Node API to staging:

1. `SMOKE_BASE_URL=https://staging.peace2074.com pnpm test:smoke:deployment`
2. `BASE_URL=https://staging.peace2074.com pnpm test:e2e`
3. Manually confirm:
   - home page
   - Quran list and reader
   - login/logout
   - bookmarks
   - Quran progress
   - contact form
   - Apple / Google OAuth callbacks

## Cutover checklist

1. Deploy the Node API first.
2. Set `PUBLIC_URL` and `NITRO_APP_BASE_URL=/api` on the API host.
3. Set `API_ORIGIN` on Cloudflare Pages.
4. Deploy the frontend to Cloudflare Pages.
5. Run the smoke script and Playwright suite against staging.
6. Move the custom domain only after staging is green.
7. Keep Netlify available as rollback for at least a few days.

## Rollback

If anything looks wrong during cutover:

1. Re-point the custom domain back to the previous Netlify deployment.
2. Leave the Node API deployed so data and auth state stay intact.
3. Re-run the smoke checks against the restored production URL.
4. Fix staging before attempting cutover again.

## Cloudflare-specific operational notes

- Because `/api/*` becomes a Pages Function invocation path, production traffic should not rely on the free-tier daily cap.
- For App Review and production uptime, use a plan that removes or comfortably exceeds Pages Function limits.
- In the Pages dashboard, review fail-open/fail-closed behavior intentionally. For auth/API traffic, accidental fail-open can mask broken backend behavior.
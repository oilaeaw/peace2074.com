# Deploying peace2074.com

This guide covers deploying to Vercel (Hobby/Free) and Netlify (Free) with MongoDB Atlas Free (M0).

## TL;DR

- Database: Create a MongoDB Atlas M0 cluster and get `MONGODB_URI`.
- OAuth: In Google/GitHub consoles, add callback URLs for prod and previews.
- Environment: Configure env vars on your platform (Netlify or Vercel).
- Verify: Use `/api/auth/*/auth-url` and `/api/dev/oauth-logs` in dev to confirm flows.

---

## Vercel (Hobby/Free)

1) Import the repository in Vercel and link it to your GitHub repo.

2) Set environment variables in Vercel Project Settings → Environment Variables:

- Required
  - `MONGODB_URI`
  - `JWT_SECRET` or `NUXT_SESSION_PASSWORD` (≥ 32 chars)
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- Optional
  - `GOOGLE_CALLBACK_URL`, `GITHUB_CALLBACK_URL` (otherwise auto-derived from host/proto)
  - `SITE_BASE_URL` (e.g., https://peace2074.com)
  - `SESSION_COOKIE_DOMAIN` only in production if you need apex/www cookie sharing (e.g., `.peace2074.com`)

3) Configure OAuth callback URLs in providers:

- Google:
  - Prod: `https://peace2074.com/api/auth/google/callback`
  - Preview (example): `https://<your-vercel-preview>.vercel.app/api/auth/google/callback`
- GitHub:
  - Prod: `https://peace2074.com/api/auth/github/callback`
  - Preview (example): `https://<your-vercel-preview>.vercel.app/api/auth/github/callback`

4) Headers and CSP

- `vercel.json` defines a CSP compatible with this app (no Trusted Types requirement).
- If you later enable Trusted Types, replace the permissive default policy in `app/plugins/trusted-types.client.ts` with a strict policy.

5) CI/CD with GitHub Actions (optional)

- We included `.github/workflows/deploy-vercel.yml` which uses Vercel CLI.
- Add repository secrets:
  - `VERCEL_TOKEN` (from Vercel → Account Settings → Tokens)
  - `VERCEL_ORG_ID` (Project → Settings → General → Team/Org)
  - `VERCEL_PROJECT_ID` (Project → Settings → General)
- The workflow deploys on push to `main`/`master` and can be triggered manually.

6) Verify after deployment

- Inspect the precise OAuth URLs:
  - `GET /api/auth/google/auth-url`
  - `GET /api/auth/github/auth-url`
- Test login flows:
  - `GET /api/auth/google`
  - `GET /api/auth/github`
- In non-prod builds, check audit logs:
  - `GET /api/dev/oauth-logs` → latest 20 entries (403 in production)

---

## Netlify (Free)

- Already configured via `netlify.toml`.
- Set environment variables in Netlify → Site Settings → Build & Deploy → Environment.
- OAuth callback URLs (similar to Vercel) must include both production and preview domains.
- CSP headers in `netlify.toml` avoid Trusted Types issues.

---

## Tips

- Do not set `SESSION_COOKIE_DOMAIN` on preview deployments (public-suffix domains will reject cookies with Domain).
- Mongo connection is guarded with retries; cold starts are handled.
- If a provider returns to the wrong domain, set explicit `*_CALLBACK_URL` envs.

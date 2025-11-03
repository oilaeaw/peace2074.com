# Changelog

All notable changes to this project will be documented in this file.

## 2025-11-03

- Fix: Avoid 500 on /api/_auth/session by bundling `iron-session` and `h3-session` in Nitro server (removed from external list).
- Feature: Add dev-only session debug endpoint at `/api/dev/debug-session` (disabled in production).
- Governance: Add `.github/CODEOWNERS` requiring review by @peace2074 for all paths.
- CI: Update `.github/workflows/ci.yml` to run lint, typecheck, build, and shared tests on push/PR for `main`/`master` using Node 20 and pnpm 10.19.0.
- Lint: Ignore `.netlify/**` in `eslint.config.js` to avoid linting generated artifacts.

## 2025-10-xx

- Session: Harden session cookie config (`SameSite=Lax`, `Secure` in production, optional `SESSION_COOKIE_DOMAIN`) and provide long fallback secret for `runtimeConfig.session.password`.
- Consent: Persist consent via 1-year first-party cookie and localStorage (unstorage driver) to prevent repeated prompts.
- Realtime: Remove/neutralize websockets (Socket.IO) per deployment platform constraints; client/server plugins no-op.
- Auth/OAuth: Stabilize Passport flows (Local/Google/GitHub), ensure absolute callback URLs and DB connection before queries.
- DB: Ensure Mongoose connection before model operations to avoid bufferCommands race errors.

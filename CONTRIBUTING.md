# Contributing and Change Policy

This repository powers a Nuxt 3 + Nitro SSR app deployed to Netlify. To protect production and avoid surprises, all changes must follow this policy.

## Principles
- Respect the architecture documented in `.github/copilot-instructions.md`.
- Prefer file-based Nitro routes under `server/api/*`. The Express router is mounted at `/_express` only—avoid overlap.
- Keep changes minimal, reversible, and reviewed. Prefer PRs with small diffs.
- Run quality gates: build, lint/typecheck, and tests must pass before merge.

## Required workflow
1. Open a PR from a feature branch. No direct pushes to `one` or default branches.
2. The PR must:
   - Describe the problem, the solution, and affected areas (files, routes).
   - Include a quick test plan (manual steps or unit tests if possible).
   - Pass CI (lint, typecheck, build, tests).
3. Get approval from a CODEOWNER before merging.

## Copilot Change Protocol
If you use an automated assistant:
- Never make sweeping or unrelated edits in a single PR.
- Always write a short “What changed and why” section in the PR description.
- Prefer safe defaults and feature flags/env vars for behavior changes.
- Add temporary debug endpoints under `server/api/dev/*` and return 404 in production.

## Commands
- Install and start dev: `pnpm install` then `pnpm dev`
- Quality checks:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm -s build`
  - `pnpm test` or `pnpm test:run`

## Notes
- Cookies and sessions: use `nuxt-auth-utils` (iron-session). In production, set `SESSION_COOKIE_DOMAIN` to share across apex and www. Avoid setting on public suffix hosts (e.g., Netlify previews).
- Realtime: WebSockets are disabled for the current platform. Client plugin is a no-op; do not reintroduce WS without a deployment plan.

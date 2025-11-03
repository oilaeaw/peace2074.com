# peace2074.com

A Nuxt 3 website to share faith-driven knowledge: Qur'an, Allah’s Beautiful Names, remembrance (tasbeeh), and peaceful guidance.

## Why this website exists

To spread authentic, peace-centered religious knowledge online — easy to access, multilingual, fast, and ad‑free.

## What you’ll find here

- Qur'an reader and chapters
- Allah’s Beautiful Names (Asma’ul Husna)
- Tasbeeh counter for daily remembrance
- Miracles and reflections
- Multilingual UI (English, Arabic, German, Russian)
- Installable PWA with offline support
- Privacy and Terms pages

## Principles

- Accuracy and respect for the tradition
- Accessibility and clarity for all audiences
- No ads, tracking kept to a minimum
- Open to community feedback and improvement

## Tech stack (brief)

- Nuxt 3 + Vite (SSR, file-based routes)
- Nitro server with file-based APIs under `server/api/*`
- Pinia for state (persisted)
- UnoCSS + Quasar UI
- i18n and PWA
- Shared data under `shared/data/*` (usable on client and server)

See `.github/copilot-instructions.md` for architecture and developer workflow details.

## Getting started (local)

1) Install dependencies
	- `pnpm install`
2) Start the dev server
	- `pnpm dev`

Environment tips:
- Set `SITE_BASE_URL` for correct canonical links and PWA behavior.
- For auth-related endpoints (optional), see envs in the docs and `server/plugins/passport.ts`.

### Google OAuth: capture and verify the auth URL

- Endpoint to inspect the exact Google OAuth URL this server would use for the current host:
	- `GET /api/auth/google/auth-url` → returns `{ url, callbackURL, clientId }`
- Callback diagnostics: the handler logs the full incoming callback URL so you can compare it with Google’s redirect.
- Local example output matches Google’s link format:
	- `https://accounts.google.com/o/oauth2/v2/auth?...&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fgoogle%2Fcallback&scope=openid+email+profile&client_id=...`
- Required envs (set in your shell or Netlify):
	- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, optional `GOOGLE_CALLBACK_URL`
	- If `GOOGLE_CALLBACK_URL` is not set, it’s derived from the current host/proto.

### GitHub OAuth: capture and verify the auth URL

- Endpoint to inspect the exact GitHub OAuth URL this server would use for the current host:
	- `GET /api/auth/github/auth-url` → returns `{ url, callbackURL, clientId }`
- Start the flow (normal):
	- `GET /api/auth/github`
- Callback is handled at:
	- `/api/auth/github/callback` and is persisted to the `OAuthLog` collection
- Required envs (set in your shell or Netlify):
	- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, optional `GITHUB_CALLBACK_URL`
	- If `GITHUB_CALLBACK_URL` is not set, it’s derived from the current host/proto.

### Inspect recent OAuth logs (dev only)

- `GET /api/dev/oauth-logs` → returns latest 20 OAuth log entries with provider, direction, URL, and outcome.
- Returns 403 in production.

### Websockets in dev

Two supported modes (configure via `.env`):

- Nitro-attached (default):
	- `NUXT_SOCKET_ATTACH=true`
	- `NUXT_PUBLIC_SOCKET_ENABLED=true`
	- `NUXT_PUBLIC_SOCKET_URL=` (empty → same-origin)
	- `NUXT_PUBLIC_SOCKET_PATH=/_socket.io`
	- Visit `/chat` in two tabs to test. `GET /api/socket-status` shows socketEnabled: true.

- Standalone (opt-in):
	- `WS_STANDALONE=true`, `SOCKET_PORT=3001`
	- `NUXT_SOCKET_ATTACH=false`
	- `NUXT_PUBLIC_SOCKET_ENABLED=true`
	- `NUXT_PUBLIC_SOCKET_URL=http://localhost:3001`
	- `NUXT_PUBLIC_SOCKET_PATH=/socket.io`
	- Status endpoint reflects Nitro only (will show false in this mode).

## Contributing

Issues and pull requests are welcome. Please keep changes respectful, focused, and aligned with the project’s purpose: sharing peaceful, authentic knowledge.

## Acknowledgements

Created by peace2074. Assisted by GitHub Copilot.

## License

MIT — see `LICENSE`.

# Vue 3 + TypeScript + Vite

## ⚠️ Secrets & environment

- Never commit real credentials. Use `.env.example` as the template; keep actual values in local env files and CI/hosting secrets.
- Front-end env vars must be prefixed `VITE_`. Key values for this app:
  - `KIMI_API_KEY` (or `NITRO_KIMI_API_KEY`) and optional `KIMI_BASE_URL`
- Client-side storage (local/session/config) is not secure—don’t store real secrets there, even if “encrypted.”
- Before pushing, verify `git status` shows no `.env` or secrets-containing files staged.

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Common scripts

- `pnpm dev` — front-end + Nitro API together
- `pnpm --filter nitro-api dev` — API only
- `pnpm build` / `pnpm preview`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm check:locales` — ensures all locale files stay in sync
- `pnpm mobile:sync` — build web app + sync Capacitor native projects
- `pnpm mobile:android` — build, sync, and open Android Studio project
- `pnpm mobile:ios` — build, sync, and open Xcode project

## Mobile app (Capacitor)

This repository can run as a native mobile app without rewriting the Vue + Quasar UI.

1. Ensure `.env` contains `VITE_NITRO_BASE=https://peace2074.com/api` (or your own API base).
2. Run `pnpm mobile:sync`.
3. Run `pnpm mobile:android` or `pnpm mobile:ios`.

Notes:

- Capacitor config is in `capacitor.config.ts`.
- In mobile runtime (`capacitor:`), API calls use `VITE_NITRO_BASE` (or fallback to `https://peace2074.com/api`).

### iOS distribution

- App Store listing: `https://apps.apple.com/app/id6761300696`
- The App Store page becomes publicly installable once Apple approves and releases the listing.
- The web homepage includes an iOS App Store button for quick access to the native app listing.

## Deployment to Cloudflare

This project is configured for deployment to Cloudflare. See:

- [CLOUDFLARE_ENV.md](./CLOUDFLARE_ENV.md) for environment variable setup
- [DISABLE_LEGACY_PRERENDERING.md](./DISABLE_LEGACY_PRERENDERING.md) for instructions on disabling legacy prerendering (required action)

## Kimi integration

The Nitro API now exposes `POST /kimi`, which proxies chat-completion requests to Kimi via the OpenAI SDK.

1. Add `KIMI_API_KEY=<your key>` (and optionally `KIMI_BASE_URL`). CamelCase keys (`deepSeekApi`, `deepSeekBaseUrl`) still work for backward compatibility.
2. Start the backend: `pnpm --filter nitro-api dev` (defaults to `http://127.0.0.1:3000`).
3. Front-end code can call `sendKimiChat({ messages: [...] })` from `src/stores/services/index.ts`. The helper targets the Nitro base from same-origin (dev: http://127.0.0.1:3000) without needing a `VITE_` env.

Example payload:

```ts
await sendKimiChat({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Provide a short reflection on patience.' },
  ],
})
```

## Quran links, recitation, and bookmarks

- Verse deep links are supported in colon format:
  - `/quran/2:255` (example: Ayat al-Kursi)
  - The app normalizes this to the Quran detail view and jumps to the correct ayah.
- Bookmark menu items now support share/copy behavior for verse links in the same format.
- Audio recitation uses an intro flow that plays a Bismillah clip (same reciter source) before manual recitation starts (play, bookmark jump, quick access, and restart actions).
- Bookmark persistence behavior:
  - Guest bookmarks are saved locally.
  - When authenticated session-backed bookmarks are available, guest bookmarks are automatically synced to the account set (deduplicated).

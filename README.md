<p align="center">
<img src="https://user-images.githubusercontent.com/11247099/140462375-7b7ac4db-35b7-453c-8a05-13d8d20282c4.png" width="600"/>
</p>

<h2 align="center">
<a href="https://github.com/antfu/vitesse">Vitesse</a> for Nuxt 3
</h2><br>

<p align="center">
<br>
<a href="https://vitesse-nuxt3.netlify.app/">🖥 Online Preview</a>
<br><br>
<a href="https://stackblitz.com/github/antfu/vitesse-nuxt"><img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt=""></a>
</p>
[![Netlify Status](https://api.netlify.com/api/v1/badges/07cec8d0-adce-4c33-8136-ea8f423036eb/deploy-status)](https://app.netlify.com/projects/peace2074/deploys)
## Features

- 💚 [Nuxt 3](https://nuxt.com/) - SSR, ESR, File-based routing, components auto importing, modules, etc.

- ⚡️ Vite - Instant HMR.

- 🎨 [UnoCSS](https://github.com/unocss/unocss) - The instant on-demand atomic CSS engine.

- 😃 Use icons from any icon sets in Pure CSS, powered by [UnoCSS](https://github.com/unocss/unocss).

- 🔥 The `<script setup>` syntax.

- 🍍 [State Management via Pinia](https://github.com/vuejs/pinia), see [./app/composables/user.ts](./app/composables/user.ts).

- 📑 [Layout system](./app/layouts).

- 📥 APIs auto importing - for Composition API, VueUse and custom composables.

- 🏎 Zero-config cloud functions and deploy.

- 🦾 TypeScript, of course.

- 📲 [PWA](https://github.com/vite-pwa/nuxt) with offline support and auto-update behavior.

## Plugins

### Nuxt Modules

- [VueUse](https://github.com/vueuse/vueuse) - collection of useful composition APIs.
- [ColorMode](https://github.com/nuxt-modules/color-mode) - dark and Light mode with auto detection made easy with Nuxt.
- [UnoCSS](https://github.com/unocss/unocss) - the instant on-demand atomic CSS engine.
- [Pinia](https://github.com/vuejs/pinia) - intuitive, type safe, light and flexible Store for Vue.
- [VitePWA](https://github.com/vite-pwa/nuxt) - zero-config PWA Plugin for Nuxt 3.
- [DevTools](https://github.com/nuxt/devtools) - unleash Nuxt Developer Experience.

## IDE

We recommend using [VS Code](https://code.visualstudio.com/) with [Volar](https://github.com/johnsoncodehk/volar) to get the best experience (You might want to disable [Vetur](https://vuejs.github.io/vetur/) if you have it).

## Variations

- [vitesse](https://github.com/antfu/vitesse) - Opinionated Vite Starter Template
- [vitesse-lite](https://github.com/antfu/vitesse-lite) - Lightweight version of Vitesse
- [vitesse-nuxt-bridge](https://github.com/antfu/vitesse-nuxt-bridge) - Vitesse for Nuxt 2 with Bridge
- [vitesse-webext](https://github.com/antfu/vitesse-webext) - WebExtension Vite starter template

## Try it now!

### Online

<a href="https://stackblitz.com/github/antfu/vitesse-nuxt"><img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt=""></a>

### GitHub Template

[Create a repo from this template on GitHub](https://github.com/antfu/vitesse-nuxt/generate).

### Clone to local

If you prefer to do it manually with the cleaner git history

```bash
npx degit antfu/vitesse-nuxt my-nuxt-app
cd my-nuxt-app
pnpm i # If you don't have pnpm installed, run: npm install -g pnpm
```

## Websockets (optional)

This project ships client-side socket support (`socket.io-client`) and is ready to integrate real-time features. To run a small optional Socket.IO server (separate process) for ad-hoc information or development, install the server package and run the script included in `scripts/`.

1. Install Socket.IO (server):

```bash
pnpm add socket.io
```

2. Start the optional socket server (default port 3001):

```bash
node scripts/socket-server.mjs
```

3. Client example (already available in the repo via `socket.io-client`):

```js
import { io } from 'socket.io-client'

const socket = io('http://localhost:3001')

socket.on('connect', () => {
	console.log('connected', socket.id)
})

socket.on('health', (payload) => console.log('health', payload))

// Emit an ad-hoc event to the server
socket.emit('client:event', { hello: 'world' })
```

Notes:
- The optional `scripts/socket-server.mjs` is intentionally a separate process to avoid coupling with the Nuxt/Nitro build process. This is low-risk for development and portable to production if you decide to run a dedicated realtime server.
- If you prefer to attach sockets to the Nuxt server directly, see `nuxt`/Nitro plugin approaches (requires adding `socket.io` as a server dependency and wiring it during server startup); open a follow-up and I can add a Nitro plugin that attaches to the built server.

## OAuth (Google & GitHub) setup

This project includes server-side OAuth handlers for GitHub and Google under `server/api/auth/*` and a passport plugin at `server/plugins/passport.ts`.

Quick setup:

1. Copy `.env.example` to `.env` and fill values for `GITHUB_CLIENT_ID`, `NUXT_GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Optionally set explicit `GITHUB_CALLBACK_URL` or `GOOGLE_CALLBACK_URL`.

2. Register the callback URLs with providers (examples):
	- GitHub OAuth App Authorization callback URL: `${SITE_BASE_URL}/api/auth/github/callback`
	- Google OAuth 2.0 Authorized redirect URI: `${SITE_BASE_URL}/api/auth/google/callback`

3. Run `pnpm dev` and visit `/auth/login` (or hit `/api/auth/github` or `/api/auth/google`) to start OAuth flows.

Note: The server derives callback URLs dynamically from incoming request headers if explicit callback env vars are not set. When deploying behind a proxy or on a different domain, prefer setting explicit `GITHUB_CALLBACK_URL` / `GOOGLE_CALLBACK_URL` in your environment and ensure the provider registration matches exactly.

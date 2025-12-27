# Vue 3 + TypeScript + Vite

## ⚠️ Secrets & environment

- Never commit real credentials. Use `.env.example` as the template; keep actual values in local env files and CI/hosting secrets.
- Front-end env vars must be prefixed `VITE_`. Key values for this app:
  - `DEEPSEEK_API_KEY` (or `NITRO_DEEPSEEK_API_KEY`) and optional `DEEPSEEK_BASE_URL`
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

## DeepSeek integration

The Nitro API now exposes `POST /deepseek`, which proxies chat-completion requests to DeepSeek via the OpenAI SDK.

1. Add `DEEPSEEK_API_KEY=<your key>` (and optionally `DEEPSEEK_BASE_URL`). CamelCase keys (`deepSeekApi`, `deepSeekBaseUrl`) still work for backward compatibility.
2. Start the backend: `pnpm --filter nitro-api dev` (defaults to `http://127.0.0.1:3000`).
3. Front-end code can call `sendDeepSeekChat({ messages: [...] })` from `src/stores/services/index.ts`. The helper targets the Nitro base from same-origin (dev: http://127.0.0.1:3000) without needing a `VITE_` env.

Example payload:

```ts
await sendDeepSeekChat({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Provide a short reflection on patience." },
  ],
});
```

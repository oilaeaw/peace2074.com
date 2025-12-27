# Vue 3 + TypeScript + Vite

## ⚠️ Secrets policy

- Never commit `.env` or real credentials. Use `.env.example` as the template and keep real values in local/CI env vars.
- If you touch new config, add placeholder keys to `.env.example` (prefix frontend vars with `VITE_`).
- Before pushing, run `git status` to ensure no `.env*` or secrets-containing files are staged.

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## DeepSeek integration

The Nitro API now exposes `POST /deepseek`, which proxies chat-completion requests to DeepSeek via the OpenAI SDK.

1. Add `DEEPSEEK_API_KEY=<your key>` (and optionally `DEEPSEEK_BASE_URL`). CamelCase keys (`deepSeekApi`, `deepSeekBaseUrl`) still work for backward compatibility.
2. Start the backend: `pnpm --filter nitro-api dev` (defaults to `http://localhost:3000`).
3. Front-end code can call `sendDeepSeekChat({ messages: [...] })` from `src/stores/services/index.ts`. The helper automatically targets the Nitro base defined via `VITE_QURAN_API_BASE`.

Example payload:

```ts
await sendDeepSeekChat({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Provide a short reflection on patience." },
  ],
});
```

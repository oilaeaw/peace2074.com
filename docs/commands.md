# Collaboration Commands & Rules

Last updated: 2025-11-14

This file captures the canonical commands and guardrails we follow every time we work together.

## Always ask before using the terminal
- Do not run any terminal command without explicit approval.
- Use a single dev terminal only; never start duplicates.

## Before starting development
1) Ensure port 3000 is free (macOS):

```bash
lsof -ti tcp:3000 | xargs kill -9 2>/dev/null || true
# If IPv6 listeners remain, diagnose:
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:24678 -sTCP:LISTEN
```

2) Start the dev server on port 3000:

```bash
pnpm dev -- --port 3000
```

3) Stop the dev server when done:

```bash
# In the same terminal
CTRL+C
```

## If Vite HMR port is stuck (optional)
- Free default HMR port 24678 if needed:

```bash
lsof -ti tcp:24678 | xargs kill -9 2>/dev/null || true
```

## PWA in development (only if approved)
- Use the PWA dev flag only with prior approval:

```bash
pnpm dev:pwa -- --port 3000
```

## Ground rules summary
- Ask before using the terminal.
- Free port 3000 first; then run a single `pnpm dev -- --port 3000`.
- Do not spawn multiple dev servers.
- Document any deviations here for future sessions.

---

## Docs quick links (Nuxt, Vite, Quasar)

- Nuxt 4 docs: https://nuxt.com/docs
- Nitro (Nuxt server) docs: https://nitro.build
- Vite docs: https://vitejs.dev/guide/
- Quasar docs: https://quasar.dev

### Nuxt essentials (our repo)
- Source directory is `app/` (set via `srcDir: 'app'` in `nuxt.config.ts`).
- Dev server: `pnpm dev -- --port 3000` (single terminal only).
- Route rules: Client-only for `/quran` and `/quran/**` (SSR disabled).
- PWA: `@vite-pwa/nuxt` in generateSW mode; dev PWA only with approval.
- i18n: `@nuxtjs/i18n` with locales under `app/locale/`.

### Vite tips
- HMR default port is 24678; if stuck, free it (see above).
- Aliases: `crypto` → `node:crypto` (configured in `nuxt.config.ts`).
- Optimize deps runs automatically; large assets may trigger chunk warnings (OK in dev).

### Quasar tips
- Styles included via `quasar/src/css/index.sass` and extras fonts (Material Icons, FA v6).
- QMediaPlayer styles are included; CDN stylesheet present as a backup.
- Prefer Quasar icon sets already configured; CSP allows Google Fonts/jsdelivr in production.

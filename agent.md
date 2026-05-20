# Project Agent Descriptor: peace2074.com

## Identity & Purpose

You are an autonomous AI coding agent assigned to **peace2074.com**. Your role is to help develop, maintain, and scale this project by generating code, implementing features, fixing bugs, and ensuring high-quality mobile and web experiences.

---

## Project Context & Architecture

- **Frontend**: Vue 3 + TypeScript + Vite + Quasar UI
- **Backend (API)**: Nitro API (`apps/nitro-api`) with Cloudflare preset
- **Mobile**: Capacitor (iOS + Android native wrappers)
- **Database**: Prisma + MongoDB Atlas (Fallback: Nitro KV storage)
- **i18n**: Multi-language support (English, Arabic [RTL], German, Russian, Hebrew [RTL], Turkish)

### Development Setup
- **Ports**: Frontend is served on `localhost:4000`, Nitro API is served on `localhost:3000`.
- **Start both**: `pnpm dev`
- **Path Aliases**:
  - `@` or `~` maps to `src/`
  - `@shared` maps to `src/shared/`

---

## Non-Negotiable Rules

1. **ALWAYS USE TYPESCRIPT - NEVER JAVASCRIPT**
   - All code, components, and scripts must be TypeScript. New files must use `.ts` or `.vue` (with `<script setup lang="ts">`).
2. **STAY FOCUSED & CONCISE**
   - Answer the question directly. Keep explanations short (maximum 2-3 sentences per paragraph).
3. **DO NOT USE PLACEHOLDERS**
   - Provide complete code blocks. When modifying a file, output the full file contents or complete drop-in replacement chunks. Never use shortcuts like `// ... rest of code`.
4. **RUN LINT & TYPECHECK VALIDATIONS**
   - Always validate changes using local checks before claiming completion:
     - TypeScript types: `pnpm typecheck`
     - Linter: `pnpm lint`
     - Locale parity check: `pnpm check:locales`
     - Production build: `pnpm build`

---

## Critical Code Patterns & Fixes

### 1. MongoDB Connection (DISABLE_PRISMA Fallback)
- MongoDB Atlas may timeout (510 errors).
- Environment variable `DISABLE_PRISMA=true` bypasses Prisma and uses Nitro KV fallback.
- **Check pattern in API routes**:
  ```typescript
  if (process.env.DISABLE_PRISMA === 'true') {
    // Use KV storage fallback
    return;
  }
  ```

### 2. Offline Audio Caching & Key Matching
- **API**: Browser CacheStorage API.
- **Cache Names**: `quran-audio-offline-regular-v1` and `quran-audio-offline-hiq-v1`.
- **Regex Match Rule (CRITICAL)**: Always match sura key using regex `/(\d{3})\d{3}\.mp3/` instead of string matching:
  ```typescript
  const paddedSura = String(suraId).padStart(3, '0');
  return keys.some((req) => {
    const match = req.url.match(/\/(\d{3})\d{3}\.mp3/);
    return match && match[1] === paddedSura;
  });
  ```

### 3. Version Display Logic
- **Source**: `__APP_VERSION__` from `package.json`.
- **Formatting Rule**: Display first 2 segments only (e.g. `3.0.0` -> `v3.0`).
  ```typescript
  const version = __APP_VERSION__.split('.').slice(0, 2).join('.'); // Returns "3.0"
  ```

### 4. Error Object Handling (Kimi API)
- The Kimi API returns errors as objects inside HTTP 200 responses.
- **Stringify/Extract Error Rule**:
  ```typescript
  const errorMessage =
    errPayload?.error?.message ||
    errPayload?.error?.data ||
    (typeof errPayload?.error === 'string' ? errPayload.error : null) ||
    errPayload?.statusMessage ||
    `Request failed`;
  throw new Error(errorMessage);
  ```

### 5. iOS Safe Areas
- Position elements carefully to avoid notches and home indicators.
  ```scss
  .my-component {
    bottom: calc(36px + env(safe-area-inset-bottom, 0px));
    padding: 0 max(16px, env(safe-area-inset-left, 0px)) 0 max(16px, env(safe-area-inset-right, 0px));
  }
  ```

### 6. i18n Requirements
- Every new UI copy key must be added to all 6 locale files (`src/locale/{en,ar,de,ru,he,tr}.json`).
- Run `pnpm check:locales` to ensure parity.

### 7. Service Layer Pattern
- All frontend API calls must flow through the service layer `src/stores/services/index.ts` rather than ad-hoc fetches.

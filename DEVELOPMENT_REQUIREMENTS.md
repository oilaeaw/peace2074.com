# Development Requirements & Conventions

> **CRITICAL**: Read this file FIRST before starting any development session on peace2074.com

---

## 🚨 Non-Negotiable Rules

### 1. **ALWAYS USE TYPESCRIPT - NEVER JAVASCRIPT**

- All code examples must be TypeScript
- All new files must use `.ts` or `.vue` (with `<script setup lang="ts">`)
- Never show JavaScript examples or syntax
- Type everything explicitly when ambiguous

### 2. **Stay Focused**

- Answer the question asked, don't veer off into unrelated topics
- Keep explanations concise and direct
- Only expand when explicitly requested

### 3. **Test Before Claiming Done**

- Always run `pnpm typecheck` after TypeScript changes
- Run `pnpm check:locales` after i18n changes
- Test builds with `pnpm build` for production-critical changes
- Never say "done" without validation

---

## 🏗️ Architecture Overview

### Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite + Quasar UI
- **Backend**: Nitro API (apps/nitro-api) with Cloudflare preset
- **Mobile**: Capacitor (iOS + Android native wrappers)
- **Data**: Prisma + MongoDB Atlas (fallback: Nitro KV)
- **i18n**: 6 languages (en, ar, de, ru, he, tr)

### Dual-Server Development

- **Vite dev server**: `localhost:4000` (frontend)
- **Nitro API**: `localhost:3000` (backend)
- **Start both**: `pnpm dev`

### Path Aliases (vite.config.ts + tsconfig.json)

```typescript
'@' → 'src/'
'~' → 'src/'
'@shared' → 'src/shared/'
```

---

## 🔧 Critical Patterns & Fixes

### MongoDB Connection (DISABLE_PRISMA Fallback)

- MongoDB Atlas may timeout (510 errors)
- **Environment variable**: `DISABLE_PRISMA=true` bypasses Prisma
- **Fallback storage**: Nitro KV for auth/sessions
- **Check in code** before attempting Prisma connection:

```typescript
if (process.env.DISABLE_PRISMA === 'true') {
  // Use KV storage fallback
  return
}
```

### Offline Audio Caching

- **API**: Browser CacheStorage API
- **URLs**: `https://everyayah.com/data/Alafasy_{64|128}kbps/SSSAAA.mp3`
  - `SSS` = 3-digit padded sura number (001-114)
  - `AAA` = 3-digit padded verse number (001-286)
- **Cache names**:
  - Regular quality: `quran-audio-offline-regular-v1` (32kbps, ~180MB)
  - HiQ quality: `quran-audio-offline-hiq-v1` (128kbps, ~720MB)

#### Cache Key Matching (CRITICAL)

**WRONG** ❌:

```typescript
const suraKey = `sura-${suraId}-`
return keys.some((req) => req.url.includes(suraKey))
```

**CORRECT** ✅:

```typescript
const paddedSura = String(suraId).padStart(3, '0')
return keys.some((req) => {
  const match = req.url.match(/\/(\d{3})\d{3}\.mp3/)
  return match && match[1] === paddedSura
})
```

### Version Display Logic

- **Source**: `__APP_VERSION__` from package.json (Vite define)
- **Display format**: First 2 segments only (3.0.0 → v3.0)

**WRONG** ❌:

```typescript
const version = __APP_VERSION__.split('.').slice(-2).join('.') // Last 2 segments = "0.0"
```

**CORRECT** ✅:

```typescript
const version = __APP_VERSION__.split('.').slice(0, 2).join('.') // First 2 segments = "3.0"
```

### Error Object Handling (Kimi API)

Kimi API returns errors in HTTP 200 responses as objects:

```typescript
{ error: { message: "402 Insufficient Balance", status: 402, data: "..." } }
```

**WRONG** ❌:

```typescript
throw new Error(errPayload?.error) // "[object Object]"
```

**CORRECT** ✅:

```typescript
const errorMessage =
  errPayload?.error?.message ||
  errPayload?.error?.data ||
  (typeof errPayload?.error === 'string' ? errPayload.error : null) ||
  errPayload?.statusMessage ||
  `Request failed (${res.status})`
throw new Error(errorMessage)
```

**Always check for error field** even on successful responses:

```typescript
const res = await sendKimiChat(messages)
if (res?.error) {
  const errorMsg = res.error.message || res.error.data || String(res.error)
  throw new Error(errorMsg)
}
```

### iOS Safe Areas

For elements that need to avoid home indicator and notches:

```scss
.my-component {
  // Bottom positioning with home indicator space
  bottom: calc(36px + env(safe-area-inset-bottom, 0px));

  // Horizontal padding for notched devices
  padding: 0 max(16px, env(safe-area-inset-left, 0px)) 0
    max(16px, env(safe-area-inset-right, 0px));
}
```

**Requires** viewport meta tag in index.html:

```html
<meta name="viewport" content="... viewport-fit=cover" />
```

---

## 📱 iOS Development Workflow

### Version Updates

When changing version in package.json:

1. Update **both** `package.json` files (root + `apps/nitro-api/`)
2. Update iOS: `ios/App/App.xcodeproj/project.pbxproj` → `MARKETING_VERSION`
3. Update CHANGELOG.md
4. Rebuild: `pnpm build`
5. Sync: `npx cap sync ios`
6. Clean + rebuild in Xcode (Shift+Cmd+K, then Cmd+R)

### Xcode Auto-Generated Files

**DO NOT** commit:

- `ios/App/App.xcworkspace/xcuserdata/`
- `*.xcuserstate` files

Add to `.gitignore` if not already present.

---

## 🌍 i18n Requirements

### Locale Files

All UI copy must exist in ALL 6 locale files:

- `src/locale/en.json` (English)
- `src/locale/ar.json` (Arabic) - RTL
- `src/locale/de.json` (German)
- `src/locale/ru.json` (Russian)
- `src/locale/he.json` (Hebrew) - RTL
- `src/locale/tr.json` (Turkish)

### Adding New Keys

1. Add key to **all 6 files** in same nested location
2. Use clear, semantic key names: `pages.settings.audioQuality`
3. Run parity check: `pnpm check:locales`
4. Fix any missing/extra keys before committing

### RTL Languages (ar, he)

- Direction set automatically in `src/main.ts`
- Quasar handles most RTL layout
- Test banner/modal positioning manually on RTL locales

---

## 🔐 Environment Variables & Secrets

### Required for Full Functionality

- `KIMI_API_KEY` or `NITRO_KIMI_API_KEY` - AI chat feature
- `KIMI_BASE_URL` - API endpoint
- `MONGODB_URL` - Database (fallback: KV storage)
- SMTP vars for contact form:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
  - `SMTP_FROM`, `CONTACT_TO`

### OAuth Authentication (Google & Apple)

**Google OAuth:**

- `GOOGLE_CLIENT_ID` - Google Cloud Console OAuth 2.0 Client ID
- `GOOGLE_CLIENT_SECRET` - Google Cloud Console OAuth 2.0 Client Secret
- `GOOGLE_REDIRECT_URI` - Callback URL (default: `{PUBLIC_URL}/api/auth/google/callback`)

**Apple OAuth:**

- `APPLE_CLIENT_ID` - Apple Developer Services ID
- `APPLE_TEAM_ID` - Apple Team ID (10-character string)
- `APPLE_KEY_ID` - Apple Sign In key ID
- `APPLE_PRIVATE_KEY` - Apple Sign In private key (.p8 file contents)
- `APPLE_REDIRECT_URI` - Callback URL (default: `{PUBLIC_URL}/api/auth/apple/callback`)

**General:**

- `PUBLIC_URL` - Your app's public URL (e.g., `https://peace2074.com`)

#### Setting up Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URIs: `https://peace2074.com/api/auth/google/callback`
6. Copy Client ID and Client Secret
7. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Cloudflare env vars

#### Setting up Apple Sign In:

1. Go to [Apple Developer](https://developer.apple.com/)
2. Create a Services ID (bundle identifier format)
3. Enable "Sign In with Apple"
4. Configure domains and redirect URLs
5. Create a Sign In with Apple key
6. Download the .p8 key file
7. Set `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, and `APPLE_PRIVATE_KEY` (full .p8 contents) in Cloudflare env vars

### Security Rules

- **NEVER** commit secrets to `.env` file
- Use `.env.example` for patterns only
- Store production secrets in Cloudflare dashboard
- **NEVER** log or print API keys in console/terminal

---

## 🧪 Validation Checklist

Before marking any task complete:

- [ ] TypeScript types validated: `pnpm typecheck`
- [ ] Locale parity checked: `pnpm check:locales`
- [ ] Lint passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] Changes tested in dev: `pnpm dev`
- [ ] iOS changes synced: `npx cap sync ios`
- [ ] Xcode rebuilt after web changes (if iOS-related)

---

## 🎯 Route Meta & Titles

All routes should have i18n title keys:

```typescript
// src/router/routes.ts
{
  path: '/settings',
  component: () => import('pages/settings.vue'),
  meta: {
    titleKey: 'pages.settings.title', // Use this
    requiresAuth: false
  }
}
```

Title handler in `src/main.ts` resolves `titleKey` from i18n.

---

## 📦 Service Layer Pattern

API calls go through `src/stores/services/index.ts`:

```typescript
// CORRECT: Use service layer
import { sendKimiChat } from '@/stores/services'

const response = await sendKimiChat(messages)

// Handle error objects from API
if (response?.error) {
  const errorMsg = response.error.message || String(response.error)
  throw new Error(errorMsg)
}
```

Service layer handles:

- Dev vs prod base URL (`VITE_NITRO_BASE` or `/api`)
- Credentials: `'include'` for cookie auth
- Error normalization

---

## 🚀 Deployment (Cloudflare)

### Build Settings

- **Build command**: `pnpm build`
- **Publish dir**: `dist`
- **Functions dir**: Auto-detected (Nitro outputs)

### Nitro Config

- **Preset**: `cloudflare` in `apps/nitro-api/nitro.config.ts`
- **API base**: Dev overrides with `VITE_NITRO_BASE`, prod uses `/api`

### Required Cloudflare Env Vars

Set in Cloudflare dashboard (Settings → Environment variables):

- All vars from `.env.example`
- `DISABLE_PRISMA=true` (if MongoDB unreachable)
- Kimi API keys
- SMTP credentials

---

## 📝 Code Style Preferences

### TypeScript

- **Explicit types** for function parameters and returns
- Use `interface` for object shapes, `type` for unions
- Prefer `const` over `let`
- Use optional chaining: `obj?.prop?.nested`

### Vue 3 Composition API

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'

interface MyData {
  id: number
  name: string
}

const data: Ref<MyData[]> = ref([])
const filteredData = computed(() => data.value.filter(/* ... */))

onMounted(() => {
  // Lifecycle logic
})
</script>
```

### Composables

- File: `src/composables/useFoo.ts`
- Export function: `export function useFoo() { ... }`
- Return object with methods/refs: `return { data, fetch, clear }`

---

## 🐛 Known Issues & Workarounds

### MongoDB Connection Timeouts

**Symptom**: 510 errors, authentication fails  
**Fix**: Set `DISABLE_PRISMA=true` environment variable

### Cache Not Persisting After Reload

**Symptom**: Downloaded suras show as not cached  
**Cause**: Incorrect URL pattern matching  
**Fix**: Use regex `/(\d{3})\d{3}\.mp3/` with padded sura comparison

### "[object Object]" in AI Responses

**Symptom**: Error messages show as "[object Object]"  
**Cause**: Kimi API returns error objects, not strings  
**Fix**: Extract message field: `error?.message || String(error)`

### iOS Version Shows Old Value After Update

**Symptom**: Footer shows v2.9 despite package.json = 3.0.0  
**Cause**: Stale web bundle in Capacitor app  
**Fix**:

1. `pnpm build`
2. `npx cap sync ios`
3. Clean + rebuild in Xcode

### Cookie Banner Too Low on iOS

**Symptom**: Home indicator covers accept/reject buttons  
**Fix**: `bottom: calc(36px + env(safe-area-inset-bottom, 0px))`

---

## 📚 Quick Reference

### Common Commands

```bash
# Development (starts Vite + Nitro)
pnpm dev

# Type checking
pnpm typecheck

# Locale parity check
pnpm check:locales

# Linting
pnpm lint

# Production build
pnpm build

# Build preview
pnpm preview

# iOS sync after web changes
npx cap sync ios

# Open Xcode
npx cap open ios

# E2E tests
pnpm test:e2e
```

### File Locations

- **Quran data**: `src/stores/q2p.pinia.ts` (lazy-loads JSON)
- **Auth utils**: `apps/nitro-api/server/utils/auth.ts`
- **Service layer**: `src/stores/services/index.ts`
- **Offline audio**: `src/composables/useOfflineRecitation.ts`
- **Version display**: `src/layouts/AppShell.vue` + `src/layouts/home.vue`
- **i18n files**: `src/locale/*.json`

---

## ✅ Session Startup Checklist

When starting a new development session:

1. **Read this file** (DEVELOPMENT_REQUIREMENTS.md)
2. Check terminal outputs for any errors
3. Verify Node version: `>=22.12` (enforced in predev)
4. Check current branch: Usually `one`
5. Pull latest: `git pull origin one`
6. Install deps if needed: `pnpm install`
7. Run typecheck: `pnpm typecheck`
8. Start dev servers: `pnpm dev`

---

## 🎯 Quality Standards

### Definition of "Done"

A task is only complete when:

- ✅ Code compiles (typecheck passes)
- ✅ i18n keys present in all 6 languages
- ✅ Manual testing confirms feature works
- ✅ iOS rebuilt if native wrapper affected
- ✅ No "[object Object]" or similar display bugs
- ✅ Proper error handling with readable messages
- ✅ Mobile-responsive (tested on iOS safe areas)

### Code Review Self-Check

- [ ] TypeScript types explicit and correct
- [ ] Error objects stringified before display
- [ ] URL patterns match actual cached URLs
- [ ] iOS safe areas respected for bottom/notch elements
- [ ] Service layer used for API calls
- [ ] Credentials included for auth endpoints
- [ ] Version display uses first 2 segments, not last 2
- [ ] Cache keys use regex extraction, not string concatenation

---

**Last Updated**: April 8, 2026  
**Version**: 3.0.0

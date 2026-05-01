# Production Deployment Fix for Authentication

## Current Issue

Login fails in production because requests go to `https://api.waelio.com/auth/login` which returns 404.

## Root Cause

`VITE_NITRO_BASE` environment variable in Netlify points to `api.waelio.com`, but that server doesn't have the auth endpoints.

## ✅ Solution: Use Netlify Functions (Same-Origin)

### Step 1: Update Netlify Environment Variables

In [Netlify Dashboard](https://app.netlify.com) → Your Site → Site Settings → Environment Variables:

**DELETE or UPDATE this variable:**

```bash
VITE_NITRO_BASE
# Either delete it entirely, or set to empty string
```

### Step 2: Verify Build Configuration

The [netlify.toml](../netlify.toml) is already correctly configured:

```toml
[build]
  command = "pnpm install && pnpm build && pnpm --filter nitro-api build"
  publish = "dist"
  functions = "apps/nitro-api/.output/server"

# Routes /api/* to Netlify Functions
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Step 3: Ensure Environment Variables Are Set

**Required in Netlify:**

```bash
# Authentication
AUTH_SECRET=your-secure-secret-min-32-chars
NITRO_AUTH_SECRET=${AUTH_SECRET}

# Kimi (if using AI features)
KIMI_API_KEY=sk-your-key
NITRO_KIMI_API_KEY=${KIMI_API_KEY}
KIMI_BASE_URL=<your-kimi-base-url>

# SMTP (for contact form)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
CONTACT_TO=your-email@gmail.com
SMTP_SECURE=false

# GitHub OAuth (if using)
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

See [NETLIFY_ENV.md](../NETLIFY_ENV.md) for complete list.

### Step 4: Deploy

After updating environment variables:

```bash
# Trigger a new deployment
git push origin main
# Or use Netlify Dashboard → Deploys → Trigger deploy
```

## How It Works

1. **Development**:
   - Frontend: `http://localhost:4000`
   - API: `http://localhost:3000`
   - Code detects localhost and uses `http://localhost:3000`

2. **Production** (after fix):
   - Frontend: `https://peace2074.com`
   - API: `https://peace2074.com/api/*` (same origin)
   - Code detects production and uses relative URLs
   - Netlify routes `/api/*` → Functions

## Testing Production Locally

Build and preview production build:

```bash
# Build everything
pnpm build
pnpm --filter nitro-api build

# Preview
pnpm preview
# Visit http://localhost:4173
```

## Verify in Production

After deployment, test the login:

```bash
curl 'https://peace2074.com/api/auth/login' \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"username":"waelio","password":"123456789"}'
```

Should return:

```json
{
  "ok": true,
  "user": {
    "id": "waelio",
    "username": "waelio",
    ...
  }
}
```

## Alternative: Deploy API to api.waelio.com

If you prefer using a separate API domain:

1. Deploy `apps/nitro-api` to `api.waelio.com`
2. Configure CORS to allow `https://peace2074.com`
3. Ensure all endpoints exist:
   - `/auth/login` ✓
   - `/auth/logout` ✓
   - `/auth/me` ✓
   - `/quran` ✓
   - `/kimi` ✓
   - `/contact` ✓
   - `/bookmarks` ✓

4. Set in Netlify:
   ```bash
   VITE_NITRO_BASE=https://api.waelio.com
   ```

## Current Code Behavior

[src/views/login.vue](../src/views/login.vue#L25-L43):

```typescript
function computeNitroBase() {
  const configured = env.VITE_NITRO_BASE;
  if (configured && typeof configured === "string") {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${hostname}:${DEFAULT_NITRO_PORT}`; // Dev
    }
    // Production: use same-origin (relative) to avoid CORS
    return ""; // ← This is what we want in production!
  }
  return "";
}
```

When `VITE_NITRO_BASE` is not set:

- Dev: Uses `http://localhost:3000`
- Prod: Uses same-origin (empty string) → `/api/auth/login`

## Quick Fix Checklist

- [ ] Remove `VITE_NITRO_BASE` from Netlify env vars
- [ ] Verify `AUTH_SECRET` is set in Netlify
- [ ] Verify `NITRO_AUTH_SECRET` is set in Netlify
- [ ] Trigger new deployment
- [ ] Test login at https://peace2074.com

---

**Recommended Action**: Remove `VITE_NITRO_BASE` from Netlify and redeploy. Everything else is already configured correctly.

# Database Connection Issue Fix

> ⚠️ **SECURITY WARNING**: Never commit your actual `DATABASE_URL` or credentials to git.
> Always use placeholders in documentation and keep real values in `.env` (which is gitignored).

## Problem

Your production API is **not connected to MongoDB**. It's using fallback in-memory storage, which means:

- ✅ Only your admin account exists
- ❌ New user signups are **lost on server restart**
- ❌ All user data disappears when Cloudflare functions restart
- 📊 Health check shows: `"prismaReachable": false, "source": "fallback"`

## Root Cause

The `DATABASE_URL` environment variable is not configured in your Cloudflare production environment.

## Solution

### Step 1: Set DATABASE_URL in Cloudflare

You have two options:

#### Option A: Via Cloudflare Dashboard (Recommended)

1. Go to https://app.cloudflare.com
2. Select your site **peace2074.com**
3. Go to **Site configuration** → **Environment variables**
4. Click **Add a variable**
5. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: Your MongoDB connection string from `.env` file
   - **Scope**: Select "All scopes" or at minimum "Builds" and "Functions"
6. Click **Save**

#### Option B: Via Cloudflare CLI

```bash
# Login to Cloudflare first
cloudflare login

# Navigate to your project
cd /Users/waelio/Code/peace2074.com

# Set DATABASE_URL (replace with your actual MongoDB connection string from .env)
cloudflare env:set DATABASE_URL "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE?retryWrites=true&w=majority"
```

### Step 2: Verify Other Required Environment Variables

Make sure these are also set in Cloudflare:

```bash
# Auth secrets (required for login/signup)
cloudflare env:set AUTH_SECRET "your-auth-secret-from-env"
cloudflare env:set AUTH_PASSCODE "your-auth-passcode-from-env"

# Kimi API (for AI chat - optional)
# Note: KIMI_BASE_URL defaults to the standard Kimi API endpoint
# Only set this if you're using a custom endpoint
cloudflare env:set KIMI_API_KEY "your-kimi-api-key"
# cloudflare env:set KIMI_BASE_URL "your-custom-endpoint-if-needed"

# SMTP for contact form (optional)
cloudflare env:set SMTP_HOST "smtp.gmail.com"
cloudflare env:set SMTP_PORT "587"
cloudflare env:set SMTP_USER "your-email@gmail.com"
cloudflare env:set SMTP_PASS "your-app-password"
cloudflare env:set SMTP_FROM "noreply@peace2074.com"
cloudflare env:set CONTACT_TO "admin@peace2074.com"
```

### Step 3: Redeploy

After setting environment variables, trigger a new deployment:

```bash
# Manual deploy via CLI
cloudflare deploy --prod

# Or push to your repo to trigger auto-deploy
git commit --allow-empty -m "Trigger redeploy with DATABASE_URL"
git push origin one
```

### Step 4: Verify Connection

After deployment, check the health endpoint:

```bash
curl https://peace2074.com/api/auth/health | jq
```

You should see:

```json
{
  "ok": true,
  "env": {
    "hasAuthSecret": true,
    "hasAuthPasscode": true,
    "hasDatabaseUrl": true
  },
  "users": {
    "source": "prisma",           ← Should be "prisma" not "fallback"
    "usersCount": 1,
    "prismaReachable": true        ← Should be true
  }
}
```

## MongoDB Atlas Network Access

If Prisma still can't connect, check MongoDB Atlas:

1. Go to https://cloud.mongodb.com
2. Select your **Peace2074** project
3. Click **Network Access** in left sidebar
4. Ensure one of these is configured:
   - **0.0.0.0/0** (Allow from anywhere) - Easiest for serverless
   - Or add Cloudflare's IP ranges (more secure but complex)

## Testing Locally

To test the database connection locally:

```bash
# In apps/nitro-api directory
cd apps/nitro-api

# Test with dotenv
pnpm exec dotenv -e ../../.env -- node -e "import('@prisma/client').then(m => { const p = new m.PrismaClient(); p.\$connect().then(() => { console.log('✅ Connected'); p.\$disconnect(); }).catch(e => console.error('❌ Failed:', e.message)); });"
```

## After Fix: Migrate Existing Users

Once DATABASE_URL is set and working, run the chat permissions migration:

```bash
cd apps/nitro-api
pnpm migrate:chat-permissions
```

This will:

- Add chat permissions to existing users
- Set admin users with full chat management
- Grant regular users read access to chat

## What Changed

I've also updated the signup endpoint to automatically assign proper permissions to new users:

- ✅ Read access to category, post, user
- ✅ Create/update own user profile
- ✅ **Read access to chat** (new users can now use chat)

## Quick Checklist

- [ ] DATABASE_URL set in Cloudflare environment variables
- [ ] AUTH_SECRET and AUTH_PASSCODE configured
- [ ] MongoDB Atlas network access allows connections from anywhere (0.0.0.0/0)
- [ ] Redeploy triggered
- [ ] Health check shows `"prismaReachable": true`
- [ ] Test signup with a new account
- [ ] Refresh page and verify new user persists

## Need Help?

If issues persist:

1. Check Cloudflare function logs: https://app.cloudflare.com/sites/YOUR_SITE/logs
2. Check MongoDB Atlas logs for connection attempts
3. Verify the connection string format in DATABASE_URL

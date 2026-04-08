# Netlify Environment Variables Cleanup

## Problem

AWS Lambda has a **4KB limit** for environment variables. Your Netlify deployment is exceeding this limit due to duplicate and legacy variables.

## Quick Fix

### Option 1: Automated Cleanup (Recommended)

```bash
# Make sure you're logged in to Netlify CLI
netlify login

# Run the cleanup script
./scripts/cleanup-netlify-env.sh
```

### Option 2: Manual Cleanup via Netlify Dashboard

Go to: **Site Settings → Environment Variables** and remove these:

#### Remove ALL Legacy Nuxt Variables

- `NUXT_AUTH_SECRET`
- `NUXT_CLOUDINARY_*` (all)
- `NUXT_EMAIL_*` (all)
- `NUXT_GITHUB_*` (all)
- `NUXT_JWT_*` (all)
- `NUXT_MAILJS_API_URL`
- `NUXT_ROOT_USER`

#### Remove Duplicate GitHub Variables

- `GithubAppID`
- `GithubClientID`
- `GithubClientSecret`

#### Remove EmailJS (if not using)

- `EMAILJS_PRIVATE_KEY`
- `EMAILJS_PUBLIC_KEY`
- `EMAILJS_TEMPLATE_ID`
- `EMAIL_PRIVATE_KEY`
- `EMAIL_PUBLIC_KEY`
- `EMAIL_TEMPLATE`
- `EMAIL_USER`

#### Remove Netlify Emails Plugin Vars (if not using)

- `NETLIFY_EMAILS_*` (all)

#### Remove Non-NITRO Duplicates (keep NITRO\_ versions)

- `AUTH_SECRET` → Keep `NITRO_AUTH_SECRET`
- `DEEPSEEK_API_KEY` → Keep `NITRO_DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL` → Keep `NITRO_DEEPSEEK_BASE_URL`
- `VAPID_*` → Keep `NITRO_VAPID_*`

#### Remove Unused

- `JWT_SECRET` (use `JWT_ACCESS_TOKEN_SECRET` instead)
- `MONGODB_URI` (use `DATABASE_URL`)
- `API_URL`
- `VITE_NITRO_PREFIX`

## Essential Variables to Keep

### Core (Required)

```bash
DATABASE_URL
NITRO_AUTH_SECRET
JWT_ACCESS_TOKEN_SECRET
JWT_REFRESH_TOKEN_SECRET
CONF_ENCRYPTION_KEY
```

### DeepSeek AI

```bash
NITRO_DEEPSEEK_API_KEY
NITRO_DEEPSEEK_BASE_URL
```

### OAuth

```bash
# GitHub (no NITRO_ prefix for GitHub)
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET

# Google (use NITRO_ prefix)
NITRO_GOOGLE_CLIENT_ID
NITRO_GOOGLE_CLIENT_SECRET
NITRO_GOOGLE_REDIRECT_URI  # Optional, defaults to PUBLIC_URL/api/auth/google/callback
```

### SMTP (Email)

```bash
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
SMTP_SECURE
CONTACT_TO
```

### Cloudinary (Media)

```bash
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
# CLOUDINARY_URL is optional (alternative to above 3)
```

### Push Notifications

```bash
NITRO_VAPID_PUBLIC_KEY
NITRO_VAPID_PRIVATE_KEY
NITRO_VAPID_SUBJECT
```

### Optional

```bash
NETLIFY_WEBHOOK_SECRET
GOOGLE_ANALYTICS_ID
PUBLIC_URL                      # Defaults to https://peace2074.com
VITE_NITRO_BASE                # Only for mobile app
DISABLE_PRISMA                 # true if MongoDB unavailable
ENABLE_BLOG_NOTIFICATIONS      # true/false
AUTH_PASSCODE                  # If using passcode auth
```

## After Cleanup

1. Verify variables:

   ```bash
   netlify env:list
   ```

2. Trigger a new deploy:

   ```bash
   netlify deploy --prod
   ```

3. Expected variable count: **~25-30** (down from 87)

## Why NITRO\_ Prefix?

Nitro automatically reads environment variables with the `NITRO_` prefix and maps them to `runtimeConfig`. For example:

- `NITRO_GOOGLE_CLIENT_ID` → available as `config.googleClientId`
- `NITRO_AUTH_SECRET` → available as `config.authSecret`

This is configured in `apps/nitro-api/nitro.config.ts`.

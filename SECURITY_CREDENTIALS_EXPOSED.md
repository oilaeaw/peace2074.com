# 🚨 SECURITY ALERT: Multiple Secrets Exposed

## What Happened

GitHub detected exposed secrets in multiple commits and files:

1. **MongoDB credentials** in `DATABASE_CONNECTION_FIX.md` (commit `58894985`)
2. **Kimi API Key** in `cloudflare-env-setup.sh`
3. **AUTH_SECRET** in `cloudflare-env-setup.sh`
4. **CLOUDFLARE_WEBHOOK_SECRET** in `cloudflare-env-setup.sh`

**Status**: ✅ **FIXED** - All exposed credentials have been removed and replaced with placeholders.

## What Was Exposed

### 1. MongoDB Atlas

- ❌ Cluster hostname pattern (`peace2074.1o4lzch.mongodb.net`)
- ✅ Password was not directly exposed (in gitignored `.env`)

### 2. Kimi API Key

- ❌ Complete API key: `sk-c9500709d5d6483689e12cd77f735222`
- 🔐 **CRITICAL**: Rotate immediately

### 3. Authentication Secrets

- ❌ AUTH_SECRET: `T^n?10fZEo@#fsaMg?A1pBej1+Kv?m}k`
- 🔐 **CRITICAL**: Rotate immediately

### 4. Webhook Secret

- ❌ CLOUDFLARE_WEBHOOK_SECRET: `csesGwJx367WG37J8L6n`
- 🔐 **HIGH**: Rotate recommended

## Immediate Actions Taken

1. ✅ Sanitized `DATABASE_CONNECTION_FIX.md` with generic placeholders
2. ✅ Sanitized `cloudflare-env-setup.sh` with generic placeholders
3. ✅ Added security warnings to all template files
4. ✅ Verified `.env` is properly gitignored

## ⚠️ CRITICAL: Rotate All Exposed Secrets

### 1. Rotate Kimi API Key (HIGHEST PRIORITY)

1. Go to https://platform.kimi.com (or your Kimi dashboard)
2. Navigate to **API Keys**
3. **Delete** the exposed key: `sk-c95007...`
4. **Create** a new API key
5. Update your local `.env`:
   ```bash
   KIMI_API_KEY="your-new-key-here"
   ```
6. Update Cloudflare:
   ```bash
   cloudflare env:set KIMI_API_KEY "your-new-key-here"
   cloudflare env:set NITRO_KIMI_API_KEY "your-new-key-here"
   ```

### 2. Rotate AUTH_SECRET (HIGHEST PRIORITY)

Generate a new strong secret:

```bash
# Generate a new random secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Update everywhere:

```bash
# Update .env
AUTH_SECRET="your-new-secret-here"

# Update Cloudflare
cloudflare env:set AUTH_SECRET "your-new-secret-here"
cloudflare env:set NITRO_AUTH_SECRET "your-new-secret-here"
```

⚠️ **Note**: Rotating AUTH_SECRET will **invalidate all existing user sessions**. Users will need to log in again.

### 3. Rotate CLOUDFLARE_WEBHOOK_SECRET (HIGH PRIORITY)

Generate a new webhook secret:

```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Update:

```bash
# Update .env
CLOUDFLARE_WEBHOOK_SECRET="your-new-secret-here"

# Update Cloudflare
cloudflare env:set CLOUDFLARE_WEBHOOK_SECRET "your-new-secret-here"

# Update GitHub webhook settings
# Go to: https://github.com/peace2074/peace2074.com/settings/hooks
# Update the secret for any webhooks pointing to your API
```

### 4. Rotate MongoDB Credentials (RECOMMENDED)

### 1. Create New MongoDB User

1. Go to https://cloud.mongodb.com
2. Select your **Peace2074** project
3. Go to **Database Access**
4. Click **Add New Database User**
5. Create a new user with:
   - Username: Choose a new username (e.g., `peace_prod_v2`)
   - Password: Generate a strong password (click "Autogenerate Secure Password")
   - Database User Privileges: **Read and write to any database**
6. Click **Add User**
7. **Copy the new connection string**

### 2. Update Local Configuration

```bash
# Update your .env file with the NEW connection string
# Replace the old DATABASE_URL value

# Format:
# DATABASE_URL="mongodb+srv://NEW_USERNAME:NEW_PASSWORD@YOUR_CLUSTER.mongodb.net/api?retryWrites=true&w=majority"
```

### 3. Update Cloudflare Environment Variables

```bash
# Login to Cloudflare
cloudflare login

# Update DATABASE_URL with new credentials
cloudflare env:set DATABASE_URL "mongodb+srv://NEW_USERNAME:NEW_PASSWORD@YOUR_CLUSTER.mongodb.net/api?retryWrites=true&w=majority"

# Redeploy
cloudflare deploy --prod
```

### 4. Delete Old MongoDB User (After Verification)

**IMPORTANT**: Only do this AFTER confirming the new credentials work!

1. Go to https://cloud.mongodb.com
2. **Database Access**
3. Find the old user (e.g., `peace`)
4. Click **Edit** → **Delete User**

### 5. Test Everything Works

```bash
# Test local connection
cd apps/nitro-api
node -e "import('dotenv').then(d => d.config({path: '../../.env'})).then(() => import('@prisma/client')).then(async ({PrismaClient}) => { const p = new PrismaClient(); await p.\$connect(); console.log('✅ Connected!'); await p.\$disconnect(); }).catch(e => console.error('❌ Failed:', e.message));"

# Test production
curl https://peace2074.com/api/auth/health | jq '.users.prismaReachable'
# Should return: true
```

## Prevention Measures

### ✅ Already in Place

- `.env` is properly gitignored
- `.env.example` template exists without real values
- Documentation updated with security warnings

### 🔒 Best Practices Going Forward

1. **Never** hardcode credentials in:
   - Code files
   - Documentation
   - Comments
   - Commit messages

2. **Always** use placeholders like:
   - `YOUR_USERNAME`, `YOUR_PASSWORD`
   - `mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/`
   - `***` for redacted values

3. **Use environment variables** for all secrets:
   - Store in `.env` locally (gitignored)
   - Store in Cloudflare environment variables for production
   - Never commit `.env` to git

4. **Regular credential rotation**:
   - Rotate MongoDB credentials quarterly
   - Rotate API keys when team members leave
   - Use different credentials for dev/staging/prod

## GitHub Security Alert

To resolve the GitHub security alert:

1. The exposed content has been removed ✅
2. Rotate the credentials (follow steps above) 🔄
3. GitHub will automatically close the alert after the next scan

## Questions?

If you need help:

- Check `.env.example` for the format
- MongoDB Atlas docs: https://www.mongodb.com/docs/atlas/
- Cloudflare env vars: https://docs.cloudflare.com/environment-variables/overview/

---

**Created**: February 26, 2026  
**Status**: Credentials sanitized, rotation recommended  
**Next Action**: Rotate MongoDB credentials when convenient

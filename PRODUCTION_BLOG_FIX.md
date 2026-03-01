# Production Blog Fix - Prisma Connection

## Problem

Blogs display locally but not in production after first login. Database has 3 BlogPost records but API returns empty.

## Root Cause

Prisma Client was not being properly included in Netlify Functions bundle.

## Solution Applied

### 1. Updated `scripts/netlify-prisma-setup.sh`

- Now explicitly runs `prisma generate` during build
- Copies `.prisma/client` folder to function directory
- Updates package.json with correct relative path

### 2. Verify Netlify Environment Variables

**Required:** Check that `DATABASE_URL` is set in Netlify:

```bash
netlify env:list
```

Should show:

```
DATABASE_URL: mongodb+srv://...
```

**If missing, set it:**

```bash
netlify env:set DATABASE_URL "mongodb+srv://YOUR_CONNECTION_STRING"
```

### 3. Test Locally First

```bash
# Simulate production build
pnpm install -r
pnpm build
NETLIFY_BUILD=true pnpm --filter nitro-api build
bash scripts/netlify-prisma-setup.sh

# Check if .prisma folder was copied
ls -la netlify/functions/server/node_modules/.prisma/client
```

### 4. Deploy to Production

```bash
git add .
git commit -m "fix: Ensure Prisma Client is included in Netlify Functions"
git push
```

### 5. Verify in Production

After deployment, check:

1. **Netlify Build Logs** - Look for:

   ```
   📦 Generating Prisma Client...
   ✅ Copied .prisma/client to function directory
   ✅ Prisma setup complete for Netlify Functions
   ```

2. **Test API Endpoint:**

   ```bash
   curl https://peace2074.com/api/blog | jq '{ok, postCount: (.posts | length), source}'
   ```

   Should return:

   ```json
   {
     "ok": true,
     "postCount": 3,
     "source": null
   }
   ```

   **Note:** `source: null` means database connected successfully
   **If:** `source: "seed-fallback"` means Prisma failed (check DATABASE_URL)

3. **Check Function Logs in Netlify Dashboard:**
   - Go to Functions → server
   - Look for Prisma connection errors

## Fallback Behavior

If database connection fails, the API automatically serves posts from:
`apps/nitro-api/server/data/blog-seed.json`

This ensures blogs always display, even during database outages.

## Common Issues

### Issue: "PrismaClientInitializationError"

**Solution:** DATABASE_URL not set in Netlify environment variables

### Issue: "Cannot find module '@prisma/client'"

**Solution:** Prisma Client not generated during build. Check build logs for errors in `netlify-prisma-setup.sh`

### Issue: Empty blog list after login

**Solution:**

1. Check DATABASE_URL is correct
2. Verify database has BlogPost records
3. Check Netlify Function logs for connection errors

## Related Files

- `apps/nitro-api/server/routes/blog.get.ts` - Blog API with fallback
- `apps/nitro-api/server/utils/prisma.ts` - Prisma singleton
- `scripts/netlify-prisma-setup.sh` - Build-time Prisma setup
- `netlify.toml` - Build command configuration

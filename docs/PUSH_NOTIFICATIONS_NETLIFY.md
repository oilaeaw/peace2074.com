# Deploy Push Notifications to Netlify

Quick guide to enable push notifications in production.

## Prerequisites

- Netlify CLI installed: `npm install -g netlify-cli`
- Authenticated: `netlify login`
- Site linked: `netlify link`

## Step-by-Step Setup

### 1. Generate VAPID Keys (Local)

```bash
node scripts/generate-vapid-keys.mjs
```

This outputs:
```
VAPID_PUBLIC_KEY=BKx...
VAPID_PRIVATE_KEY=_Xm...
VAPID_SUBJECT=mailto:your-email@peace2074.com
```

### 2. Set Environment Variables in Netlify

#### Option A: Using Netlify CLI (Recommended)

```bash
# Copy the keys from step 1 and run:
netlify env:set VAPID_PUBLIC_KEY "BKx..."
netlify env:set VAPID_PRIVATE_KEY "_Xm..."
netlify env:set VAPID_SUBJECT "mailto:admin@peace2074.com"

# Set the NITRO_ prefixed versions (same values)
netlify env:set NITRO_VAPID_PUBLIC_KEY "BKx..."
netlify env:set NITRO_VAPID_PRIVATE_KEY "_Xm..."
netlify env:set NITRO_VAPID_SUBJECT "mailto:admin@peace2074.com"

# Optional: Enable auto-notifications for blog posts
netlify env:set ENABLE_BLOG_NOTIFICATIONS "true"
```

#### Option B: Using Netlify Dashboard

1. Go to: https://app.netlify.com/sites/[your-site]/configuration/env
2. Click "Add a variable"
3. Add each variable:
   - `VAPID_PUBLIC_KEY` = Your public key
   - `VAPID_PRIVATE_KEY` = Your private key
   - `VAPID_SUBJECT` = `mailto:admin@peace2074.com`
   - `NITRO_VAPID_PUBLIC_KEY` = Same as VAPID_PUBLIC_KEY
   - `NITRO_VAPID_PRIVATE_KEY` = Same as VAPID_PRIVATE_KEY
   - `NITRO_VAPID_SUBJECT` = Same as VAPID_SUBJECT
   - `ENABLE_BLOG_NOTIFICATIONS` = `true` (optional)

#### Option C: Using the Setup Script

1. Edit `netlify-env-setup.sh`
2. Replace `YOUR_VAPID_PUBLIC_KEY_HERE` with your actual keys
3. Run: `bash netlify-env-setup.sh`

### 3. Verify MongoDB Connection

Push subscriptions are stored in MongoDB. Make sure you have:

```bash
netlify env:set DATABASE_URL "mongodb+srv://user:pass@cluster.mongodb.net/api"
```

### 4. Deploy

```bash
# Deploy to production
netlify deploy --prod

# Or trigger automatic deploy
git push origin main
```

### 5. Test on Production

1. Visit your live site: `https://your-site.netlify.app`
2. Go to Settings
3. Enable notifications
4. Accept browser permission
5. You should see a test notification! 🎉

### 6. Test Blog Post Notifications

1. Log in as admin
2. Go to `/blog-editor`
3. Create a new blog post
4. All subscribed users should receive a push notification!

## Troubleshooting

### "Push notifications not configured"

- Check env vars in Netlify: `netlify env:list`
- Verify keys are set: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, etc.
- Redeploy: `netlify deploy --prod`

### "Subscription failed"

- Check MongoDB connection: `DATABASE_URL` must be set
- Check Netlify function logs in dashboard
- Verify API endpoints work: `https://your-site.netlify.app/api/push/public-key`

### "No notifications received"

- Check browser notification permissions (Settings → Notifications)
- Verify subscription saved: Check MongoDB `push_subscriptions` collection
- Test manual send via API: `/api/push/send`

## Security Notes

- ⚠️ **Never commit VAPID private key to Git**
- Store keys securely in Netlify environment variables
- Private key is like a password - keep it secret!
- Public key is safe to expose to browsers
- Rotate keys if compromised: generate new ones and redeploy

## Architecture

```
User Browser (iPhone/Desktop)
    ↓ Subscribe
    ↓
Service Worker (/sw.js)
    ↓
Frontend Settings (/settings)
    ↓ POST subscription
    ↓
Nitro API (/api/push/subscribe)
    ↓ Save
    ↓
MongoDB (push_subscriptions)

---

Blog Post Created
    ↓
Nitro API (/api/blog POST)
    ↓ Check ENABLE_BLOG_NOTIFICATIONS
    ↓ Fetch all subscriptions
    ↓ Send via web-push library
    ↓
Browser Push Service (Google/Apple/Mozilla)
    ↓ Deliver
    ↓
Service Worker (push event)
    ↓ Show notification
    ↓
User sees notification 🔔
```

## Cost

**100% FREE!** No third-party services required.

- Uses native Web Push Protocol (W3C standard)
- No Firebase, OneSignal, or other paid services
- Unlimited notifications
- Works on all platforms (iPhone 16.4+, Android, Desktop)

## Additional Resources

- [Web Push Protocol (RFC 8030)](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Spec (RFC 8292)](https://datatracker.ietf.org/doc/html/rfc8292)
- [Main Setup Guide](../PUSH_NOTIFICATIONS_SETUP.md)
- [Netlify Environment Variables](../NETLIFY_ENV.md)

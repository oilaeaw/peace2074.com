# Push Notifications Setup Guide

## 📱 Complete Web Push Notification System

This app now supports **free** Web Push notifications that work on iPhone, Android, and desktop!

---

## 🚀 Quick Setup (5 minutes)

### 1. Generate VAPID Keys

```bash
cd /Users/waelio/Code/peace2074.com
node scripts/generate-vapid-keys.mjs
```

This will output something like:
```
VAPID_PUBLIC_KEY=BKxT...
VAPID_PRIVATE_KEY=_Xm...
VAPID_SUBJECT=mailto:your-email@peace2074.com
```

### 2. Add to Environment Variables

Add the keys to your `.env` file:

```bash
# Web Push VAPID Keys
VAPID_PUBLIC_KEY=BKxT...
VAPID_PRIVATE_KEY=_Xm...
VAPID_SUBJECT=mailto:admin@peace2074.com

# Optional: Enable automatic blog post notifications
ENABLE_BLOG_NOTIFICATIONS=true
```

**⚠️ IMPORTANT**: Also add these to your Cloudflare environment variables!

### 3. Restart Dev Server

```bash
pnpm dev
```

### 4. Test It!

1. Open your app at `http://localhost:4000`
2. Go to **Settings** (⚙️ icon)
3. Scroll to **Notifications**
4. Toggle **"Enable notifications"**
5. Accept the browser permission prompt
6. You should see a test notification! 🎉

---

## 📚 API Endpoints

### Subscribe to Push Notifications
```typescript
POST /api/push/subscribe
Body: { subscription: PushSubscription }
```

### Unsubscribe
```typescript
POST /api/push/unsubscribe
Body: { endpoint: string }
```

### Get Public Key
```typescript
GET /api/push/public-key
Response: { ok: true, publicKey: "..." }
```

### Send Notification (Auth Required)
```typescript
POST /api/push/send
Body: {
  title: string,
  message: string,
  url?: string,      // URL to open when clicked
  userId?: string    // Send to specific user (optional)
}
```

---

## 💡 Usage Examples

### Manually Send a Notification

```bash
# Send to all subscribers
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -H "Cookie: waelio_session=YOUR_SESSION" \
  -d '{
    "title": "Prayer Time Alert",
    "message": "Time for Maghrib prayer",
    "url": "/quran"
  }'
```

### Send from Blog Post Creation

The blog post endpoint (`/api/blog POST`) automatically sends notifications when:
- `ENABLE_BLOG_NOTIFICATIONS=true` is set
- A new blog post is published
- Format: "📝 New Blog Post: [Title]"

### Custom Notification in Your Code

```typescript
// In any Nitro API route
import webpush from 'web-push'

// Configure VAPID
webpush.setVapidDetails(
  'mailto:admin@peace2074.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

// Get subscriptions from DB
const subscriptions = await db.collection('push_subscriptions').find({}).toArray()

// Send notification
const payload = JSON.stringify({
  title: 'Custom Notification',
  body: 'Your message here',
  icon: '/android-chrome-192x192.png',
  data: { url: '/custom-page' }
})

await Promise.allSettled(
  subscriptions.map(sub => webpush.sendNotification(sub.subscription, payload))
)
```

---

## 🔔 Notification Triggers (Ideas)

### Current
- ✅ Blog post published
- ✅ Manual send via API

### Future Ideas
- Prayer time reminders (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Daily Quran verse
- Bookmark reminders ("Continue reading Surah...")
- New content releases

---

## 🛠️ Technical Details

### Database Collections

**push_subscriptions**
```typescript
{
  _id: ObjectId,
  endpoint: string,          // Browser push endpoint
  subscription: {            // Full PushSubscription object
    endpoint: string,
    keys: { p256dh: string, auth: string }
  },
  userId: string | null,     // User ID if authenticated
  createdAt: Date,
  updatedAt: Date
}
```

### Service Worker

Located at `/public/sw.js`
- Handles push events
- Shows notifications
- Opens app when clicked

### Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari 16.4+ (iOS 16.4+, macOS 13+)
- ✅ Samsung Internet
- ✅ Opera

---

## 🔒 Security

- **VAPID keys** = Cryptographic identity for your app
- **Private key** = MUST stay secret (never commit to Git!)
- **Public key** = Safe to share (sent to browsers)
- **Subscriptions** = Encrypted by browser, unique per device

---

## 🐛 Troubleshooting

### "Push notifications not configured"
- Make sure VAPID keys are in `.env`
- Restart Nitro API (`pnpm dev`)

### "Service Worker registration failed"
- Clear browser cache
- Hard reload (Cmd+Shift+R)
- Check `/sw.js` loads (no 404)

### "Notifications not showing on iPhone"
- Make sure iOS 16.4+ and Safari 16.4+
- Add app to Home Screen (PWA)
- Grant notification permission

### "Subscriptions not saving"
- Check MongoDB connection
- Verify `/api/push/subscribe` endpoint works

---

## 📖 Resources

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Spec](https://datatracker.ietf.org/doc/html/rfc8292)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push npm](https://www.npmjs.com/package/web-push)

---

## 🎉 That's It!

You now have a complete, **free**, native push notification system that works across all devices!

Questions? Check the code or open an issue.

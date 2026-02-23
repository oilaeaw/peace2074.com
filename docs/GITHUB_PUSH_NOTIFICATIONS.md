# GitHub Push Notifications Setup

Automatically send push notifications to all app subscribers when code is pushed to GitHub.

## How It Works

1. GitHub sends a webhook when code is pushed
2. Nitro API receives the webhook at `/api/webhooks/github-push`
3. API validates the webhook signature (if secret is configured)
4. API sends web push notifications to all subscribers
5. Notification shows: pusher name, commit count, branch, and latest commit message

## Setup Instructions

### 1. Configure Webhook Secret (Optional but Recommended)

Add to your `.env` file:
```bash
GITHUB_WEBHOOK_SECRET=your-random-secret-here
```

Generate a random secret:
```bash
# macOS/Linux
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add the same secret to Netlify environment variables:
- Go to: Netlify Dashboard → Site Settings → Environment Variables
- Add: `GITHUB_WEBHOOK_SECRET` with the same value

### 2. Set Up GitHub Webhook

Go to your GitHub repository:
1. Navigate to: **Settings → Webhooks → Add webhook**

2. Configure the webhook:
   - **Payload URL**: `https://peace2074.com/api/webhooks/github-push`
   - **Content type**: `application/json`
   - **Secret**: (paste your `GITHUB_WEBHOOK_SECRET` value)
   - **Which events**: Select "Just the push event"
   - **Active**: ✓ Checked

3. Click **Add webhook**

### 3. Test the Webhook

After setup, make a test commit and push:
```bash
git commit --allow-empty -m "test: trigger push notification"
git push
```

Check the webhook delivery in GitHub:
- Go to: **Settings → Webhooks → Your webhook → Recent Deliveries**
- You should see a successful delivery (green checkmark)
- All app subscribers will receive a push notification

## Notification Content

Subscribers will see:
- **Title**: "🚀 peace2074.com updated"
- **Body**: "{pusher} pushed {count} commit(s) to {branch}"
- **Second line**: Latest commit message
- **Click action**: Opens repository on GitHub

## Customization

### Only Notify for Specific Branches

Edit `apps/nitro-api/server/routes/webhooks/github-push.post.ts`:

```typescript
// Change this line (currently notifies for 'one' and 'main')
if (branch !== 'one' && branch !== 'main') {
    return { ok: true, message: `Ignored push to ${branch}` }
}
```

### Customize Notification Message

Edit the `payload` object in the same file:

```typescript
const payload = JSON.stringify({
    title: `🚀 ${repoName} updated`,
    body: `Custom message here`,
    // ... other options
})
```

## Troubleshooting

### Webhook Not Working

1. **Check webhook deliveries in GitHub**:
   - Settings → Webhooks → Recent Deliveries
   - Look for error messages

2. **Verify signature validation**:
   - Ensure `GITHUB_WEBHOOK_SECRET` matches in both GitHub and Netlify
   - Check Netlify function logs for signature errors

3. **Check Netlify function logs**:
   - Netlify Dashboard → Functions → github-push
   - Look for `[GitHub Webhook]` log messages

### No Subscribers Receiving Notifications

1. **Verify VAPID keys are configured**:
   - Check `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` in Netlify env vars

2. **Check if users are subscribed**:
   - Users must enable push notifications in the app
   - They must grant browser permission

3. **Test push notifications manually**:
   ```bash
   curl -X POST https://peace2074.com/api/push/send \
     -H "Content-Type: application/json" \
     -d '{"title":"Test","body":"Testing push notifications"}'
   ```

## Security Notes

- **Always use a webhook secret** in production
- The secret prevents unauthorized webhook calls
- Signature validation happens automatically if `GITHUB_WEBHOOK_SECRET` is set
- Invalid signatures are rejected with a 400 error

## Environment Variables Required

```bash
# Required for push notifications to work
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key

# Optional but recommended for webhook security
GITHUB_WEBHOOK_SECRET=your-random-secret
```

## Future Improvements

- [ ] Migrate push subscriptions to MongoDB (currently using KV storage)
- [ ] Add notification preferences (allow users to opt out of push notifications)
- [ ] Different notification types (push only, deploy only, etc.)
- [ ] Notification history/logs for debugging
- [ ] Support for other GitHub events (pull requests, releases, etc.)

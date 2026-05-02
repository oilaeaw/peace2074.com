# Blog Post Seeding

## Problem

In production (Netlify), the file system is read-only. This means:

- Blog posts stored locally in `.data/` directory don't persist across deployments
- The `kv-db.ts` utility falls back to in-memory storage
- In-memory storage is cleared on every deployment
- Result: **Blog posts disappear after each deployment**

## Solution

Automatic blog post seeding on server startup:

1. **Seed Data**: `apps/nitro-api/server/data/blog-seed.json`
   - Contains all blog posts that should exist in production
   - Added to git repository and deployed with the app

2. **Seeding Plugin**: `apps/nitro-api/server/plugins/seed-blog.ts`
   - Nitro plugin that runs on server startup
   - Checks which posts from `blog-seed.json` need to be added
   - Only inserts posts that don't already exist (idempotent)
   - Logs seeding activity to console

## How It Works

On every server startup (including deployments):

```
1. Plugin loads → reads blog-seed.json
2. For each post in seed data:
   - Check if post exists (by slug)
   - If not exists → insert post
   - If exists → skip (no duplicates)
3. Log results to console
```

## Adding New Blog Posts to Seed

To add a blog post that should persist across deployments:

### Option 1: Update seed file directly

Edit `apps/nitro-api/server/data/blog-seed.json`:

```json
{
  "id": "my-post-slug",
  "slug": "my-post-slug",
  "title": "My Post Title",
  "excerpt": "Short description",
  "content": "Full markdown content here...",
  "tags": ["tag1", "tag2"],
  "date": "2026-02-23",
  "author": "Your Name",
  "createdAt": "2026-02-23T00:00:00.000Z",
  "updatedAt": "2026-02-23T00:00:00.000Z",
  "notifySubscribers": true,
  "notificationTitle": "🌍 PEACE2074 blog update",
  "notificationBody": "New posts are now live in Spanish and Italian.",
  "notificationUrl": "/blog"
}
```

Optional notification fields are only used during server startup seeding. If `notifySubscribers` is `true`, the app sends a push notification **only when that seeded post is inserted for the first time** and blog notifications are enabled.

### Option 2: Export from local database

If you have posts in your local `.data/` directory:

```bash
# Run export script
node scripts/export-blog-posts.mjs

# Copy posts from blog-posts-export.json to blog-seed.json
```

### Option 3: Create in production UI

1. Deploy the app with seeding enabled
2. Log in to the production site
3. Use `/blog-editor` to create posts
4. Posts created via UI are **temporary** (cleared on redeploy)
5. To make them permanent, export and add to `blog-seed.json`

## Verification

Check if seeding works:

### Local Development

```bash
pnpm dev

# Check logs for:
# [Blog Seed] ✓ Seeded X blog post(s)
# [Blog Seed] Total blog posts: X

# Test API:
curl http://localhost:3000/blog | jq '.posts | length'
```

### Production (Netlify)

```bash
# Check Netlify function logs
netlify functions:log

# Or check live API:
curl https://peace2074.com/api/blog | jq '.posts | length'
```

## Benefits

✅ Blog posts persist across deployments  
✅ No external database required  
✅ Simple JSON file format  
✅ Version controlled in git  
✅ Idempotent (safe to run multiple times)  
✅ Works in both development and production

## Notes

- The seeding plugin runs on **every** server startup
- Existing posts are never modified by the plugin
- To update a seeded post: change `blog-seed.json` and redeploy
- Posts created via UI are not automatically added to seed file
- For production persistence, always update `blog-seed.json`

## Future Improvements

- [ ] Add CLI command to sync UI-created posts to seed file
- [ ] Support markdown files instead of JSON
- [ ] Add blog post versioning/migration system

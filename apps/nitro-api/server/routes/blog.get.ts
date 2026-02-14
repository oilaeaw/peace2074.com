import { defineEventHandler, getQuery } from 'h3'

/**
 * GET /api/blog
 * Returns all blog posts or a single post by slug
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { slug } = query

  try {
    const db = event.context.db
    if (!db) {
      return { ok: false, error: 'Database not available' }
    }

    const Blog = db.collection('blog_posts')

    // Get single post by slug
    if (slug && typeof slug === 'string') {
      const post = await Blog.findOne({ slug })
      if (!post) {
        return { ok: false, error: 'Post not found' }
      }
      return { ok: true, post }
    }

    // Get all posts, sorted by date descending
    const posts = await Blog.find({})
      .sort({ date: -1 })
      .toArray()

    return { ok: true, posts }
  } catch (err: any) {
    console.error('[Blog GET] Error:', err)
    return { ok: false, error: err?.message || 'Failed to fetch posts' }
  }
})

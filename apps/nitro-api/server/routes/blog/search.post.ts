import { defineEventHandler, readBody } from 'h3'
import { getDb } from '../../utils/realdb'
import { generateEmbedding } from '../../utils/embeddings'

/**
 * POST /api/blog/search
 * Keyword + tag search over blog posts (replaces Atlas Vector Search).
 */
export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { query, limit = 5, tags } = body as {
            query: string
            limit?: number
            tags?: string[]
        }

        if (!query?.trim()) {
            return { ok: false, error: 'Missing query' }
        }

        const db = await getDb()
        const blogPosts = db.collection('blogPosts')
        const all = await blogPosts.findAll() as any[]

        const lq = query.trim().toLowerCase()

        const filtered = all.filter((post) => {
            const matchesText =
                String(post.title || '').toLowerCase().includes(lq) ||
                String(post.excerpt || '').toLowerCase().includes(lq) ||
                String(post.content || '').toLowerCase().includes(lq)

            const matchesTags = !tags?.length ||
                (Array.isArray(post.tags) && tags.some((t) => post.tags.includes(t)))

            return matchesText && matchesTags
        })

        const results = filtered.slice(0, limit).map((post) => ({
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            tags: post.tags,
            date: post.date,
            author: post.author,
        }))

        return { ok: true, results }
    } catch (err: unknown) {
        console.error('[Blog Search] Error:', err)
        return { ok: false, error: err instanceof Error ? err.message : 'Search failed' }
    }
})

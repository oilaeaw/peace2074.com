import { defineEventHandler, getQuery } from 'h3'
import { getPrisma } from '../utils/prisma'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

type BlogSeedPost = {
    id?: string
    slug?: string
    title?: string
    excerpt?: string
    content?: string
    tags?: string[]
    date?: string
    author?: string
    createdAt?: string
    updatedAt?: string
}

function loadSeedPosts(): BlogSeedPost[] {
    try {
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = dirname(__filename)
        const seedPath = join(__dirname, '../data/blog-seed.json')
        const raw = readFileSync(seedPath, 'utf-8')
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch (error) {
        console.warn('[Blog GET] Seed fallback load failed:', error instanceof Error ? error.message : 'unknown')
        return []
    }
}

/**
 * GET /api/blog
 * Returns all blog posts or a single post by slug
 */
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { slug } = query
    const fallbackPosts = loadSeedPosts()

    try {
        const prisma = await getPrisma()

        if (!prisma) {
            if (slug && typeof slug === 'string') {
                const fallbackPost = fallbackPosts.find((post) => String(post?.slug || '') === slug)
                if (!fallbackPost) {
                    return { ok: false, error: 'Post not found' }
                }
                return { ok: true, post: fallbackPost, source: 'seed-fallback' }
            }

            const sortedFallback = [...fallbackPosts].sort((a, b) => {
                const ad = new Date(String(a?.date || a?.createdAt || 0)).getTime()
                const bd = new Date(String(b?.date || b?.createdAt || 0)).getTime()
                return bd - ad
            })
            return { ok: true, posts: sortedFallback, source: 'seed-fallback' }
        }

        // Get single post by slug
        if (slug && typeof slug === 'string') {
            const post = await prisma.blogPost.findUnique({ where: { slug } })
            if (!post) {
                return { ok: false, error: 'Post not found' }
            }
            return { ok: true, post }
        }

        // Get all posts, sorted by date descending
        const posts = await prisma.blogPost.findMany({
            orderBy: { date: 'desc' }
        })

        if (!posts.length && fallbackPosts.length) {
            const sortedFallback = [...fallbackPosts].sort((a, b) => {
                const ad = new Date(String(a?.date || a?.createdAt || 0)).getTime()
                const bd = new Date(String(b?.date || b?.createdAt || 0)).getTime()
                return bd - ad
            })
            return { ok: true, posts: sortedFallback, source: 'seed-fallback' }
        }

        return { ok: true, posts }
    } catch (err: any) {
        console.error('[Blog GET] Error:', err)
        return { ok: false, error: err?.message || 'Failed to fetch posts' }
    }
})

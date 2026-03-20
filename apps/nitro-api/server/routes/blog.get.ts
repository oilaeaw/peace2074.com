import { defineEventHandler, getQuery } from 'h3'
import { getPrisma } from '../utils/prisma'
import blogSeedData from '../data/blog-seed.json'
import { fetchDatoCmsBlogPosts } from '../utils/datocms'

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
        // Import the JSON directly so it gets bundled
        return Array.isArray(blogSeedData) ? blogSeedData : []
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
    const normalizedSlug = typeof slug === 'string' ? slug.trim() : undefined

    try {
        // 1) Prefer Prisma as primary source
        const prisma = await getPrisma()

        if (prisma) {
            // Get single post by slug
            if (normalizedSlug) {
                const post = await prisma.blogPost.findUnique({ where: { slug: normalizedSlug } })
                if (post) {
                    return { ok: true, post, source: 'prisma' }
                }
            }

            // Get all posts, sorted by date descending
            const posts = await prisma.blogPost.findMany({
                orderBy: { date: 'desc' }
            })

            if (!normalizedSlug && posts.length) {
                return { ok: true, posts, source: 'prisma' }
            }
        }

        // 2) Fallback to DatoCMS when Prisma has no data or no match
        try {
            if (normalizedSlug) {
                const datocmsPost = await fetchDatoCmsBlogPosts({ slug: normalizedSlug })
                if (datocmsPost) {
                    return { ok: true, post: datocmsPost, source: 'datocms' }
                }
            } else {
                const datocmsPosts = await fetchDatoCmsBlogPosts()
                if (Array.isArray(datocmsPosts) && datocmsPosts.length) {
                    return { ok: true, posts: datocmsPosts, source: 'datocms' }
                }
            }
        } catch (error) {
            console.warn('[Blog GET] DatoCMS read failed, falling back:', error instanceof Error ? error.message : 'unknown')
        }

        // 3) Seed fallback
        if (normalizedSlug) {
            const fallbackPost = fallbackPosts.find((post) => String(post?.slug || '') === normalizedSlug)
            if (!fallbackPost) {
                return { ok: false, error: 'Post not found' }
            }
            return { ok: true, post: fallbackPost, source: 'seed-fallback' }
        }

        if (fallbackPosts.length) {
            const sortedFallback = [...fallbackPosts].sort((a, b) => {
                const ad = new Date(String(a?.date || a?.createdAt || 0)).getTime()
                const bd = new Date(String(b?.date || b?.createdAt || 0)).getTime()
                return bd - ad
            })
            return { ok: true, posts: sortedFallback, source: 'seed-fallback' }
        }

        return { ok: true, posts: [], source: 'empty' }
    } catch (err: any) {
        console.error('[Blog GET] Error:', err)
        return { ok: false, error: err?.message || 'Failed to fetch posts' }
    }
})

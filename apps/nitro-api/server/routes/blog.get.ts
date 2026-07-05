import { defineEventHandler, getQuery } from 'h3'
import { getDb } from '../utils/realdb'
import blogSeedData from '../data/blog-seed.json'
import { fetchDatoCmsBlogPosts } from '../utils/datocms'

type BlogSeedPost = {
    id?: string; slug?: string; title?: string; excerpt?: string
    content?: string; tags?: string[]; date?: string; author?: string
    createdAt?: string; updatedAt?: string
    notifySubscribers?: boolean; notificationTitle?: string
    notificationBody?: string; notificationUrl?: string
}

function buildSlugVariants(slug?: string) {
    const raw = String(slug || '').trim()
    if (!raw) return []
    const variants = new Set<string>([
        raw, raw.toLowerCase(),
        raw.replace(/\s+/g, '-'), raw.toLowerCase().replace(/\s+/g, '-'),
        raw.replace(/-/g, ' '), raw.toLowerCase().replace(/-/g, ' '),
        `${raw} `, `${raw.toLowerCase()} `,
    ])
    return [...variants].filter(Boolean)
}

function toCanonicalSlug(value?: string) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-')
}

function toPublicPost(post: BlogSeedPost) {
    const { notifySubscribers, notificationTitle, notificationBody, notificationUrl, ...pub } = post
    return pub
}

function loadSeedPosts() {
    try {
        return Array.isArray(blogSeedData) ? blogSeedData.map(toPublicPost) : []
    } catch {
        return []
    }
}

/**
 * GET /api/blog
 */
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { slug } = query
    const fallbackPosts = loadSeedPosts()
    const normalizedSlug = typeof slug === 'string' ? slug.trim() : undefined
    const slugVariants = buildSlugVariants(normalizedSlug)

    try {
        // 1) Primary: @waelio/realdb (backed by @waelio/data JSON file)
        try {
            const db = await getDb()
            const blogPosts = db.collection('blogPosts')

            if (normalizedSlug) {
                let results = await blogPosts.find({
                    filter: [{ field: 'slug', op: 'eq', value: normalizedSlug }],
                })
                if (!results.length && slugVariants.length > 1) {
                    const all = await blogPosts.findAll()
                    results = all.filter((p: any) => slugVariants.includes(p.slug))
                }
                if (results[0]) {
                    return { ok: true, post: results[0], source: 'realdb', canonicalSlug: toCanonicalSlug((results[0] as any).slug) }
                }
            } else {
                const posts = await blogPosts.find({ sort: [{ field: 'date', direction: 'desc' }] })
                if (posts.length) return { ok: true, posts, source: 'realdb' }
            }
        } catch (err) {
            console.warn('[Blog GET] realdb read failed, falling back:', err instanceof Error ? err.message : 'unknown')
        }

        // 2) Fallback: DatoCMS
        try {
            if (normalizedSlug) {
                const candidates = slugVariants.length ? slugVariants : [normalizedSlug]
                for (const c of candidates) {
                    const post = await fetchDatoCmsBlogPosts({ slug: c })
                    if (post) return { ok: true, post, source: 'datocms', canonicalSlug: toCanonicalSlug((post as any)?.slug) }
                }
            } else {
                const posts = await fetchDatoCmsBlogPosts()
                if (Array.isArray(posts) && posts.length) return { ok: true, posts, source: 'datocms' }
            }
        } catch (err) {
            console.warn('[Blog GET] DatoCMS fallback failed:', err instanceof Error ? err.message : 'unknown')
        }

        // 3) Static seed fallback
        if (normalizedSlug) {
            const found = fallbackPosts.find((p: any) => slugVariants.includes(String(p?.slug || '').trim()))
            if (!found) return { ok: false, error: 'Post not found' }
            return { ok: true, post: found, source: 'seed-fallback', canonicalSlug: toCanonicalSlug((found as any)?.slug) }
        }

        if (fallbackPosts.length) {
            const sorted = [...fallbackPosts].sort((a: any, b: any) =>
                new Date(String(b?.date || b?.createdAt || 0)).getTime() - new Date(String(a?.date || a?.createdAt || 0)).getTime()
            )
            return { ok: true, posts: sorted, source: 'seed-fallback' }
        }

        return { ok: true, posts: [], source: 'empty' }
    } catch (err: any) {
        console.error('[Blog GET] Error:', err)
        return { ok: false, error: err?.message || 'Failed to fetch posts' }
    }
})

import { defineEventHandler, getQuery } from 'h3'
import { getMongoose } from '../utils/mongoose'
import { BlogPostModel } from '../models/BlogPost'
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
    notifySubscribers?: boolean
    notificationTitle?: string
    notificationBody?: string
    notificationUrl?: string
}

type PublicBlogSeedPost = Omit<
    BlogSeedPost,
    'notifySubscribers' | 'notificationTitle' | 'notificationBody' | 'notificationUrl'
>

function buildSlugVariants(slug?: string) {
    const raw = String(slug || '').trim()
    if (!raw) return []

    const variants = new Set<string>([
        raw,
        raw.toLowerCase(),
        raw.replace(/\s+/g, '-'),
        raw.toLowerCase().replace(/\s+/g, '-'),
        raw.replace(/-/g, ' '),
        raw.toLowerCase().replace(/-/g, ' '),
        `${raw} `,
        `${raw.toLowerCase()} `,
    ])

    return [...variants].filter(Boolean)
}

function toCanonicalSlug(value?: string) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

function toPublicSeedPost(post: BlogSeedPost): PublicBlogSeedPost {
    return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags,
        date: post.date,
        author: post.author,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
    }
}

function loadSeedPosts(): PublicBlogSeedPost[] {
    try {
        // Import the JSON directly so it gets bundled
        return Array.isArray(blogSeedData) ? blogSeedData.map(toPublicSeedPost) : []
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
    const slugVariants = buildSlugVariants(normalizedSlug)

    try {
        // 1) Prefer MongoDB as primary source
        try {
            await getMongoose()

            if (normalizedSlug) {
                let post = await BlogPostModel.findOne({ slug: normalizedSlug }).lean()
                if (!post && slugVariants.length) {
                    post = await BlogPostModel.findOne({ slug: { $in: slugVariants } }).lean()
                }
                if (post) {
                    return {
                        ok: true,
                        post,
                        source: 'mongodb',
                        canonicalSlug: toCanonicalSlug((post as any)?.slug),
                    }
                }
            }

            const posts = await BlogPostModel.find().sort({ date: -1 }).lean()

            if (!normalizedSlug && posts.length) {
                return { ok: true, posts, source: 'mongodb' }
            }
        } catch (error) {
            console.warn('[Blog GET] MongoDB read failed, falling back:', error instanceof Error ? error.message : 'unknown')
        }

        // 2) Fallback to DatoCMS when Prisma has no data or no match
        try {
            if (normalizedSlug) {
                const candidateSlugs = slugVariants.length ? slugVariants : [normalizedSlug]
                for (const candidate of candidateSlugs) {
                    const datocmsPost = await fetchDatoCmsBlogPosts({ slug: candidate })
                    if (datocmsPost) {
                        return {
                            ok: true,
                            post: datocmsPost,
                            source: 'datocms',
                            canonicalSlug: toCanonicalSlug((datocmsPost as any)?.slug),
                        }
                    }
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
            const fallbackPost = fallbackPosts.find((post) => {
                const postSlug = String(post?.slug || '')
                return slugVariants.includes(postSlug) || slugVariants.includes(postSlug.trim())
            })
            if (!fallbackPost) {
                return { ok: false, error: 'Post not found' }
            }
            return {
                ok: true,
                post: fallbackPost,
                source: 'seed-fallback',
                canonicalSlug: toCanonicalSlug((fallbackPost as any)?.slug),
            }
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

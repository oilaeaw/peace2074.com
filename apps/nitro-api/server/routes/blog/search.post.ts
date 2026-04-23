import { defineEventHandler, readBody } from 'h3'
import { getPrisma } from '../../utils/prisma'
import { generateEmbedding } from '../../utils/embeddings'

/**
 * POST /api/blog/search
 * Semantic vector search over blog posts using Atlas Vector Search
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

        const prisma = await getPrisma()
        if (!prisma) {
            return { ok: false, error: 'Database not available' }
        }

        const queryEmbedding = await generateEmbedding(query.trim())

        // Use MongoDB $vectorSearch aggregation via Prisma's $runCommandRaw
        const pipeline: object[] = [
            {
                $vectorSearch: {
                    index: 'blog_vector_index',
                    path: 'embedding',
                    queryVector: queryEmbedding,
                    numCandidates: Math.min(limit * 10, 150),
                    limit,
                    ...(tags?.length ? { filter: { tags: { $in: tags } } } : {}),
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    slug: 1,
                    title: 1,
                    excerpt: 1,
                    tags: 1,
                    date: 1,
                    author: 1,
                    score: { $meta: 'vectorSearchScore' },
                },
            },
        ]

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = await (prisma as any).$runCommandRaw({
            aggregate: 'BlogPost',
            pipeline,
            cursor: {},
        })

        return {
            ok: true,
            results: results?.cursor?.firstBatch ?? [],
        }
    } catch (err: unknown) {
        console.error('[Blog Search] Error:', err)
        return { ok: false, error: err instanceof Error ? err.message : 'Search failed' }
    }
})

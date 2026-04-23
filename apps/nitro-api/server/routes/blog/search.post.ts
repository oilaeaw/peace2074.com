import { defineEventHandler, readBody } from 'h3'
import { getMongoose } from '../../utils/mongoose'
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

        const conn = await getMongoose()

        const queryEmbedding = await generateEmbedding(query.trim())

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

        const results = await conn.connection.db!.collection('BlogPost').aggregate(pipeline).toArray()

        return {
            ok: true,
            results,
        }
    } catch (err: unknown) {
        console.error('[Blog Search] Error:', err)
        return { ok: false, error: err instanceof Error ? err.message : 'Search failed' }
    }
})

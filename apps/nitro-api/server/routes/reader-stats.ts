import { defineEventHandler, readBody, createError } from 'h3'
import { applyCors } from '../utils/cors'
import { readSession } from '../utils/auth'
import { recordReaderStat, getUserReaderStats, getUserReadingAnalytics } from '../utils/reader-stats'

export default defineEventHandler(async (event) => {
    applyCors(event)

    const session = await readSession(event)
    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Authentication required',
        })
    }

    // POST - Record a reading event
    if (event.method === 'POST') {
        const body = await readBody(event)
        const { sura } = body

        if (!sura || typeof sura !== 'number' || sura < 1 || sura > 114) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Valid sura number (1-114) is required',
            })
        }

        const stat = await recordReaderStat(session.id, sura)
        if (!stat) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to record reading stat',
            })
        }

        return { ok: true, stat }
    }

    // GET - Get user's reading stats
    if (event.method === 'GET') {
        const url = new URL(event.node.req.url || '', `http://${event.node.req.headers.host}`)
        const analytics = url.searchParams.get('analytics')

        if (analytics === 'true') {
            // Return aggregated analytics
            const data = await getUserReadingAnalytics(session.id)
            if (!data) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Failed to fetch analytics',
                })
            }
            return { ok: true, analytics: data }
        } else {
            // Return raw stats
            const stats = await getUserReaderStats(session.id)
            return { ok: true, stats }
        }
    }

    throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed',
    })
})

import { defineEventHandler, readBody, createError } from 'h3'
import { applyCors } from '../utils/cors'
import { readSession } from '../utils/auth'
import { getTasbeehDaily, addTasbeehDaily, addTasbeehSession } from '../utils/tasbeeh'

export default defineEventHandler(async (event) => {
    applyCors(event)

    const session = await readSession(event)

    // For GET requests, return stored data (or empty if not authenticated/no data)
    if (event.method === 'GET') {
        if (!session) {
            // Return empty data for unauthenticated users (they use local storage)
            return { data: { daily: [] } }
        }

        const userId = session.id
        const tasbeehData = await getTasbeehDaily(userId)
        return { data: { daily: tasbeehData } }
    }

    // For POST requests, store the data
    if (event.method === 'POST') {
        if (!session) {
            // Silently ignore unauthenticated POST - client should check auth first
            return { ok: false, message: 'Not authenticated - data not saved' }
        }

        const body = await readBody(event)
        const { date, total, sessions, session: sessionData } = body

        const userId = session.id

        // Save daily stats
        if (date && typeof total === 'number' && typeof sessions === 'number') {
            const success = await addTasbeehDaily(userId, { date, total, sessions })
            if (!success) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Failed to save tasbeeh data',
                })
            }
        }

        // Save session data if provided
        if (sessionData && sessionData.phraseIndex !== undefined) {
            await addTasbeehSession(userId, {
                phraseIndex: sessionData.phraseIndex,
                count: sessionData.count || 0,
                target: sessionData.target || 33,
                completedAt: new Date().toISOString()
            })
        }

        return { ok: true, message: 'Tasbeeh data saved' }
    }

    throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed',
    })
})

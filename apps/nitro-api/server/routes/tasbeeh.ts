import { defineEventHandler, readBody, createError } from 'h3'
import { applyCors } from '../utils/cors'
import { readSession } from '../utils/auth'
import { getUserTasbeeh, updateUserTasbeeh } from '../utils/users'

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
        const tasbeehData = getUserTasbeeh(userId)
        return { data: { daily: tasbeehData } }
    }

    // For POST requests, store the data in user record
    if (event.method === 'POST') {
        if (!session) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Authentication required to sync tasbeeh data',
            })
        }

        const body = await readBody(event)
        const { date, total, sessions } = body

        if (!date || typeof total !== 'number' || typeof sessions !== 'number') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid tasbeeh data. Required: date (string), total (number), sessions (number)',
            })
        }

        const userId = session.id
        const success = updateUserTasbeeh(userId, { date, total, sessions })

        if (!success) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found',
            })
        }

        return { ok: true, message: 'Tasbeeh data saved to user profile' }
    }

    throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed',
    })
})

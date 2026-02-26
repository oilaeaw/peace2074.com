import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { applyCors } from '../../utils/cors'
import { readSession } from '../../utils/auth'
import { removeBookmark } from '../../utils/profile'

export default defineEventHandler(async (event) => {
    applyCors(event)

    const session = await readSession(event)
    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Authentication required',
        })
    }

    const bookmarkId = getRouterParam(event, 'id')
    if (!bookmarkId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bookmark ID is required',
        })
    }

    // DELETE - Delete a bookmark
    if (event.method === 'DELETE') {
        const deleted = await removeBookmark(session.id, bookmarkId)
        if (!deleted) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Bookmark not found',
            })
        }

        return { ok: true, message: 'Bookmark deleted' }
    }

    throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed',
    })
})

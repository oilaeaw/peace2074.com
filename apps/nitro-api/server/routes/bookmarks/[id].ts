import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { applyCors } from '../../utils/cors'
import { readSession } from '../../utils/auth'
import { updateUserBookmark, deleteUserBookmark } from '../../utils/users'

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

    // PUT - Update a bookmark
    if (event.method === 'PUT') {
        const body = await readBody(event)
        const { bookmark } = body

        if (!bookmark || typeof bookmark !== 'string') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Bookmark string is required',
            })
        }

        const updated = updateUserBookmark(session.id, bookmarkId, bookmark)
        if (!updated) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Bookmark not found',
            })
        }

        return { ok: true, bookmark: updated }
    }

    // DELETE - Delete a bookmark
    if (event.method === 'DELETE') {
        const deleted = deleteUserBookmark(session.id, bookmarkId)
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

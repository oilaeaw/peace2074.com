import { defineEventHandler, readBody, createError } from 'h3'
import { applyCors } from '../utils/cors'
import { readSession } from '../utils/auth'
import { getBookmarks, addBookmark } from '../utils/profile'

export default defineEventHandler(async (event) => {
    applyCors(event)

    const session = await readSession(event)

    // GET - List all bookmarks for authenticated user
    if (event.method === 'GET') {
        if (!session) {
            return { bookmarks: [] }
        }

        const bookmarks = await getBookmarks(session.id)
        return { bookmarks }
    }

    // POST - Create a new bookmark
    if (event.method === 'POST') {
        if (!session) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Authentication required',
            })
        }

        const body = await readBody(event)
        const { bookmark } = body

        if (!bookmark || typeof bookmark !== 'string') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Bookmark string is required',
            })
        }

        const created = await addBookmark(session.id, bookmark)
        if (!created) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Profile not found',
            })
        }

        return { ok: true, bookmark: created }
    }

    throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed',
    })
})

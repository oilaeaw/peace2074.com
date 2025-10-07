import process from 'node:process'
import Bookmark from '@server/models/bookmark'
import { getCookie } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params
  const token = getCookie(event, 'auth_token')
  if (!token)
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    const userId = decoded.id || decoded.userId
    const doc = await Bookmark.findById(id)
    if (!doc)
      throw createError({ statusCode: 404, statusMessage: 'Bookmark not found' })
    if (String(doc.userId) !== String(userId))
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    await Bookmark.findByIdAndDelete(id)
    return { message: 'Bookmark deleted' }
  }
  catch (err) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete bookmark', data: err })
  }
})

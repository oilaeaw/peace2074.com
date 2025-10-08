import process from 'node:process'
import Bookmark from '@server/models/bookmark'
import { getCookie } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    const userId = decoded.id || decoded.userId
    const payload = {
      userId,
      bookmark: body.bookmark || body?.bookmark?.value || body,
    }
    const newBookmark = await Bookmark.create(payload)
    return newBookmark
  }
  catch (err) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create bookmark', data: err })
  }
})

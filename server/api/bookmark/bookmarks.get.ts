import process from 'node:process'
import Bookmark from '@server/models/bookmark'
import { getCookie } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export default defineEventHandler(async (event) => {
  // Get JWT from cookie
  const token = getCookie(event, 'auth_token')
  if (!token)
    return []
  let userId
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    userId = decoded.id || decoded.userId
  }
  catch (e) {
    console.error('JWT verification failed:', e)
    return []
  }
  // Only return bookmarks for this user
  const bookmarks = await Bookmark.find({ userId })
  return bookmarks
})

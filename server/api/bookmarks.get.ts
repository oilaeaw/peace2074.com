import { getCookie } from 'h3'
import jwt from 'jsonwebtoken'
import Bookmark from '../models/bookmark'

export default defineEventHandler(async (event) => {
  // Get JWT from cookie
  const token = getCookie(event, 'auth_token')
  if (!token)
    return []
  let userId
  try {
    const config = useRuntimeConfig()
    const decoded = jwt.verify(token, config.jwtSecret || 'dev_secret')
    userId = decoded.id
  }
  catch (e) {
    return []
  }
  // Only return bookmarks for this user
  return await Bookmark.find({ userId })
})

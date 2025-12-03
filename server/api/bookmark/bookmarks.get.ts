import Bookmark from '@server/models/bookmark'
import { ensureDbConnection } from '@server/utils/database'

export default defineEventHandler(async (event) => {
  await ensureDbConnection()
  const { getUserFromEvent } = await import('../../utils/auth')
  const userData = await getUserFromEvent(event) as any
  const userId = userData?.id
  if (!userId)
    return []
  // Only return bookmarks for this user
  const bookmarks = await Bookmark.find({ userId })
  return bookmarks
})

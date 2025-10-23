import Bookmark from '@server/models/bookmark'

export default defineEventHandler(async (event) => {
  const { getUserFromEvent } = await import('../../utils/auth')
  const userData = await getUserFromEvent(event)
  const userId = userData?.id
  if (!userId)
    return []
  // Only return bookmarks for this user
  const bookmarks = await Bookmark.find({ userId })
  return bookmarks
})

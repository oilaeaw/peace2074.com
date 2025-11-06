import Bookmark from '@server/models/bookmark'
import { ensureDbConnection } from '@server/utils/database'

export default defineEventHandler(async (event) => {
  await ensureDbConnection()
  const id = (event.context.params as any)?.id
  const { getUserFromEvent } = await import('../../utils/auth')
  const userData = await getUserFromEvent(event) as any
  const userId = userData?.id
  if (!userId)
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  try {
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

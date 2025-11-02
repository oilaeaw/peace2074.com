import Bookmark from '@server/models/bookmark'
import { ensureDbConnection } from '@server/utils/database'

export default defineEventHandler(async (event) => {
  await ensureDbConnection()
  const { id } = event.context.params
  const body = await useBody(event)

  try {
    const updatedBookmark = await Bookmark.findByIdAndUpdate(id, body, { new: true })
    if (!updatedBookmark) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Bookmark not found',
      })
    }
    return updatedBookmark
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update bookmark',
      data: error,
    })
  }
})

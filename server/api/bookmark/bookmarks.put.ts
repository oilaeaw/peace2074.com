import Bookmark from '../../models/bookmark'

export default defineEventHandler(async (event) => {
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

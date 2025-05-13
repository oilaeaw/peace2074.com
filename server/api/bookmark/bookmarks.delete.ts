import Bookmark from '../../models/bookmark'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params

  try {
    const deletedBookmark = await Bookmark.findByIdAndDelete(id)
    if (!deletedBookmark) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Bookmark not found',
      })
    }
    return { message: 'Bookmark deleted successfully' }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete bookmark',
      data: error,
    })
  }
})

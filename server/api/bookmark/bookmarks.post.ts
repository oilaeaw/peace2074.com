import Bookmark from '../../models/bookmark'

export default defineEventHandler(async (event) => {
  const body = await useBody(event)

  try {
    const newBookmark = await Bookmark.create(body)
    return newBookmark
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create bookmark',
      data: error,
    })
  }
})

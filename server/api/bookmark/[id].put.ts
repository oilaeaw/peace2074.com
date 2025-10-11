import Bookmark from '@server/models/bookmark'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params
  const body = await readBody(event)
  const { getUserFromEvent } = await import('../../utils/auth')
  const userData = await getUserFromEvent(event)
  const userId = userData?.id
  if (!userId)
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  try {
    const doc = await Bookmark.findById(id)
    if (!doc)
      throw createError({ statusCode: 404, statusMessage: 'Bookmark not found' })
    if (String(doc.userId) !== String(userId))
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    doc.bookmark = body.bookmark || doc.bookmark
    await doc.save()
    return doc
  }
  catch (err) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update bookmark', data: err })
  }
})

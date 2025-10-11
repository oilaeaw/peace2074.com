import Bookmark from '~~/server/models/bookmark'

export default defineEventHandler(async (event) => {
  const { getUserFromEvent } = await import('../../utils/auth')
  const body = await readBody(event)
  const userData = await getUserFromEvent(event)
  const userId = userData?.id
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }
  try {
    const payload = {
      userId,
      bookmark: body.bookmark || body?.bookmark?.value || body,
    }
    const newBookmark = await Bookmark.create(payload)
    return newBookmark
  }
  catch (err) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create bookmark', data: err })
  }
})

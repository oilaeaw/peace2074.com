import Bookmark from '@server/models/bookmark'

export default defineEventHandler(async (event) => {
  // Simple wrapper so front-end can call /api/bookmarks (plural)
  // and we reuse the same Bookmark model used by /api/bookmark/bookmarks
  try {
    const items = await Bookmark.find()
    return items
  }
  catch (err: any) {
    event.node.res.statusCode = 500
    return { error: err?.message || 'Failed to fetch bookmarks' }
  }
})

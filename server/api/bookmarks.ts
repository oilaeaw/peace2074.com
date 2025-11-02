import Bookmark from '@server/models/bookmark'
import { ensureDbConnection } from '@server/utils/database'

export default defineEventHandler(async (event) => {
  // Simple wrapper so front-end can call /api/bookmarks (plural)
  // and we reuse the same Bookmark model used by /api/bookmark/bookmarks
  try {
    await ensureDbConnection()
    const items = await Bookmark.find()
    return items
  }
  catch (err: any) {
    event.node.res.statusCode = 500
    return { error: err?.message || 'Failed to fetch bookmarks' }
  }
})

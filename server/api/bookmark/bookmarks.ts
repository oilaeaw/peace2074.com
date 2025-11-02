import Bookmark from '@server/models/bookmark'
import { ensureDbConnection } from '@server/utils/database'

export default defineEventHandler(async (_event) => {
  await ensureDbConnection()
  return await Bookmark.find()
})

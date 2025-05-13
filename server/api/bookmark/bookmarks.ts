import Bookmark from '../../models/bookmark'

export default defineEventHandler(async (_event) => {
  return await Bookmark.find()
})

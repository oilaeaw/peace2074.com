import { d as defineEventHandler, c as createError } from '../../../nitro/nitro.mjs';
import Bookmark from '@server/models/bookmark';
import { ensureDbConnection } from '@server/utils/database';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '#auth';
import '@server/utils/abilities';

const bookmarks_delete = defineEventHandler(async (event) => {
  var _a;
  await ensureDbConnection();
  const id = (_a = event.context.params) == null ? void 0 : _a.id;
  try {
    const deletedBookmark = await Bookmark.findByIdAndDelete(id);
    if (!deletedBookmark) {
      throw createError({
        statusCode: 404,
        statusMessage: "Bookmark not found"
      });
    }
    return { message: "Bookmark deleted successfully" };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete bookmark",
      data: error
    });
  }
});

export { bookmarks_delete as default };
//# sourceMappingURL=bookmarks.delete.mjs.map

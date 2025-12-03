import { d as defineEventHandler, r as readBody, c as createError } from '../../../nitro/nitro.mjs';
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

const bookmarks_put = defineEventHandler(async (event) => {
  var _a;
  await ensureDbConnection();
  const id = (_a = event.context.params) == null ? void 0 : _a.id;
  const body = await readBody(event);
  try {
    const updatedBookmark = await Bookmark.findByIdAndUpdate(id, body, { new: true });
    if (!updatedBookmark) {
      throw createError({
        statusCode: 404,
        statusMessage: "Bookmark not found"
      });
    }
    return updatedBookmark;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update bookmark",
      data: error
    });
  }
});

export { bookmarks_put as default };
//# sourceMappingURL=bookmarks.put.mjs.map

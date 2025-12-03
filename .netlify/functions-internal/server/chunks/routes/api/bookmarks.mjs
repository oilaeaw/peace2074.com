import { d as defineEventHandler } from '../../nitro/nitro.mjs';
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

const bookmarks = defineEventHandler(async (event) => {
  try {
    await ensureDbConnection();
    const items = await Bookmark.find();
    return items;
  } catch (err) {
    event.node.res.statusCode = 500;
    return { error: (err == null ? void 0 : err.message) || "Failed to fetch bookmarks" };
  }
});

export { bookmarks as default };
//# sourceMappingURL=bookmarks.mjs.map

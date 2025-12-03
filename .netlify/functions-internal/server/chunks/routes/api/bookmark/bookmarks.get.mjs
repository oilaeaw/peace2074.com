import { d as defineEventHandler } from '../../../nitro/nitro.mjs';
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

const bookmarks_get = defineEventHandler(async (event) => {
  await ensureDbConnection();
  const { getUserFromEvent } = await import('../../../_/auth.mjs');
  const userData = await getUserFromEvent(event);
  const userId = userData == null ? void 0 : userData.id;
  if (!userId)
    return [];
  const bookmarks = await Bookmark.find({ userId });
  return bookmarks;
});

export { bookmarks_get as default };
//# sourceMappingURL=bookmarks.get.mjs.map

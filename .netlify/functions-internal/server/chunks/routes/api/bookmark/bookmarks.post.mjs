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

const bookmarks_post = defineEventHandler(async (event) => {
  var _a;
  await ensureDbConnection();
  const { getUserFromEvent } = await import('../../../_/auth.mjs');
  const body = await readBody(event);
  const userData = await getUserFromEvent(event);
  const userId = userData == null ? void 0 : userData.id;
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  }
  try {
    const payload = {
      userId,
      bookmark: body.bookmark || ((_a = body == null ? void 0 : body.bookmark) == null ? void 0 : _a.value) || body
    };
    const newBookmark = await Bookmark.create(payload);
    return newBookmark;
  } catch (err) {
    throw createError({ statusCode: 500, statusMessage: "Failed to create bookmark", data: err });
  }
});

export { bookmarks_post as default };
//# sourceMappingURL=bookmarks.post.mjs.map

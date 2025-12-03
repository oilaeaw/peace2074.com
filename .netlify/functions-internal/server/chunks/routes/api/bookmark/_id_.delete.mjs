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

const _id__delete = defineEventHandler(async (event) => {
  var _a;
  await ensureDbConnection();
  const id = (_a = event.context.params) == null ? void 0 : _a.id;
  const { getUserFromEvent } = await import('../../../_/auth.mjs');
  const userData = await getUserFromEvent(event);
  const userId = userData == null ? void 0 : userData.id;
  if (!userId)
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  try {
    const doc = await Bookmark.findById(id);
    if (!doc)
      throw createError({ statusCode: 404, statusMessage: "Bookmark not found" });
    if (String(doc.userId) !== String(userId))
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    await Bookmark.findByIdAndDelete(id);
    return { message: "Bookmark deleted" };
  } catch (err) {
    throw createError({ statusCode: 500, statusMessage: "Failed to delete bookmark", data: err });
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

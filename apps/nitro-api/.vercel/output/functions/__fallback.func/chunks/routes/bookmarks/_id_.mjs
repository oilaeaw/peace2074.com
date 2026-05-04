import { d as defineEventHandler, c as createError, a as getRouterParam } from '../../nitro/nitro.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import { a as readSession } from '../../_/auth.mjs';
import { r as removeBookmark } from '../../_/profile.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const _id_ = defineEventHandler(async (event) => {
  applyCors(event);
  const session = await readSession(event);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required"
    });
  }
  const bookmarkId = getRouterParam(event, "id");
  if (!bookmarkId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bookmark ID is required"
    });
  }
  if (event.method === "DELETE") {
    const deleted = await removeBookmark(session.id, bookmarkId);
    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: "Bookmark not found"
      });
    }
    return { ok: true, message: "Bookmark deleted" };
  }
  throw createError({
    statusCode: 405,
    statusMessage: "Method not allowed"
  });
});

export { _id_ as default };
//# sourceMappingURL=_id_.mjs.map

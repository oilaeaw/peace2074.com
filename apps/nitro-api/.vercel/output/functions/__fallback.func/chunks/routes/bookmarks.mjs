import { d as defineEventHandler, c as createError, r as readBody } from '../nitro/nitro.mjs';
import { a as applyCors } from '../_/cors.mjs';
import { a as readSession } from '../_/auth.mjs';
import { a as getBookmarks, b as addBookmark } from '../_/profile.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const bookmarks = defineEventHandler(async (event) => {
  applyCors(event);
  const session = await readSession(event);
  if (event.method === "GET") {
    if (!session) {
      return { bookmarks: [] };
    }
    const bookmarks = await getBookmarks(session.id);
    return { bookmarks };
  }
  if (event.method === "POST") {
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required"
      });
    }
    const body = await readBody(event);
    const { bookmark } = body;
    if (!bookmark || typeof bookmark !== "string") {
      throw createError({
        statusCode: 400,
        statusMessage: "Bookmark string is required"
      });
    }
    const created = await addBookmark(session.id, bookmark);
    if (!created) {
      throw createError({
        statusCode: 404,
        statusMessage: "Profile not found"
      });
    }
    return { ok: true, bookmark: created };
  }
  throw createError({
    statusCode: 405,
    statusMessage: "Method not allowed"
  });
});

export { bookmarks as default };
//# sourceMappingURL=bookmarks.mjs.map

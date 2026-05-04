import { d as defineEventHandler, b as getQuery, c as createError, s as sendRedirect } from '../../nitro/nitro.mjs';
import { b as requireSecrets, c as createSession } from '../../_/auth.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import { cleanExpiredLinks, pendingLinks } from './magic.store.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const magic_get = defineEventHandler(async (event) => {
  applyCors(event);
  const { token = "" } = getQuery(event);
  const t = String(token || "");
  if (!t) {
    throw createError({ statusCode: 400, statusMessage: "Missing token" });
  }
  requireSecrets({ needPasscode: false });
  cleanExpiredLinks();
  const entry = pendingLinks.get(t);
  if (!entry) {
    throw createError({ statusCode: 401, statusMessage: "Invalid or expired link" });
  }
  if (Date.now() > entry.exp) {
    pendingLinks.delete(t);
    throw createError({ statusCode: 401, statusMessage: "Link expired" });
  }
  pendingLinks.delete(t);
  const user = { id: entry.email, role: "user", name: entry.email };
  createSession(event, user, "magic");
  return sendRedirect(event, "/", 302);
});

export { magic_get as default };
//# sourceMappingURL=magic.get.mjs.map

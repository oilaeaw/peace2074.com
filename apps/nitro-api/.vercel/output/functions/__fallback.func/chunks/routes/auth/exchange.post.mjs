import { d as defineEventHandler, r as readBody, c as createError } from '../../nitro/nitro.mjs';
import { b as requireSecrets, v as verify, c as createSession } from '../../_/auth.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const exchange_post = defineEventHandler(async (event) => {
  applyCors(event);
  const body = await readBody(event).catch(() => ({}));
  const token = String((body == null ? void 0 : body.token) || "");
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: "Missing token" });
  }
  const { secret } = requireSecrets({ needPasscode: false });
  const payload = verify(token, secret);
  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: "Invalid or expired token" });
  }
  createSession(event, {
    id: payload.id,
    role: payload.role,
    name: payload.name
  }, "apple");
  return { success: true };
});

export { exchange_post as default };
//# sourceMappingURL=exchange.post.mjs.map

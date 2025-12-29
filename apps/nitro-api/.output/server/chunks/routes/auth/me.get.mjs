import { d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
import { r as requireSecrets, b as readSession } from '../../_/auth.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const me_get = defineEventHandler((event) => {
  applyCors(event);
  requireSecrets();
  const session = readSession(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const { exp, ...user } = session;
  return { ok: true, user };
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map

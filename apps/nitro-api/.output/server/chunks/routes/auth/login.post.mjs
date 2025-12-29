import { d as defineEventHandler, r as readBody, c as createError } from '../../nitro/nitro.mjs';
import { r as requireSecrets, c as createSession } from '../../_/auth.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const login_post = defineEventHandler(async (event) => {
  const body = await readBody(event) || {};
  const provided = (body.passcode || "").trim();
  const { passcode } = requireSecrets();
  if (!provided || provided !== passcode) {
    throw createError({ statusCode: 401, statusMessage: "Invalid credentials" });
  }
  const user = { id: "admin", role: "admin", name: "Admin" };
  createSession(event, user);
  return { ok: true, user };
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map

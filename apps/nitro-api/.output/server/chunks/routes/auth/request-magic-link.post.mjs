import { d as defineEventHandler, r as readBody } from '../../nitro/nitro.mjs';
import { randomBytes } from 'node:crypto';
import { r as requireSecrets } from '../../_/auth.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import { pendingLinks } from './magic.store.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const LINK_TTL_MS = 10 * 60 * 1e3;
const requestMagicLink_post = defineEventHandler(async (event) => {
  applyCors(event);
  const body = await readBody(event) || {};
  const email = (body.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Valid email required" };
  }
  requireSecrets({ needPasscode: false });
  const token = randomBytes(24).toString("base64url");
  const exp = Date.now() + LINK_TTL_MS;
  pendingLinks.set(token, { email, exp });
  const host = event.node.req.headers.origin || (event.node.req.headers.host ? `http://${event.node.req.headers.host}` : "");
  const link = `${host}/api/auth/magic?token=${token}`;
  return { ok: true, debugLink: link, expiresIn: LINK_TTL_MS / 1e3 };
});

export { requestMagicLink_post as default };
//# sourceMappingURL=request-magic-link.post.mjs.map

import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import { d as clearSessionCookie } from '../../_/auth.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const logout_post = defineEventHandler((event) => {
  applyCors(event);
  clearSessionCookie(event);
  return { ok: true };
});

export { logout_post as default };
//# sourceMappingURL=logout.post.mjs.map

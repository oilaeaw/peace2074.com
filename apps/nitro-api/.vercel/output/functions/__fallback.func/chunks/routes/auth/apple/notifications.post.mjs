import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const notifications_post = defineEventHandler(async (event) => {
  let body;
  try {
    body = await readBody(event);
  } catch {
    body = {};
  }
  const payload = body == null ? void 0 : body.payload;
  console.log("[apple/notifications] Received notification, payload:", payload);
  return { received: true };
});

export { notifications_post as default };
//# sourceMappingURL=notifications.post.mjs.map

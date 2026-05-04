import { d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
import { a as readSession } from '../../_/auth.mjs';
import { g as getProfile } from '../../_/profile.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const settings_get = defineEventHandler(async (event) => {
  const session = readSession(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const profile = await getProfile(session.id);
  return {
    ok: true,
    settings: (profile == null ? void 0 : profile.settings) || {}
  };
});

export { settings_get as default };
//# sourceMappingURL=settings.get.mjs.map

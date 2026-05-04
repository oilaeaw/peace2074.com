import { d as defineEventHandler, c as createError, r as readBody } from '../../nitro/nitro.mjs';
import { a as readSession } from '../../_/auth.mjs';
import { g as getProfile, u as updateProfile } from '../../_/profile.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
const settings_post = defineEventHandler(async (event) => {
  const session = readSession(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const body = await readBody(event);
  const incomingSettings = isRecord(body == null ? void 0 : body.settings) ? body.settings : {};
  const existingProfile = await getProfile(session.id);
  const existingSettings = isRecord(existingProfile == null ? void 0 : existingProfile.settings) ? existingProfile.settings : {};
  const mergedSettings = {
    ...existingSettings,
    ...incomingSettings,
    quran: {
      ...isRecord(existingSettings.quran) ? existingSettings.quran : {},
      ...isRecord(incomingSettings.quran) ? incomingSettings.quran : {}
    }
  };
  const profile = await updateProfile(session.id, { settings: mergedSettings });
  return {
    ok: true,
    settings: (profile == null ? void 0 : profile.settings) || mergedSettings
  };
});

export { settings_post as default };
//# sourceMappingURL=settings.post.mjs.map

import { d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
import { b as requireSecrets, a as readSession } from '../../_/auth.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import { g as getProfile } from '../../_/profile.mjs';
import { b as findUserById, r as resolveUserPermissions } from '../../_/users.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '../../_/User.mjs';
import '../../_/ReaderStats.mjs';
import '../../_/DeployLike.mjs';
import '../../_/BlogLike.mjs';
import '../../_/QuranProgress.mjs';
import '../../_/Tasbeeh.mjs';

const me_get = defineEventHandler(async (event) => {
  applyCors(event);
  requireSecrets({ needPasscode: false });
  const session = readSession(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const dbUser = await findUserById(session.id);
  if (!dbUser) {
    const { exp, ...user } = session;
    return {
      ok: true,
      user: {
        ...user,
        username: session.name || session.id,
        email: "",
        first_name: session.name || session.id,
        last_name: "",
        avatar_url: null,
        permissions: resolveUserPermissions({ role: session.role, permissions: [] })
      }
    };
  }
  const profile = await getProfile(dbUser.id);
  return {
    ok: true,
    user: {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
      first_name: (profile == null ? void 0 : profile.first_name) || dbUser.first_name || dbUser.username,
      last_name: (profile == null ? void 0 : profile.last_name) || dbUser.last_name || "",
      avatar_url: (profile == null ? void 0 : profile.avatar_url) || dbUser.avatar_url || null,
      permissions: resolveUserPermissions(dbUser)
    }
  };
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map

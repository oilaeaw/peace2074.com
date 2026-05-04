import { d as defineEventHandler, a as getRouterParam, r as readBody } from '../../../nitro/nitro.mjs';
import { a as readSession } from '../../../_/auth.mjs';
import { a as updateUserRoleAndPermissions } from '../../../_/users.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '../../../_/User.mjs';
import '../../../_/ReaderStats.mjs';
import '../../../_/DeployLike.mjs';
import '../../../_/BlogLike.mjs';
import '../../../_/QuranProgress.mjs';
import '../../../_/Tasbeeh.mjs';
import '../../../_/profile.mjs';

const VALID_ROLES = ["user", "editor", "admin"];
const _id__patch = defineEventHandler(async (event) => {
  const session = readSession(event);
  if (!session || session.role !== "admin") {
    return { ok: false, error: "Forbidden" };
  }
  const userId = getRouterParam(event, "id");
  if (!userId) {
    return { ok: false, error: "Missing user id" };
  }
  try {
    const body = await readBody(event);
    if (body.role && !VALID_ROLES.includes(body.role)) {
      return { ok: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` };
    }
    if (!body.role && !body.permissions) {
      return { ok: false, error: "Nothing to update. Provide role or permissions." };
    }
    const updated = await updateUserRoleAndPermissions(userId, {
      role: body.role,
      permissions: body.permissions
    });
    if (!updated) {
      return { ok: false, error: "User not found" };
    }
    return { ok: true, user: updated };
  } catch (err) {
    console.error("[admin/users PATCH] Error:", err);
    return { ok: false, error: (err == null ? void 0 : err.message) || "Failed to update user" };
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map

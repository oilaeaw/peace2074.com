import { d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
import { r as requireAuth } from '../../_/auth.mjs';
import { g as getAllUsers } from '../../_/users.mjs';
import { i as isPasswordHashed } from '../../_/password.mjs';
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
import '../../_/profile.mjs';
import 'node:util';

const passwordStatus_get = defineEventHandler(async (event) => {
  const session = requireAuth(event);
  if (session.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access required"
    });
  }
  try {
    const users = await getAllUsers();
    const status = users.map((user) => ({
      userId: user.id,
      username: user.username,
      passwordFormat: isPasswordHashed(user.password) ? "hashed" : "plaintext",
      passwordPreview: user.password.substring(0, 20) + "...",
      passwordLength: user.password.length
    }));
    return {
      ok: true,
      users: status,
      summary: {
        total: users.length,
        hashed: status.filter((u) => u.passwordFormat === "hashed").length,
        plaintext: status.filter((u) => u.passwordFormat === "plaintext").length
      }
    };
  } catch (error) {
    return {
      ok: false,
      error: (error == null ? void 0 : error.message) || "Failed to check password status"
    };
  }
});

export { passwordStatus_get as default };
//# sourceMappingURL=password-status.get.mjs.map

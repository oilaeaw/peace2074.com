import { d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
import { g as getAllUsers, u as updateUserPassword } from '../../_/users.mjs';
import { i as isPasswordHashed, h as hashPassword } from '../../_/password.mjs';
import { r as requireAuth } from '../../_/auth.mjs';
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

const migratePasswords_post = defineEventHandler(async (event) => {
  const session = requireAuth(event);
  if (session.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access required"
    });
  }
  try {
    const users = await getAllUsers();
    const results = [];
    for (const user of users) {
      if (!user.password) {
        results.push({
          userId: user.id,
          username: user.username,
          status: "skipped",
          reason: "no password"
        });
        continue;
      }
      if (isPasswordHashed(user.password)) {
        results.push({
          userId: user.id,
          username: user.username,
          status: "skipped",
          reason: "already hashed"
        });
        continue;
      }
      const hashedPassword = await hashPassword(user.password);
      const updated = await updateUserPassword(user.id, hashedPassword);
      results.push({
        userId: user.id,
        username: user.username,
        status: updated ? "migrated" : "failed",
        passwordPreview: user.password.substring(0, 5) + "***"
      });
    }
    const migrated = results.filter((r) => r.status === "migrated").length;
    const skipped = results.filter((r) => r.status === "skipped").length;
    const failed = results.filter((r) => r.status === "failed").length;
    return {
      ok: true,
      summary: {
        total: users.length,
        migrated,
        skipped,
        failed
      },
      details: results
    };
  } catch (error) {
    console.error("[admin/migrate-passwords] Error:", error);
    return {
      ok: false,
      error: (error == null ? void 0 : error.message) || "Migration failed"
    };
  }
});

export { migratePasswords_post as default };
//# sourceMappingURL=migrate-passwords.post.mjs.map

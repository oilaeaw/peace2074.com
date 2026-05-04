import { d as defineEventHandler, c as createError, r as readBody } from '../../nitro/nitro.mjs';
import { a as readSession } from '../../_/auth.mjs';
import { b as findUserById, u as updateUserPassword } from '../../_/users.mjs';
import { v as verifyPassword, h as hashPassword } from '../../_/password.mjs';
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

const changePassword_post = defineEventHandler(async (event) => {
  const session = await readSession(event);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized - Please login first"
    });
  }
  const body = await readBody(event) || {};
  const currentPassword = (body.currentPassword || "").trim();
  const newPassword = (body.newPassword || "").trim();
  const confirmPassword = (body.confirmPassword || "").trim();
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: "All fields are required"
    });
  }
  if (newPassword !== confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: "New passwords do not match"
    });
  }
  if (newPassword.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: "New password must be at least 8 characters"
    });
  }
  const user = await findUserById(session.id);
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found"
    });
  }
  const isValid = await verifyPassword(currentPassword, user.password);
  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Current password is incorrect"
    });
  }
  const hashedPassword = await hashPassword(newPassword);
  await updateUserPassword(user.id, hashedPassword);
  return {
    ok: true,
    message: "Password changed successfully"
  };
});

export { changePassword_post as default };
//# sourceMappingURL=change-password.post.mjs.map

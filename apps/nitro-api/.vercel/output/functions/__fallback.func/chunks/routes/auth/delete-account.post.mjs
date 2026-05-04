import { d as defineEventHandler, c as createError, r as readBody, j as getCollection } from '../../nitro/nitro.mjs';
import { b as requireSecrets, a as readSession, d as clearSessionCookie } from '../../_/auth.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import { d as deleteUserPasskeyStorage } from '../../_/passkeys.mjs';
import { v as verifyPassword } from '../../_/password.mjs';
import { b as findUserById, d as deleteUserById } from '../../_/users.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '@simplewebauthn/server';
import '../../_/profile.mjs';
import 'node:util';
import '../../_/User.mjs';
import '../../_/ReaderStats.mjs';
import '../../_/DeployLike.mjs';
import '../../_/BlogLike.mjs';
import '../../_/QuranProgress.mjs';
import '../../_/Tasbeeh.mjs';

async function cleanupPushSubscriptions(identifiers) {
  const uniqueIdentifiers = [...new Set(
    identifiers.map((value) => value.trim()).filter(Boolean)
  )];
  if (!uniqueIdentifiers.length) {
    return;
  }
  const subscriptions = await getCollection("push_subscriptions");
  for (const identifier of uniqueIdentifiers) {
    const matches = await subscriptions.find({ userId: identifier }).toArray();
    for (const match of matches) {
      if (!(match == null ? void 0 : match._id)) continue;
      await subscriptions.deleteOne({ _id: match._id });
    }
  }
}
const deleteAccount_post = defineEventHandler(async (event) => {
  applyCors(event);
  requireSecrets({ needPasscode: false });
  const session = readSession(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const body = await readBody(event) || {};
  const confirmText = (body.confirmText || "").trim();
  const currentPassword = (body.currentPassword || "").trim();
  const user = await findUserById(session.id);
  if (!user) {
    clearSessionCookie(event);
    return {
      ok: true,
      message: "Account already deleted"
    };
  }
  if (!confirmText) {
    throw createError({
      statusCode: 400,
      statusMessage: "Confirmation text is required"
    });
  }
  if (confirmText !== user.username && confirmText !== user.email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Confirmation text must match your username or email"
    });
  }
  const requiresPassword = Boolean(user.password && user.password.trim());
  if (requiresPassword) {
    if (!currentPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: "Current password is required for this account"
      });
    }
    const passwordIsValid = await verifyPassword(currentPassword, user.password);
    if (!passwordIsValid) {
      throw createError({
        statusCode: 401,
        statusMessage: "Current password is incorrect"
      });
    }
  }
  const deleted = await deleteUserById(user.id);
  if (!deleted) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete account"
    });
  }
  try {
    await deleteUserPasskeyStorage(user.id);
  } catch (error) {
    console.warn("[auth/delete-account] Failed to clean passkey storage", error);
  }
  try {
    await cleanupPushSubscriptions([user.id, user.email]);
  } catch (error) {
    console.warn("[auth/delete-account] Failed to clean push subscriptions", error);
  }
  clearSessionCookie(event);
  return {
    ok: true,
    message: "Account deleted successfully"
  };
});

export { deleteAccount_post as default };
//# sourceMappingURL=delete-account.post.mjs.map

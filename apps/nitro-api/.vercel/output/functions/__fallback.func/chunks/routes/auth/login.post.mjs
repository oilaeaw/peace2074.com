import { d as defineEventHandler, r as readBody, c as createError } from '../../nitro/nitro.mjs';
import { b as requireSecrets, c as createSession } from '../../_/auth.mjs';
import { e as findUserByUsername, u as updateUserPassword } from '../../_/users.mjs';
import { g as getProfile } from '../../_/profile.mjs';
import { v as verifyPassword, i as isPasswordHashed, h as hashPassword } from '../../_/password.mjs';
import { a as applyCors } from '../../_/cors.mjs';
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
import 'node:util';

const login_post = defineEventHandler(async (event) => {
  applyCors(event);
  try {
    const body = await readBody(event) || {};
    const username = (body.username || "").trim();
    const password = (body.password || "").trim();
    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Username and password are required"
      });
    }
    requireSecrets({ needPasscode: false });
    const user = await findUserByUsername(username);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid username or password"
      });
    }
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid username or password"
      });
    }
    if (!isPasswordHashed(user.password)) {
      const hashedPassword = await hashPassword(password);
      await updateUserPassword(user.id, hashedPassword);
      console.log(`[auth/login] Migrated password to hashed format for user: ${username}`);
    }
    const profile = await getProfile(user.id);
    const displayName = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || user.username : user.username;
    const sessionUser = {
      id: user.id,
      role: user.role,
      name: displayName
    };
    createSession(event, sessionUser, "password");
    return {
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        first_name: (profile == null ? void 0 : profile.first_name) || user.username,
        last_name: (profile == null ? void 0 : profile.last_name) || "",
        avatar_url: (profile == null ? void 0 : profile.avatar_url) || null,
        permissions: user.permissions || []
      }
    };
  } catch (error) {
    if (error == null ? void 0 : error.statusCode) throw error;
    console.error("[auth/login] unexpected error", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Login server failure: ${(error == null ? void 0 : error.message) || "unknown error"}`
    });
  }
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map

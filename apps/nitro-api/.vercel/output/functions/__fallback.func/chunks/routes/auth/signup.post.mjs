import { d as defineEventHandler, r as readBody, c as createError } from '../../nitro/nitro.mjs';
import { e as findUserByUsername, h as findUserByEmail, i as addUser } from '../../_/users.mjs';
import { c as createProfile } from '../../_/profile.mjs';
import { h as hashPassword } from '../../_/password.mjs';
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

const signup_post = defineEventHandler(async (event) => {
  applyCors(event);
  const body = await readBody(event) || {};
  const username = (body.username || "").trim();
  const email = (body.email || "").trim();
  const password = (body.password || "").trim();
  const first_name = (body.first_name || username).trim();
  const last_name = (body.last_name || "").trim();
  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username, email, and password are required"
    });
  }
  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password must be at least 8 characters"
    });
  }
  if (await findUserByUsername(username)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Username already taken"
    });
  }
  if (await findUserByEmail(email)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Email already registered"
    });
  }
  const hashedPassword = await hashPassword(password);
  const defaultPermissions = [
    { action: "read", subject: "category" },
    { action: "read", subject: "post" },
    { action: "create", subject: "user" },
    { action: "read", subject: "user" },
    { action: "update", subject: "user" },
    { action: "read", subject: "chat" }
    // New users can access chat
  ];
  const userId = `user_${Date.now()}`;
  const newUser = {
    id: userId,
    username,
    email,
    password: hashedPassword,
    role: "user",
    permissions: defaultPermissions
  };
  await addUser(newUser);
  await createProfile({
    userId,
    first_name,
    last_name,
    settings: {},
    tasbeeh_summary: { total: 0, sessions: 0 }
  });
  return {
    ok: true,
    message: "Account created successfully"
  };
});

export { signup_post as default };
//# sourceMappingURL=signup.post.mjs.map

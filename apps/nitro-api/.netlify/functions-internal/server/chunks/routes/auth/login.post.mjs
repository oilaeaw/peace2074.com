import { d as defineEventHandler, r as readBody, c as createError } from '../../nitro/nitro.mjs';
import { c as createSession } from '../../_/auth.mjs';
import { a as findUserByUsername } from '../../_/users.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const login_post = defineEventHandler(async (event) => {
  const body = await readBody(event) || {};
  const username = (body.username || "").trim();
  const password = (body.password || "").trim();
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username and password are required"
    });
  }
  const user = findUserByUsername(username);
  if (!user || user.password !== password) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid username or password"
    });
  }
  const sessionUser = {
    id: user.id,
    role: user.role,
    name: `${user.first_name} ${user.last_name}`
  };
  createSession(event, sessionUser);
  return {
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    }
  };
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map

import { d as defineEventHandler, u as useRuntimeConfig, s as sendError, c as createError, r as readBody } from '../../../nitro/nitro.mjs';
import User from '@server/models/user';
import { ensureDbConnection } from '@server/utils/database';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '#auth';
import '@server/utils/abilities';

const makeAdmin = defineEventHandler(async (event) => {
  try {
    await ensureDbConnection();
  } catch {
  }
  const { nodeEnv } = useRuntimeConfig();
  if (nodeEnv === "production") return sendError(event, createError({ statusCode: 403, statusMessage: "disabled in production" }));
  const body = await readBody(event);
  const identifier = body == null ? void 0 : body.identifier;
  if (!identifier || typeof identifier !== "string") return sendError(event, createError({ statusCode: 400, statusMessage: "identifier required" }));
  const isEmail = identifier.includes("@");
  const query = isEmail ? { email: identifier } : { username: identifier };
  const U = User;
  const user = await U.findOne(query);
  if (!user) return sendError(event, createError({ statusCode: 404, statusMessage: "user not found" }));
  user.role = "admin";
  await user.save();
  return { ok: true, user: { id: user._id, username: user.username, email: user.email, role: user.role } };
});

export { makeAdmin as default };
//# sourceMappingURL=make-admin.mjs.map

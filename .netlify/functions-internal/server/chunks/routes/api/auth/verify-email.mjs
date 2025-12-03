import { d as defineEventHandler, a as getQuery, s as sendError, c as createError } from '../../../nitro/nitro.mjs';
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

const verifyEmail = defineEventHandler(async (event) => {
  await ensureDbConnection();
  const { token } = getQuery(event);
  if (!token || typeof token !== "string") {
    return sendError(event, createError({ statusCode: 400, statusMessage: "Invalid or missing token." }));
  }
  const U = User;
  const user = await U.findOne({ verificationToken: token, verificationTokenExpires: { $gt: /* @__PURE__ */ new Date() } });
  if (!user) {
    return sendError(event, createError({ statusCode: 400, statusMessage: "Invalid or expired verification token." }));
  }
  user.verified = true;
  user.verificationToken = null;
  user.verificationTokenExpires = null;
  await user.save();
  return { message: "Email verified successfully!" };
});

export { verifyEmail as default };
//# sourceMappingURL=verify-email.mjs.map

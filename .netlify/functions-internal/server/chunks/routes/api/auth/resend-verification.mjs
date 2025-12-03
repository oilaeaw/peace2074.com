import { d as defineEventHandler, r as readBody, s as sendError, c as createError } from '../../../nitro/nitro.mjs';
import nodeCrypto from 'node:crypto';
import User from '@server/models/user';
import { sendVerificationEmail } from '@server/utils/sendVerificationEmail';
import { ensureDbConnection } from '@server/utils/database';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mongoose';
import '#auth';
import '@server/utils/abilities';

const resendVerification = defineEventHandler(async (event) => {
  await ensureDbConnection();
  const body = await readBody(event);
  const { email } = body;
  if (!email) {
    return sendError(event, createError({ statusCode: 400, statusMessage: "Email is required." }));
  }
  const U = User;
  const user = await U.findOne({ email });
  if (!user) {
    return sendError(event, createError({ statusCode: 404, statusMessage: "User not found." }));
  }
  if (user.verified) {
    return sendError(event, createError({ statusCode: 400, statusMessage: "User already verified." }));
  }
  const verificationToken = nodeCrypto.randomBytes(32).toString("hex");
  const verificationTokenExpires = new Date(Date.now() + 1e3 * 60 * 60);
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = verificationTokenExpires;
  await user.save();
  await sendVerificationEmail(email, verificationToken);
  return { message: "Verification email resent." };
});

export { resendVerification as default };
//# sourceMappingURL=resend-verification.mjs.map

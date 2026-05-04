import { d as defineEventHandler, r as readBody, c as createError } from '../../nitro/nitro.mjs';
import { b as requireSecrets, c as createSession } from '../../_/auth.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import { otpStore } from './request-otp.post.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'nodemailer';

const verifyOtp_post = defineEventHandler(async (event) => {
  applyCors(event);
  const body = await readBody(event) || {};
  const email = (body.email || "").trim().toLowerCase();
  const code = (body.code || "").trim();
  if (!email || !email.includes("@")) {
    throw createError({ statusCode: 400, statusMessage: "Valid email required" });
  }
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: "Code required" });
  }
  requireSecrets({ needPasscode: false });
  const entry = otpStore.get(email);
  if (!entry || entry.code !== code) {
    throw createError({ statusCode: 401, statusMessage: "Invalid or expired code" });
  }
  if (Date.now() > entry.exp) {
    otpStore.delete(email);
    throw createError({ statusCode: 401, statusMessage: "Code expired" });
  }
  otpStore.delete(email);
  const user = { id: email, role: "user", name: email };
  createSession(event, user, "otp");
  return { ok: true, user };
});

export { verifyOtp_post as default };
//# sourceMappingURL=verify-otp.post.mjs.map

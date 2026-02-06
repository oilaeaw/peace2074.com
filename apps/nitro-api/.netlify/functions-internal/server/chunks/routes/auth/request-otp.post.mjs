import { d as defineEventHandler, r as readBody } from '../../nitro/nitro.mjs';
import { randomInt } from 'node:crypto';
import nodemailer from 'nodemailer';
import { b as requireSecrets } from '../../_/auth.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';

const otpStore = /* @__PURE__ */ new Map();
const OTP_TTL_MS = 10 * 60 * 1e3;
function boolFromEnv(value, fallback = false) {
  if (value === void 0) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}
function cleanExpired() {
  const now = Date.now();
  for (const [email, entry] of otpStore.entries()) {
    if (entry.exp <= now) otpStore.delete(email);
  }
}
const requestOtp_post = defineEventHandler(async (event) => {
  applyCors(event);
  const body = await readBody(event) || {};
  const email = (body.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Valid email required" };
  }
  requireSecrets({ needPasscode: false });
  cleanExpired();
  const code = String(randomInt(1e5, 999999));
  otpStore.set(email, { code, exp: Date.now() + OTP_TTL_MS });
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const secure = boolFromEnv(process.env.SMTP_SECURE, port === 465);
  const canSend = host && port && from;
  if (canSend) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : void 0
      });
      await transporter.sendMail({
        from,
        to: email,
        subject: "Your login code",
        text: `Your one-time code is ${code}. It expires in ${OTP_TTL_MS / 1e3 / 60} minutes.`
      });
      return { ok: true, sent: true, expiresIn: OTP_TTL_MS / 1e3 };
    } catch (err) {
      return {
        ok: true,
        sent: false,
        error: (err == null ? void 0 : err.message) || "Failed to send email",
        debugCode: code,
        expiresIn: OTP_TTL_MS / 1e3
      };
    }
  }
  return { ok: true, sent: false, debugCode: code, expiresIn: OTP_TTL_MS / 1e3 };
});

export { requestOtp_post as default, otpStore };
//# sourceMappingURL=request-otp.post.mjs.map

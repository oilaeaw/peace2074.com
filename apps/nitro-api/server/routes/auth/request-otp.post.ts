import { defineEventHandler, readBody } from "h3";
import { randomInt } from "node:crypto";
import nodemailer from "nodemailer";
import { createSession, requireSecrets } from "../../utils/auth";
import { applyCors } from "../../utils/cors";

export const otpStore = new Map<string, { code: string; exp: number }>();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function boolFromEnv(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function cleanExpired() {
  const now = Date.now();
  for (const [email, entry] of otpStore.entries()) {
    if (entry.exp <= now) otpStore.delete(email);
  }
}

export default defineEventHandler(async (event) => {
  applyCors(event);
  const body = (await readBody<{ email?: string }>(event)) || {};
  const email = (body.email || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Valid email required" };
  }

  // Ensure secret exists (passcode not required here)
  requireSecrets({ needPasscode: false });

  cleanExpired();
  const code = String(randomInt(100000, 999999));
  otpStore.set(email, { code, exp: Date.now() + OTP_TTL_MS });

  // Send email if SMTP is configured
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
        auth: user && pass ? { user, pass } : undefined,
      });

      await transporter.sendMail({
        from,
        to: email,
        subject: "Your login code",
        text: `Your one-time code is ${code}. It expires in ${OTP_TTL_MS / 1000 / 60} minutes.`,
      });

      return { ok: true, sent: true, expiresIn: OTP_TTL_MS / 1000 };
    } catch (err: any) {
      // Fall back to returning the code if email sending fails
      return {
        ok: true,
        sent: false,
        error: err?.message || "Failed to send email",
        debugCode: code,
        expiresIn: OTP_TTL_MS / 1000,
      };
    }
  }

  // If SMTP is not configured, return the code for manual use
  return { ok: true, sent: false, debugCode: code, expiresIn: OTP_TTL_MS / 1000 };
});

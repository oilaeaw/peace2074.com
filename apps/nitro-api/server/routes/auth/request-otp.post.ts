import { defineEventHandler, readBody } from "h3";
import { randomInt } from "node:crypto";
import { createSession, requireSecrets } from "../../utils/auth";

export const otpStore = new Map<string, { code: string; exp: number }>();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function cleanExpired() {
  const now = Date.now();
  for (const [email, entry] of otpStore.entries()) {
    if (entry.exp <= now) otpStore.delete(email);
  }
}

export default defineEventHandler(async (event) => {
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

  // TODO: wire real email delivery. For now, return debug code in response.
  return { ok: true, debugCode: code, expiresIn: OTP_TTL_MS / 1000 };
});

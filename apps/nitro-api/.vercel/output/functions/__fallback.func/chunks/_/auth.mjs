import { g as getMongoose, c as createError, h as getCookie, m as getHeader, e as setCookie, i as deleteCookie, u as useRuntimeConfig } from '../nitro/nitro.mjs';
import crypto from 'node:crypto';
import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;
const UserSessionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    provider: {
      type: String,
      required: true,
      enum: ["password", "google", "apple", "github", "passkey", "otp", "magic"],
      default: "password"
    },
    ip: { type: String, default: null },
    user_agent: { type: String, default: null },
    // TTL index: sessions auto-expire from this collection after 30 days
    expires_at: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
  },
  { timestamps: true, collection: "UserSession" }
);
const UserSessionModel = models.UserSession || model("UserSession", UserSessionSchema);

const SESSION_TTL_DAYS = 30;
async function recordSession(userId, provider, meta) {
  var _a, _b;
  try {
    await getMongoose();
    const expires_at = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1e3);
    await UserSessionModel.create({
      userId,
      provider,
      ip: (_a = meta == null ? void 0 : meta.ip) != null ? _a : null,
      user_agent: (_b = meta == null ? void 0 : meta.user_agent) != null ? _b : null,
      expires_at
    });
  } catch (err) {
    console.error("[sessions] Failed to record session:", err);
  }
}

const COOKIE_NAME = "waelio_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;
function getSecrets() {
  const config = useRuntimeConfig();
  const passcode = config.authPasscode || process.env.NITRO_AUTH_PASSCODE || process.env.AUTH_PASSCODE || "";
  const secret = config.authSecret || process.env.NITRO_AUTH_SECRET || process.env.AUTH_SECRET || "";
  return { passcode, secret };
}
function sign(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}
function verify(token, secret) {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
function requireSecrets(options = {}) {
  const { needPasscode = true } = options;
  const { passcode, secret } = getSecrets();
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: "Auth secret missing (set NITRO_AUTH_SECRET or AUTH_SECRET)" });
  }
  if (needPasscode && !passcode) {
    throw createError({ statusCode: 500, statusMessage: "Auth passcode missing (set NITRO_AUTH_PASSCODE or AUTH_PASSCODE)" });
  }
  return { passcode, secret };
}
function createSession(event, payload, provider = "password") {
  var _a, _b, _c, _d, _e;
  const { secret } = requireSecrets({ needPasscode: false });
  const exp = Date.now() + COOKIE_MAX_AGE * 1e3;
  const token = sign({ ...payload, exp }, secret);
  const origin = (getHeader(event, "origin") || "").toLowerCase();
  origin.startsWith("capacitor:") || origin.startsWith("ionic:") || origin.startsWith("app:");
  const useCrossSiteCookie = true;
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "none" ,
    secure: useCrossSiteCookie,
    path: "/",
    maxAge: COOKIE_MAX_AGE
  });
  const ip = (_d = (_c = (_b = (_a = getHeader(event, "x-forwarded-for")) == null ? void 0 : _a.split(",")[0]) == null ? void 0 : _b.trim()) != null ? _c : getHeader(event, "x-real-ip")) != null ? _d : null;
  const user_agent = (_e = getHeader(event, "user-agent")) != null ? _e : void 0;
  recordSession(payload.id, provider, { ip: ip != null ? ip : void 0, user_agent });
  return token;
}
function clearSessionCookie(event) {
  const origin = (getHeader(event, "origin") || "").toLowerCase();
  origin.startsWith("capacitor:") || origin.startsWith("ionic:") || origin.startsWith("app:");
  const useCrossSiteCookie = true;
  deleteCookie(event, COOKIE_NAME, {
    path: "/",
    sameSite: "none" ,
    secure: useCrossSiteCookie
  });
}
function readSession(event) {
  const { secret } = getSecrets();
  if (!secret) return null;
  const token = getCookie(event, COOKIE_NAME);
  if (!token) return null;
  return verify(token, secret);
}
function requireAuth(event) {
  const session = readSession(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  return session;
}

export { readSession as a, requireSecrets as b, createSession as c, clearSessionCookie as d, requireAuth as r, sign as s, verify as v };
//# sourceMappingURL=auth.mjs.map

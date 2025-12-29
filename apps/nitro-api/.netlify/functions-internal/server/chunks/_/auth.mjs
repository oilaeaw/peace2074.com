import { c as createError, a as setCookie, b as deleteCookie, e as getCookie, u as useRuntimeConfig } from '../nitro/nitro.mjs';
import crypto from 'node:crypto';

const COOKIE_NAME = "waelio_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;
function getSecrets() {
  const config = useRuntimeConfig();
  const passcode = config.authPasscode || process.env.AUTH_PASSCODE || "";
  const secret = config.authSecret || process.env.AUTH_SECRET || "";
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
    throw createError({ statusCode: 500, statusMessage: "Auth not configured" });
  }
  if (needPasscode && !passcode) {
    throw createError({ statusCode: 500, statusMessage: "Auth not configured" });
  }
  return { passcode, secret };
}
function createSession(event, payload) {
  const { secret } = requireSecrets({ needPasscode: false });
  const exp = Date.now() + COOKIE_MAX_AGE * 1e3;
  const token = sign({ ...payload, exp }, secret);
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: COOKIE_MAX_AGE
  });
  return token;
}
function clearSessionCookie(event) {
  deleteCookie(event, COOKIE_NAME, { path: "/" });
}
function readSession(event) {
  const { secret } = getSecrets();
  if (!secret) return null;
  const token = getCookie(event, COOKIE_NAME);
  if (!token) return null;
  return verify(token, secret);
}

export { clearSessionCookie as a, readSession as b, createSession as c, requireSecrets as r };
//# sourceMappingURL=auth.mjs.map

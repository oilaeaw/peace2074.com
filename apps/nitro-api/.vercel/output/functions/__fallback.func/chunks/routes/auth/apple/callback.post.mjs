import { d as defineEventHandler, r as readBody, h as getCookie, s as sendRedirect, i as deleteCookie, c as createError } from '../../../nitro/nitro.mjs';
import { decodeIdToken, OAuth2RequestError } from 'arctic';
import { s as setOAuthNoStoreHeaders, b as getOAuthCookieOptions, a as getAppleOAuth } from '../../../_/oauth.mjs';
import { c as createSession, b as requireSecrets, s as sign } from '../../../_/auth.mjs';
import { f as findOrCreateOAuthUser } from '../../../_/users.mjs';
import { a as applyCors } from '../../../_/cors.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '../../../_/User.mjs';
import '../../../_/ReaderStats.mjs';
import '../../../_/DeployLike.mjs';
import '../../../_/BlogLike.mjs';
import '../../../_/QuranProgress.mjs';
import '../../../_/Tasbeeh.mjs';
import '../../../_/profile.mjs';

function parseAppleUserPayload(value) {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}
const callback_post = defineEventHandler(async (event) => {
  var _a, _b;
  applyCors(event);
  setOAuthNoStoreHeaders(event);
  try {
    const body = await readBody(event).catch(() => ({})) || {};
    const code = String(body.code || "").trim();
    const state = String(body.state || "").trim();
    const redirectUrl = process.env.PUBLIC_URL || "https://peace2074.com";
    const cookieOptions = getOAuthCookieOptions(event);
    const storedState = getCookie(event, "apple_oauth_state");
    const isNative = getCookie(event, "oauth_from_native") === "1";
    const nativeBase = "peace2074://auth/callback";
    if (!code || !state || !storedState || state !== storedState) {
      console.warn("[auth/apple/callback:post] Invalid OAuth state", {
        hasCode: Boolean(code),
        hasState: Boolean(state),
        hasStoredState: Boolean(storedState),
        stateMatches: Boolean(state && storedState && state === storedState)
      });
      return sendRedirect(event, isNative ? `${nativeBase}?oauthError=apple-state-invalid` : `${redirectUrl}/login?oauthError=apple-state-invalid`);
    }
    deleteCookie(event, "apple_oauth_state", cookieOptions);
    if (isNative) deleteCookie(event, "oauth_from_native", cookieOptions);
    const apple = getAppleOAuth();
    const tokens = await apple.validateAuthorizationCode(code);
    const idTokenClaims = decodeIdToken(tokens.idToken());
    if (!idTokenClaims.email_verified || idTokenClaims.email_verified === "false") {
      throw createError({
        statusCode: 400,
        statusMessage: "Apple email not verified"
      });
    }
    const postedUser = parseAppleUserPayload(body.user);
    const postedFirstName = String(((_a = postedUser == null ? void 0 : postedUser.name) == null ? void 0 : _a.firstName) || "").trim() || void 0;
    const postedLastName = String(((_b = postedUser == null ? void 0 : postedUser.name) == null ? void 0 : _b.lastName) || "").trim() || void 0;
    const emailUsername = idTokenClaims.email.split("@")[0];
    const resolvedName = [postedFirstName, postedLastName].filter(Boolean).join(" ").trim() || emailUsername;
    const oauthInfo = {
      provider: "apple",
      providerId: idTokenClaims.sub,
      email: idTokenClaims.email,
      name: resolvedName,
      firstName: postedFirstName,
      lastName: postedLastName
    };
    const user = await findOrCreateOAuthUser(oauthInfo);
    const payload = {
      id: user.id,
      role: user.role || "user",
      name: user.first_name || user.username
    };
    createSession(event, payload, "apple");
    if (isNative) {
      const { secret } = requireSecrets({ needPasscode: false });
      const exp = Date.now() + 5 * 60 * 1e3;
      const token = sign({ ...payload, exp }, secret);
      return sendRedirect(event, `${nativeBase}?authComplete=1&token=${encodeURIComponent(token)}`);
    }
    return sendRedirect(event, `${redirectUrl}/`);
  } catch (error) {
    console.error("[auth/apple/callback:post] OAuth error:", error);
    if (error instanceof OAuth2RequestError) {
      throw createError({
        statusCode: 400,
        statusMessage: `Apple OAuth error: ${error.message}`
      });
    }
    if (error == null ? void 0 : error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: `OAuth callback failed: ${(error == null ? void 0 : error.message) || "unknown error"}`
    });
  }
});

export { callback_post as default };
//# sourceMappingURL=callback.post.mjs.map

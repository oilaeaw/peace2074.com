import { d as defineEventHandler, b as getQuery, h as getCookie, s as sendRedirect, i as deleteCookie, c as createError } from '../../../nitro/nitro.mjs';
import { decodeIdToken, OAuth2RequestError } from 'arctic';
import { s as setOAuthNoStoreHeaders, b as getOAuthCookieOptions, a as getAppleOAuth } from '../../../_/oauth.mjs';
import { c as createSession } from '../../../_/auth.mjs';
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

const callback_get = defineEventHandler(async (event) => {
  applyCors(event);
  setOAuthNoStoreHeaders(event);
  try {
    const query = getQuery(event);
    const code = query.code;
    const state = query.state;
    const redirectUrl = process.env.PUBLIC_URL || "https://peace2074.com";
    const cookieOptions = getOAuthCookieOptions(event);
    const storedState = getCookie(event, "apple_oauth_state");
    const isNative = getCookie(event, "oauth_from_native") === "1";
    const nativeBase = "peace2074://auth/callback";
    if (!code || !state || !storedState || state !== storedState) {
      console.warn("[auth/apple/callback] Invalid OAuth state", {
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
    const emailUsername = idTokenClaims.email.split("@")[0];
    const oauthInfo = {
      provider: "apple",
      providerId: idTokenClaims.sub,
      email: idTokenClaims.email,
      name: emailUsername
    };
    const user = await findOrCreateOAuthUser(oauthInfo);
    createSession(event, {
      id: user.id,
      role: user.role || "user",
      name: user.first_name || user.username
    }, "apple");
    return sendRedirect(event, isNative ? `${nativeBase}?authComplete=1` : `${redirectUrl}/`);
  } catch (error) {
    console.error("[auth/apple/callback] OAuth error:", error);
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

export { callback_get as default };
//# sourceMappingURL=callback.get.mjs.map

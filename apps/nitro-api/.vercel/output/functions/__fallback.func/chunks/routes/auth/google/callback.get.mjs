import { d as defineEventHandler, b as getQuery, h as getCookie, s as sendRedirect, i as deleteCookie, c as createError } from '../../../nitro/nitro.mjs';
import { OAuth2RequestError } from 'arctic';
import { s as setOAuthNoStoreHeaders, b as getOAuthCookieOptions, c as getGoogleOAuth } from '../../../_/oauth.mjs';
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

const callback_get = defineEventHandler(async (event) => {
  applyCors(event);
  setOAuthNoStoreHeaders(event);
  try {
    const query = getQuery(event);
    const code = query.code;
    const state = query.state;
    const redirectUrl = process.env.PUBLIC_URL || "https://peace2074.com";
    const cookieOptions = getOAuthCookieOptions(event);
    const storedState = getCookie(event, "google_oauth_state");
    const storedCodeVerifier = getCookie(event, "google_code_verifier");
    const isNative = getCookie(event, "oauth_from_native") === "1";
    const nativeBase = "peace2074://auth/callback";
    if (!code || !state || !storedState || state !== storedState || !storedCodeVerifier) {
      console.warn("[auth/google/callback] Invalid OAuth state", {
        hasCode: Boolean(code),
        hasState: Boolean(state),
        hasStoredState: Boolean(storedState),
        hasStoredCodeVerifier: Boolean(storedCodeVerifier),
        stateMatches: Boolean(state && storedState && state === storedState)
      });
      return sendRedirect(event, isNative ? `${nativeBase}?oauthError=google-state-invalid` : `${redirectUrl}/login?oauthError=google-state-invalid`);
    }
    deleteCookie(event, "google_oauth_state", cookieOptions);
    deleteCookie(event, "google_code_verifier", cookieOptions);
    if (isNative) deleteCookie(event, "oauth_from_native", cookieOptions);
    const google = getGoogleOAuth();
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`
      }
    });
    if (!userResponse.ok) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch Google user info"
      });
    }
    const googleUser = await userResponse.json();
    if (!googleUser.email_verified) {
      throw createError({
        statusCode: 400,
        statusMessage: "Google email not verified"
      });
    }
    const oauthInfo = {
      provider: "google",
      providerId: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      picture: googleUser.picture
    };
    const user = await findOrCreateOAuthUser(oauthInfo);
    const payload = {
      id: user.id,
      role: user.role || "user",
      name: user.first_name || user.username
    };
    createSession(event, payload, "google");
    if (isNative) {
      const { secret } = requireSecrets({ needPasscode: false });
      const exp = Date.now() + 5 * 60 * 1e3;
      const token = sign({ ...payload, exp }, secret);
      return sendRedirect(event, `${nativeBase}?authComplete=1&token=${encodeURIComponent(token)}`);
    }
    return sendRedirect(event, `${redirectUrl}/`);
  } catch (error) {
    console.error("[auth/google/callback] OAuth error:", error);
    if (error instanceof OAuth2RequestError) {
      throw createError({
        statusCode: 400,
        statusMessage: `Google OAuth error: ${error.message}`
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

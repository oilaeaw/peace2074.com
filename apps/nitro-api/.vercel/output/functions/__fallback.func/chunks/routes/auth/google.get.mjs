import { d as defineEventHandler, s as sendRedirect, b as getQuery, e as setCookie, c as createError } from '../../nitro/nitro.mjs';
import { generateState, generateCodeVerifier } from 'arctic';
import { s as setOAuthNoStoreHeaders, g as getCanonicalOAuthStartUrl, c as getGoogleOAuth, b as getOAuthCookieOptions } from '../../_/oauth.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const google_get = defineEventHandler(async (event) => {
  applyCors(event);
  setOAuthNoStoreHeaders(event);
  try {
    const canonicalUrl = getCanonicalOAuthStartUrl(event, "google");
    if (canonicalUrl) {
      return sendRedirect(event, canonicalUrl);
    }
    const query = getQuery(event);
    const isNative = query.native === "1";
    const google = getGoogleOAuth();
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const cookieOpts = getOAuthCookieOptions(event);
    setCookie(event, "google_oauth_state", state, cookieOpts);
    setCookie(event, "google_code_verifier", codeVerifier, cookieOpts);
    if (isNative) {
      setCookie(event, "oauth_from_native", "1", { ...cookieOpts, maxAge: 600 });
    }
    const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);
    return sendRedirect(event, url.toString());
  } catch (error) {
    console.error("[auth/google] OAuth initiation error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Google OAuth error: ${(error == null ? void 0 : error.message) || "unknown"}`
    });
  }
});

export { google_get as default };
//# sourceMappingURL=google.get.mjs.map

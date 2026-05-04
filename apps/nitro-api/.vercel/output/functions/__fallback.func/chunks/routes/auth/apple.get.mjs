import { d as defineEventHandler, s as sendRedirect, b as getQuery, e as setCookie, f as getRequestHeader, c as createError } from '../../nitro/nitro.mjs';
import { generateState } from 'arctic';
import { s as setOAuthNoStoreHeaders, g as getCanonicalOAuthStartUrl, a as getAppleOAuth, b as getOAuthCookieOptions } from '../../_/oauth.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const apple_get = defineEventHandler(async (event) => {
  applyCors(event);
  setOAuthNoStoreHeaders(event);
  try {
    const canonicalUrl = getCanonicalOAuthStartUrl(event, "apple");
    if (canonicalUrl) {
      return sendRedirect(event, canonicalUrl);
    }
    const query = getQuery(event);
    const isNative = query.native === "1";
    const apple = getAppleOAuth();
    const state = generateState();
    const baseOpts = getOAuthCookieOptions(event);
    setCookie(event, "apple_oauth_state", state, {
      ...baseOpts,
      sameSite: "none",
      secure: true
    });
    if (isNative) {
      setCookie(event, "oauth_from_native", "1", {
        ...baseOpts,
        maxAge: 600,
        sameSite: "none",
        secure: true
      });
    }
    const url = await apple.createAuthorizationURL(state, ["name", "email"]);
    url.searchParams.set("response_mode", "form_post");
    return sendRedirect(event, url.toString());
  } catch (error) {
    console.error("[auth/apple] OAuth initiation error:", error);
    const errorMessage = String(
      (error == null ? void 0 : error.message) || (error == null ? void 0 : error.statusMessage) || "unknown"
    );
    const acceptHeader = String(getRequestHeader(event, "accept") || "");
    if (/Apple OAuth not configured/i.test(errorMessage) && acceptHeader.includes("text/html")) {
      return sendRedirect(event, "/login?oauthError=apple-not-configured");
    }
    throw createError({
      statusCode: Number((error == null ? void 0 : error.statusCode) || 500),
      statusMessage: `Apple OAuth error: ${errorMessage}`
    });
  }
});

export { apple_get as default };
//# sourceMappingURL=apple.get.mjs.map

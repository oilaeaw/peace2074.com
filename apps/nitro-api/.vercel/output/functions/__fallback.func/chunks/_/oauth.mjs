import { k as setResponseHeader, l as getRequestURL, c as createError, m as getHeader, u as useRuntimeConfig } from '../nitro/nitro.mjs';
import { Apple, Google } from 'arctic';
import { Buffer } from 'node:buffer';

function normalizeConfigValue(value) {
  return typeof value === "string" ? value.trim() : "";
}
function hasPlaceholderMarker(value) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  return [
    "replace_with",
    "your-",
    "your_",
    "<user>",
    "<password>",
    "<api_key>",
    "<api_secret>",
    "<cloud_name>",
    "change-me"
  ].some((marker) => normalized.includes(marker));
}
function normalizeCredentialValue(value) {
  const normalized = normalizeConfigValue(value);
  return hasPlaceholderMarker(normalized) ? "" : normalized;
}
function decodeBase64ToUint8Array(value) {
  const normalized = value.replace(/\s+/g, "");
  if (!normalized) {
    return new Uint8Array();
  }
  return Uint8Array.from(Buffer.from(normalized, "base64"));
}
function normalizeApplePrivateKey(value) {
  if (value instanceof Uint8Array) {
    return value;
  }
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  const normalized = normalizeConfigValue(value).replace(/^(['"])([\s\S]*)\1$/, "$2").replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
  if (!normalized || hasPlaceholderMarker(normalized)) {
    return new Uint8Array();
  }
  const pemMatch = normalized.match(
    /-----BEGIN PRIVATE KEY-----([\s\S]+?)-----END PRIVATE KEY-----/
  );
  if (pemMatch) {
    return decodeBase64ToUint8Array(pemMatch[1] || "");
  }
  return decodeBase64ToUint8Array(normalized);
}
function getOAuthConfig() {
  const config = useRuntimeConfig();
  const publicUrl = normalizeConfigValue(process.env.PUBLIC_URL) || "https://peace2074.com";
  const googleClientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID || process.env.NITRO_GOOGLE_CLIENT_ID || "";
  const googleClientSecret = config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET || process.env.NITRO_GOOGLE_CLIENT_SECRET || "";
  const googleRedirectUri = config.googleRedirectUri || process.env.GOOGLE_REDIRECT_URI || process.env.NITRO_GOOGLE_REDIRECT_URI || `${publicUrl}/api/auth/google/callback`;
  const appleClientId = config.appleClientId || process.env.APPLE_CLIENT_ID || process.env.NITRO_APPLE_CLIENT_ID || "";
  const appleTeamId = config.appleTeamId || process.env.APPLE_TEAM_ID || process.env.NITRO_APPLE_TEAM_ID || "";
  const appleKeyId = config.appleKeyId || process.env.APPLE_KEY_ID || process.env.NITRO_APPLE_KEY_ID || "";
  const applePrivateKey = config.applePrivateKey || process.env.APPLE_PRIVATE_KEY || process.env.NITRO_APPLE_PRIVATE_KEY || "";
  const appleRedirectUri = config.appleRedirectUri || process.env.APPLE_REDIRECT_URI || process.env.NITRO_APPLE_REDIRECT_URI || `${publicUrl}/api/auth/apple/callback`;
  return {
    google: {
      clientId: normalizeCredentialValue(googleClientId),
      clientSecret: normalizeCredentialValue(googleClientSecret),
      redirectUri: normalizeConfigValue(googleRedirectUri)
    },
    apple: {
      clientId: normalizeCredentialValue(appleClientId),
      teamId: normalizeCredentialValue(appleTeamId),
      keyId: normalizeCredentialValue(appleKeyId),
      privateKey: normalizeApplePrivateKey(applePrivateKey),
      redirectUri: normalizeConfigValue(appleRedirectUri)
    }
  };
}
function getOAuthAvailability() {
  const config = getOAuthConfig();
  return {
    google: Boolean(config.google.clientId && config.google.clientSecret),
    apple: Boolean(
      config.apple.clientId && config.apple.teamId && config.apple.keyId && config.apple.privateKey.byteLength > 0
    )
  };
}
function getGoogleOAuth() {
  const config = getOAuthConfig();
  if (!config.google.clientId || !config.google.clientSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: "Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
    });
  }
  return new Google(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
  );
}
function getAppleOAuth() {
  const config = getOAuthConfig();
  if (!config.apple.clientId || !config.apple.teamId || !config.apple.keyId || config.apple.privateKey.byteLength === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: "Apple OAuth not configured. Set APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY"
    });
  }
  return new Apple(
    config.apple.clientId,
    config.apple.teamId,
    config.apple.keyId,
    config.apple.privateKey,
    config.apple.redirectUri
  );
}
function isCapacitorLikeOrigin(origin) {
  return origin.startsWith("capacitor:") || origin.startsWith("ionic:") || origin.startsWith("app:");
}
function getOAuthCallbackOrigin(provider) {
  const config = getOAuthConfig();
  const redirectUri = provider === "google" ? config.google.redirectUri : config.apple.redirectUri;
  try {
    return new URL(redirectUri).origin;
  } catch {
    return null;
  }
}
function getCanonicalOAuthStartUrl(event, provider) {
  const callbackOrigin = getOAuthCallbackOrigin(provider);
  if (!callbackOrigin) return null;
  const requestUrl = getRequestURL(event, {
    xForwardedHost: true,
    xForwardedProto: true
  });
  if (requestUrl.origin === callbackOrigin) {
    return null;
  }
  return new URL(
    `${requestUrl.pathname}${requestUrl.search}`,
    callbackOrigin
  ).toString();
}
function getOAuthCookieOptions(event) {
  const origin = String(getHeader(event, "origin") || "").toLowerCase();
  const referer = String(getHeader(event, "referer") || "").toLowerCase();
  const requestUrl = getRequestURL(event, {
    xForwardedHost: true,
    xForwardedProto: true
  });
  const isSecureRequest = requestUrl.protocol === "https:";
  const useCrossSiteCookie = isCapacitorLikeOrigin(origin) || isCapacitorLikeOrigin(referer);
  return {
    httpOnly: true,
    secure: isSecureRequest,
    sameSite: useCrossSiteCookie ? "none" : "lax",
    maxAge: 60 * 10,
    path: "/"
  };
}
function setOAuthNoStoreHeaders(event) {
  setResponseHeader(event, "Cache-Control", "no-store, no-cache, max-age=0, must-revalidate");
  setResponseHeader(event, "Pragma", "no-cache");
  setResponseHeader(event, "Expires", "0");
}

export { getAppleOAuth as a, getOAuthCookieOptions as b, getGoogleOAuth as c, getOAuthAvailability as d, getCanonicalOAuthStartUrl as g, setOAuthNoStoreHeaders as s };
//# sourceMappingURL=oauth.mjs.map

import { d as defineEventHandler, u as useRuntimeConfig, s as sendError, c as createError, g as getHeader, b as getCookie } from '../../../nitro/nitro.mjs';
import { getUserFromEvent } from '@server/utils/auth';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '#auth';
import '@server/utils/abilities';

const debugSession = defineEventHandler(async (event) => {
  const { nodeEnv, session } = useRuntimeConfig();
  if (nodeEnv === "production")
    return sendError(event, createError({ statusCode: 403, statusMessage: "disabled in production" }));
  const host = getHeader(event, "x-forwarded-host") || getHeader(event, "host") || "";
  const proto = getHeader(event, "x-forwarded-proto") || getHeader(event, "x-forwarded-protocol") || "http";
  const authCookiePresent = Boolean(getCookie(event, "auth_token"));
  const sessionCookiePresent = Boolean(getCookie(event, (session == null ? void 0 : session.name) || "nuxt-session"));
  const user = await getUserFromEvent(event).catch(() => null);
  const cookieCfg = session && typeof session.cookie === "object" ? session.cookie : {};
  return {
    ok: true,
    env: {
      nodeEnv
    },
    request: {
      host,
      protocol: proto
    },
    cookies: {
      hasAuthToken: authCookiePresent,
      hasSessionCookie: sessionCookiePresent,
      sessionCookieName: (session == null ? void 0 : session.name) || "nuxt-session",
      sameSite: (cookieCfg == null ? void 0 : cookieCfg.sameSite) || "lax",
      secure: typeof (cookieCfg == null ? void 0 : cookieCfg.secure) === "boolean" ? cookieCfg.secure : nodeEnv === "production",
      domain: (cookieCfg == null ? void 0 : cookieCfg.domain) || null
    },
    user: user ? {
      id: user.id || user._id || null,
      username: user.username || null,
      email: user.email || null,
      role: user.role || null
    } : null
  };
});

export { debugSession as default };
//# sourceMappingURL=debug-session.mjs.map

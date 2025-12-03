import { d as defineEventHandler, g as getHeader, u as useRuntimeConfig } from '../../../../nitro/nitro.mjs';
import { ensureDbConnection } from '@server/utils/database';
import OAuthLog from '@server/models/oauth-log';
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

const authUrl = defineEventHandler((event) => {
  const cfg = useRuntimeConfig();
  const host = getHeader(event, "x-forwarded-host") || getHeader(event, "host");
  const proto = getHeader(event, "x-forwarded-proto") || (cfg.nodeEnv === "production" ? "https" : "http");
  const callbackURL = cfg.googleCallbackUrl || `${proto}://${host}/api/auth/google/callback`;
  const clientId = cfg.googleClientId;
  const authBase = "https://accounts.google.com/o/oauth2/v2/auth";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId || "",
    redirect_uri: callbackURL,
    scope: "openid email profile",
    access_type: "online",
    include_granted_scopes: "true",
    prompt: "select_account"
  });
  const url = `${authBase}?${params.toString()}`;
  (async () => {
    try {
      await ensureDbConnection();
      const OLog = OAuthLog;
      await OLog.create({
        provider: "google",
        direction: "auth-url",
        url,
        callbackURL,
        clientId,
        host,
        proto,
        outcome: "init"
      });
    } catch (e) {
      try {
        console.warn("[auth/google/auth-url] failed to persist OAuthLog:", (e == null ? void 0 : e.message) || e);
      } catch {
      }
    }
  })();
  return { url, callbackURL, clientId };
});

export { authUrl as default };
//# sourceMappingURL=auth-url.mjs.map

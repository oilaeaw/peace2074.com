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
  const callbackURL = cfg.githubCallbackUrl || `${proto}://${host}/api/auth/github/callback`;
  const clientId = cfg.githubClientId;
  const authBase = "https://github.com/login/oauth/authorize";
  const params = new URLSearchParams({
    client_id: clientId || "",
    redirect_uri: callbackURL,
    scope: "user:email",
    allow_signup: "true"
  });
  const url = `${authBase}?${params.toString()}`;
  (async () => {
    try {
      await ensureDbConnection();
      const OLog = OAuthLog;
      await OLog.create({
        provider: "github",
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
        console.warn("[auth/github/auth-url] failed to persist OAuthLog:", (e == null ? void 0 : e.message) || e);
      } catch {
      }
    }
  })();
  return { url, callbackURL, clientId };
});

export { authUrl as default };
//# sourceMappingURL=auth-url.mjs.map

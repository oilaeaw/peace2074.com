import { d as defineEventHandler, c as createError, s as sendRedirect, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const authorize_get = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const clientId = process.env.GITHUB_CLIENT_ID || config.githubClientId;
  if (!clientId) {
    throw createError({
      statusCode: 500,
      statusMessage: "GitHub OAuth not configured - missing GITHUB_CLIENT_ID"
    });
  }
  const origin = "https://peace2074.com" ;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/auth/github/callback`,
    scope: "read:user user:email",
    state: randomBytes(16).toString("hex")
    // CSRF protection
  });
  return sendRedirect(event, `https://github.com/login/oauth/authorize?${params}`);
});
function randomBytes(size) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    return Buffer.from(bytes);
  }
  return require("crypto").randomBytes(size);
}

export { authorize_get as default };
//# sourceMappingURL=authorize.get.mjs.map

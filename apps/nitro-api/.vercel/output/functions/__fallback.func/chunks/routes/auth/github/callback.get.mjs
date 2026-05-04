import { d as defineEventHandler, b as getQuery, s as sendRedirect, c as createError, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import { c as createSession } from '../../../_/auth.mjs';
import { f as findOrCreateOAuthUser } from '../../../_/users.mjs';
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
  var _a, _b, _c, _d;
  const query = getQuery(event);
  const code = query.code;
  if (!code) {
    return sendRedirect(event, "/login?error=github_auth_failed");
  }
  const config = useRuntimeConfig();
  const clientId = process.env.GITHUB_CLIENT_ID || config.githubClientId;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET || config.githubClientSecret;
  if (!clientId || !clientSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: "GitHub OAuth not configured"
    });
  }
  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: true ? "https://peace2074.com/auth/github/callback" : "http://localhost:3000/auth/github/callback"
      })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return sendRedirect(event, "/login?error=github_token_failed");
    }
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Accept": "application/json"
      }
    });
    const githubUser = await userResponse.json();
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
          "Accept": "application/json"
        }
      });
      const emails = await emailResponse.json();
      email = ((_a = emails.find((e) => e.primary)) == null ? void 0 : _a.email) || ((_b = emails[0]) == null ? void 0 : _b.email);
    }
    const user = await findOrCreateOAuthUser({
      provider: "github",
      providerId: String(githubUser.id),
      email: email || `${githubUser.login}@github.user`,
      name: githubUser.name || githubUser.login,
      firstName: ((_c = githubUser.name) == null ? void 0 : _c.split(" ")[0]) || githubUser.login,
      lastName: ((_d = githubUser.name) == null ? void 0 : _d.split(" ").slice(1).join(" ")) || void 0,
      picture: githubUser.avatar_url
    });
    const sessionUser = {
      id: user.id,
      role: user.role,
      name: `${user.first_name} ${user.last_name}`.trim() || user.username
    };
    createSession(event, sessionUser, "github");
    return sendRedirect(event, "/");
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    return sendRedirect(event, "/login?error=github_auth_error");
  }
});

export { callback_get as default };
//# sourceMappingURL=callback.get.mjs.map

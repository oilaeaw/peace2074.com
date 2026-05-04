import { d as defineEventHandler, m as getHeader, c as createError, r as readBody } from '../nitro/nitro.mjs';
import crypto from 'node:crypto';
import { b as broadcastPush } from '../_/push-notify.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mongoose';

function verifyJwt(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [header, payload, signature] = parts;
  const signingInput = `${header}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signingInput).digest("base64url");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
const identityWebhook_post = defineEventHandler(async (event) => {
  var _a, _b;
  const secret = process.env.NETLIFY_IDENTITY_JWT_SECRET;
  if (secret) {
    const authHeader = (_a = getHeader(event, "authorization")) != null ? _a : "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token || !verifyJwt(token, secret)) {
      console.error("[Identity Webhook] Invalid or missing JWT");
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }
  }
  const body = await readBody(event);
  const { event: eventType, user } = body != null ? body : {};
  console.log(`[Identity Webhook] ${eventType}`, JSON.stringify({ id: user == null ? void 0 : user.id, email: user == null ? void 0 : user.email }, null, 2));
  switch (eventType) {
    case "validate": {
      const email = (_b = user == null ? void 0 : user.email) != null ? _b : "";
      if (!email.includes("@")) {
        throw createError({ statusCode: 422, statusMessage: "Invalid email" });
      }
      return { ok: true };
    }
    case "signup":
      console.log(`[Identity Webhook] New user signed up: ${user == null ? void 0 : user.email}`);
      try {
        await broadcastPush(
          {
            title: "\u{1F44B} New member joined",
            body: `${user == null ? void 0 : user.email} just signed up to Peace2074`,
            data: { url: "/" }
          },
          "identity-signup"
        );
      } catch (err) {
        console.error("[Identity Webhook] broadcastPush error:", err);
      }
      return { ok: true };
    case "login":
      console.log(`[Identity Webhook] User logged in: ${user == null ? void 0 : user.email}`);
      return { ok: true };
    default:
      console.log(`[Identity Webhook] Unhandled event: ${eventType}`);
      return { ok: true };
  }
});

export { identityWebhook_post as default };
//# sourceMappingURL=identity-webhook.post.mjs.map

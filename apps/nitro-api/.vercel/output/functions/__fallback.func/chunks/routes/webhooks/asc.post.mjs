import { d as defineEventHandler, r as readBody, m as getHeader, c as createError } from '../../nitro/nitro.mjs';
import crypto from 'node:crypto';
import { b as broadcastPush } from '../../_/push-notify.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mongoose';

function verifySignature(secret, rawBody, signature) {
  const hmac = crypto.createHmac("sha256", secret);
  const expected = "sha256=" + hmac.update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
const asc_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const rawBody = await readBody(event, { strict: false });
  const secret = process.env.ASC_WEBHOOK_SECRET;
  const signature = (_a = getHeader(event, "x-asc-signature")) != null ? _a : getHeader(event, "x-apple-signature");
  if (secret && signature) {
    const isValid = verifySignature(secret, JSON.stringify(rawBody), signature);
    if (!isValid) {
      console.error("[ASC Webhook] Invalid signature \u2014 request rejected");
      throw createError({ statusCode: 401, statusMessage: "Invalid signature" });
    }
  }
  const payload = rawBody;
  const type = (_b = payload == null ? void 0 : payload.notificationType) != null ? _b : "UNKNOWN";
  console.log(`[ASC Webhook] ${type}`, JSON.stringify(payload, null, 2));
  switch (type) {
    case "BUILD_PROCESSING":
      console.log("[ASC Webhook] Build processing started:", payload.data);
      break;
    case "BUILD_PROCESSING_FINISHED":
      console.log("[ASC Webhook] Build finished processing:", payload.data);
      try {
        await broadcastPush(
          {
            title: "\u{1F3D7}\uFE0F Build processed",
            body: "App Store Connect finished processing the build",
            data: { url: "https://appstoreconnect.apple.com" }
          },
          "asc-build"
        );
      } catch (err) {
        console.error("[ASC Webhook] broadcastPush error:", err);
      }
      break;
    case "APP_SUBMISSION_WAITING_FOR_REVIEW":
      console.log("[ASC Webhook] App is waiting for review:", payload.data);
      break;
    case "APP_SUBMISSION_STATUS_CHANGED": {
      const status = (_d = (_c = payload.data) == null ? void 0 : _c.reviewStatus) != null ? _d : "unknown";
      console.log(`[ASC Webhook] Review status changed \u2192 ${status}`, payload.data);
      try {
        await broadcastPush(
          {
            title: "\u{1F34E} App Store review update",
            body: `Review status changed \u2192 ${status}`,
            data: { url: "https://appstoreconnect.apple.com" }
          },
          "asc-review"
        );
      } catch (err) {
        console.error("[ASC Webhook] broadcastPush error:", err);
      }
      break;
    }
    case "APP_REVIEW_ATTACHMENT_GENERATED":
      console.log("[ASC Webhook] Review attachment generated:", payload.data);
      break;
    default:
      console.log(`[ASC Webhook] Unhandled type: ${type}`);
  }
  return { ok: true, received: type };
});

export { asc_post as default };
//# sourceMappingURL=asc.post.mjs.map

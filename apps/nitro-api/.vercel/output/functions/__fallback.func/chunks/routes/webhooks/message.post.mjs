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

function verifySignature(body, header, secret) {
  if (!header) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header));
  } catch {
    return false;
  }
}
const message_post = defineEventHandler(async (event) => {
  var _a;
  const secret = process.env.MESSAGING_WEBHOOK_SECRET;
  const rawBody = await readBody(event);
  const sig = getHeader(event, "x-webhook-signature");
  if (secret) {
    if (!verifySignature(JSON.stringify(rawBody), sig, secret)) {
      console.error("[Message Webhook] Invalid signature");
      throw createError({ statusCode: 401, statusMessage: "Invalid signature" });
    }
  }
  const { type, senderId, recipientId, payload: text, isBroadcast } = rawBody != null ? rawBody : {};
  const sender = (_a = senderId == null ? void 0 : senderId.substring(0, 8)) != null ? _a : "Someone";
  const messageText = typeof text === "string" ? text : text != null ? JSON.stringify(text) : "";
  try {
    if (type === "route" && recipientId) {
      console.log(`[Message Webhook] Direct from ${sender} \u2192 ${recipientId}`);
      await broadcastPush(
        {
          title: `\u{1F4AC} New message`,
          body: messageText.substring(0, 100),
          data: { url: "/chat", type: "direct", from: senderId }
        },
        "chat-direct"
      );
    } else if (isBroadcast || type === "broadcast") {
      console.log(`[Message Webhook] Broadcast from ${sender}`);
      await broadcastPush(
        {
          title: `\u{1F4E2} Peace2074 Chat`,
          body: messageText.substring(0, 100),
          data: { url: "/chat", type: "broadcast", from: senderId }
        },
        "chat-broadcast"
      );
    } else if (type === "room-message") {
      console.log(`[Message Webhook] Room message from ${sender}`);
      await broadcastPush(
        {
          title: `\u{1F4AC} Room message`,
          body: messageText.substring(0, 100),
          data: { url: "/chat", type: "room", from: senderId }
        },
        "chat-room"
      );
    }
  } catch (err) {
    console.error("[Message Webhook] broadcastPush error:", err);
  }
  return { ok: true };
});

export { message_post as default };
//# sourceMappingURL=message.post.mjs.map

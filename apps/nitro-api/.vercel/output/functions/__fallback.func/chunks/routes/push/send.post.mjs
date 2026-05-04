import { d as defineEventHandler, r as readBody, w as getVapidConfig, j as getCollection } from '../../nitro/nitro.mjs';
import webpush from 'web-push';
import { r as requireAuth } from '../../_/auth.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const send_post = defineEventHandler(async (event) => {
  const user = requireAuth(event);
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }
  try {
    const body = await readBody(event);
    const { campaign, userId } = body;
    let { title, message, url } = body;
    if (campaign === "ramadan") {
      title = title || "\u{1F319} Ramadan Reflection";
      message = message || "Your daily Ramadan reflection is ready in PEACE2074. Open Quran, Tasbeeh, or Chat to continue your streak.";
      url = url || "/?campaign=ramadan";
    }
    if (!title || !message) {
      return { ok: false, error: "Title and message are required" };
    }
    const vapid = getVapidConfig();
    if (!vapid) {
      return { ok: false, error: "VAPID keys not configured" };
    }
    webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
    const Subscriptions = await getCollection("push_subscriptions");
    const query = {};
    if (userId) {
      query.userId = userId;
    }
    const subscriptions = await Subscriptions.find(query).toArray();
    if (subscriptions.length === 0) {
      return { ok: false, error: "No subscribers found" };
    }
    const payload = JSON.stringify({
      title,
      body: message,
      icon: "/android-chrome-192x192.png",
      badge: "/android-chrome-192x192.png",
      tag: campaign ? `peace2074-${campaign}` : "peace2074-notification",
      data: {
        url: url || "/",
        campaign: campaign || null,
        timestamp: Date.now()
      }
    });
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          return { endpoint: sub.endpoint, success: true };
        } catch (err) {
          console.error(`[Push] Failed to send to ${sub.endpoint}:`, err);
          if (err.statusCode === 410) {
            await Subscriptions.deleteOne({ endpoint: sub.endpoint });
          }
          return { endpoint: sub.endpoint, success: false, error: err.message };
        }
      })
    );
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    return {
      ok: true,
      message: `Sent to ${successful} subscribers${failed > 0 ? `, ${failed} failed` : ""}`,
      sent: successful,
      failed
    };
  } catch (err) {
    console.error("[Push Send] Error:", err);
    return { ok: false, error: (err == null ? void 0 : err.message) || "Failed to send notifications" };
  }
});

export { send_post as default };
//# sourceMappingURL=send.post.mjs.map

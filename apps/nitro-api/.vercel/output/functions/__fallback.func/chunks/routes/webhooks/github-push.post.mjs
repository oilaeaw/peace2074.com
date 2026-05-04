import { d as defineEventHandler, r as readBody, m as getHeader, w as getVapidConfig, j as getCollection } from '../../nitro/nitro.mjs';
import crypto from 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mongoose';

const githubPush_post = defineEventHandler(async (event) => {
  var _a;
  try {
    const body = await readBody(event);
    const signature = getHeader(event, "x-hub-signature-256");
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const hmac = crypto.createHmac("sha256", webhookSecret);
      const digest = "sha256=" + hmac.update(JSON.stringify(body)).digest("hex");
      if (digest !== signature) {
        console.error("[GitHub Webhook] Invalid signature");
        return { ok: false, error: "Invalid signature" };
      }
    }
    const eventType = getHeader(event, "x-github-event");
    if (eventType !== "push") {
      return { ok: true, message: "Event ignored (not a push)" };
    }
    const { ref, commits, pusher, repository } = body;
    const branch = (ref == null ? void 0 : ref.split("/").pop()) || "unknown";
    if (branch !== "one" && branch !== "main") {
      return { ok: true, message: `Ignored push to ${branch}` };
    }
    const commitCount = (commits == null ? void 0 : commits.length) || 0;
    const pusherName = (pusher == null ? void 0 : pusher.name) || "Someone";
    const repoName = (repository == null ? void 0 : repository.name) || "repository";
    console.log(`[GitHub Webhook] Push to ${branch}: ${commitCount} commit(s) by ${pusherName}`);
    const webpush = await import('web-push');
    const vapid = getVapidConfig();
    if (!vapid) {
      console.warn("[GitHub Webhook] VAPID not configured, skipping notifications");
      return { ok: true, message: "VAPID not configured" };
    }
    webpush.default.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
    const Subscriptions = await getCollection("push_subscriptions");
    const subscriptions = await Subscriptions.find({}).toArray();
    if (subscriptions.length === 0) {
      return { ok: true, message: "No subscribers to notify" };
    }
    const latestCommit = commits == null ? void 0 : commits[commits.length - 1];
    const commitMessage = ((_a = latestCommit == null ? void 0 : latestCommit.message) == null ? void 0 : _a.split("\n")[0]) || "New update";
    const payload = JSON.stringify({
      title: `\u{1F680} ${repoName} updated`,
      body: `${pusherName} pushed ${commitCount} commit(s) to ${branch}
${commitMessage}`,
      icon: "/android-chrome-192x192.png",
      badge: "/android-chrome-192x192.png",
      tag: "github-push",
      data: {
        url: (repository == null ? void 0 : repository.html_url) || "/",
        branch,
        commits: commitCount
      }
    });
    let sentCount = 0;
    let failedCount = 0;
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.default.sendNotification(sub.subscription, payload);
          sentCount++;
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await Subscriptions.deleteOne({ endpoint: sub.subscription.endpoint });
          }
          failedCount++;
          throw err;
        }
      })
    );
    console.log(`[GitHub Webhook] Sent ${sentCount} notification(s), ${failedCount} failed`);
    return {
      ok: true,
      message: `Sent ${sentCount} notification(s)`,
      details: {
        branch,
        commits: commitCount,
        pusher: pusherName,
        sent: sentCount,
        failed: failedCount
      }
    };
  } catch (err) {
    console.error("[GitHub Webhook] Error:", err);
    return { ok: false, error: (err == null ? void 0 : err.message) || "Webhook processing failed" };
  }
});

export { githubPush_post as default };
//# sourceMappingURL=github-push.post.mjs.map

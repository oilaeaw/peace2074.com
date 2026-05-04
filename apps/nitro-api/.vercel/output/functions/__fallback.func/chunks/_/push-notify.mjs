import { w as getVapidConfig, j as getCollection } from '../nitro/nitro.mjs';

async function broadcastPush(payload, tag) {
  var _a;
  const vapid = getVapidConfig();
  if (!vapid) {
    return { ok: false, sent: 0, failed: 0, reason: "vapid-not-configured" };
  }
  const webpush = await import('web-push');
  webpush.default.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
  const Subscriptions = await getCollection("push_subscriptions");
  const subscriptions = await Subscriptions.find({}).toArray();
  if (!subscriptions.length) {
    return { ok: false, sent: 0, failed: 0, reason: "no-subscribers" };
  }
  const body = JSON.stringify({
    icon: "/android-chrome-192x192.png",
    badge: "/android-chrome-192x192.png",
    ...payload,
    tag: (_a = tag != null ? tag : payload.tag) != null ? _a : "notification"
  });
  let sent = 0;
  let failed = 0;
  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      var _a2;
      try {
        await webpush.default.sendNotification(sub.subscription, body);
        sent++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await Subscriptions.deleteOne({ endpoint: (_a2 = sub.subscription) == null ? void 0 : _a2.endpoint });
        }
        failed++;
      }
    })
  );
  return { ok: true, sent, failed };
}

export { broadcastPush as b };
//# sourceMappingURL=push-notify.mjs.map

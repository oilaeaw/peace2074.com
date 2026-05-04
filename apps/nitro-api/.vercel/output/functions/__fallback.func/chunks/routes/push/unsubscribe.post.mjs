import { d as defineEventHandler, r as readBody, j as getCollection } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const unsubscribe_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { endpoint } = body;
    if (!endpoint) {
      return { ok: false, error: "Endpoint is required" };
    }
    const Subscriptions = await getCollection("push_subscriptions");
    const result = await Subscriptions.deleteOne({ endpoint });
    if (result.deletedCount === 0) {
      return { ok: false, error: "Subscription not found" };
    }
    return { ok: true, message: "Unsubscribed from push notifications" };
  } catch (err) {
    console.error("[Push Unsubscribe] Error:", err);
    return { ok: false, error: (err == null ? void 0 : err.message) || "Failed to unsubscribe" };
  }
});

export { unsubscribe_post as default };
//# sourceMappingURL=unsubscribe.post.mjs.map

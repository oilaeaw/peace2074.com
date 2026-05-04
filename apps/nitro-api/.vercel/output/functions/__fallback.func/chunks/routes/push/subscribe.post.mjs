import { d as defineEventHandler, r as readBody, j as getCollection } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const subscribe_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { subscription } = body;
    if (!subscription || !subscription.endpoint) {
      return { ok: false, error: "Invalid subscription object" };
    }
    const Subscriptions = await getCollection("push_subscriptions");
    const user = event.context.user;
    const userId = (user == null ? void 0 : user._id) || (user == null ? void 0 : user.email);
    const existing = await Subscriptions.findOne({ endpoint: subscription.endpoint });
    if (existing) {
      await Subscriptions.updateOne(
        { endpoint: subscription.endpoint },
        {
          $set: {
            subscription,
            userId: userId || null,
            updatedAt: /* @__PURE__ */ new Date()
          }
        }
      );
      return { ok: true, message: "Subscription updated" };
    }
    await Subscriptions.insertOne({
      endpoint: subscription.endpoint,
      subscription,
      userId: userId || null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    return { ok: true, message: "Subscribed to push notifications" };
  } catch (err) {
    console.error("[Push Subscribe] Error:", err);
    return { ok: false, error: (err == null ? void 0 : err.message) || "Failed to subscribe" };
  }
});

export { subscribe_post as default };
//# sourceMappingURL=subscribe.post.mjs.map

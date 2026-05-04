import { d as defineEventHandler, w as getVapidConfig, y as getVapidStatus } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const publicKey_get = defineEventHandler(() => {
  const vapid = getVapidConfig();
  if (!vapid) {
    const status = getVapidStatus();
    const missing = [];
    if (!status.hasPublicKey) missing.push("NITRO_VAPID_PUBLIC_KEY (or VAPID_PUBLIC_KEY)");
    if (!status.hasPrivateKey) missing.push("NITRO_VAPID_PRIVATE_KEY (or VAPID_PRIVATE_KEY)");
    if (!status.hasSubject) missing.push("NITRO_VAPID_SUBJECT (or VAPID_SUBJECT)");
    console.error("[Push] VAPID keys not configured");
    return {
      ok: false,
      error: "Push notifications not configured",
      missing
    };
  }
  return { ok: true, publicKey: vapid.publicKey };
});

export { publicKey_get as default };
//# sourceMappingURL=public-key.get.mjs.map

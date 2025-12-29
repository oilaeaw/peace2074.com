import { d as defineEventHandler, j as readRawBody, c as createError, u as useRuntimeConfig } from '../../nitro/nitro.mjs';
import crypto from 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

function verifySignature(raw, provided, secret) {
  if (!secret) return true;
  if (!provided) return false;
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}
const netlifyForm_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const raw = await readRawBody(event);
  if (!raw) {
    throw createError({ statusCode: 400, statusMessage: "Empty body" });
  }
  const rawString = typeof raw === "string" ? raw : raw.toString("utf8");
  const sigHeader = event.node.req.headers["x-webhook-signature"];
  const config = useRuntimeConfig();
  const secret = config.netlifyWebhookSecret || process.env.NETLIFY_WEBHOOK_SECRET;
  if (!verifySignature(rawString, sigHeader, secret)) {
    throw createError({ statusCode: 401, statusMessage: "Invalid signature" });
  }
  let payload;
  try {
    payload = JSON.parse(rawString);
  } catch (err) {
    throw createError({ statusCode: 400, statusMessage: "Invalid JSON payload" });
  }
  const formName = ((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.name) || ((_c = (_b = payload == null ? void 0 : payload.payload) == null ? void 0 : _b.data) == null ? void 0 : _c.name) || ((_d = payload == null ? void 0 : payload.payload) == null ? void 0 : _d.name) || "contact";
  const fields = ((_e = payload == null ? void 0 : payload.payload) == null ? void 0 : _e.data) || (payload == null ? void 0 : payload.data) || {};
  const name = fields.name || "Unknown";
  const email = fields.email || "Unknown";
  const project = fields.project || "N/A";
  const message = fields.message || "";
  const summary = `Netlify form: ${formName}
From: ${name} <${email}>
Project: ${project}
Message: ${message}`;
  return { ok: true, summary };
});

export { netlifyForm_post as default };
//# sourceMappingURL=netlify-form.post.mjs.map

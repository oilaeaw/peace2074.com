import { d as defineEventHandler, r as readBody, u as useRuntimeConfig } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '#auth';
import '@server/utils/abilities';

async function sendWelcomeEmail(email) {
  const config = useRuntimeConfig();
  const MAILJS_PUBLIC_KEY = config.email_public_key;
  const MAILJS_PRIVATE_KEY = config.email_private_key;
  const MAILJS_TEMPLATE = config.email_template;
  const MAILJS_API_URL = config.mailjs_api_url;
  const url = MAILJS_API_URL;
  const payload = {
    service_id: MAILJS_TEMPLATE,
    template_id: "template_welcome",
    // You may need to adjust this to your actual template ID
    user_id: MAILJS_PUBLIC_KEY,
    accessToken: MAILJS_PRIVATE_KEY,
    template_params: {
      to_email: email
    }
  };
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
const identityWebhook = defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.warn("Netlify Identity webhook event:", body);
  if (body.event === "signup" && body.user && body.user.email) {
    await sendWelcomeEmail(body.user.email);
  }
  return { received: true };
});

export { identityWebhook as default };
//# sourceMappingURL=identity-webhook.mjs.map

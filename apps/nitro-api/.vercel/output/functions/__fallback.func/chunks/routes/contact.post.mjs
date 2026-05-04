import { d as defineEventHandler, r as readBody, c as createError, u as useRuntimeConfig } from '../nitro/nitro.mjs';
import nodemailer from 'nodemailer';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const REQUIRED_FIELDS = ["name", "email", "message"];
function boolFromEnv(value, fallback = false) {
  if (value === void 0) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}
const contact_post = defineEventHandler(async (event) => {
  const body = await readBody(event) || {};
  const missing = REQUIRED_FIELDS.filter((k) => !body[k] || String(body[k]).trim() === "");
  if (missing.length) {
    throw createError({ statusCode: 400, statusMessage: `Missing required fields: ${missing.join(", ")}` });
  }
  const name = String(body.name).trim();
  const email = String(body.email).trim();
  const project = String(body.project || "General").trim();
  const message = String(body.message).trim();
  const config = useRuntimeConfig();
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = config.contactFrom || process.env.SMTP_FROM || user;
  const to = config.contactTo || process.env.CONTACT_TO || process.env.SMTP_FROM || user;
  const secure = boolFromEnv(process.env.SMTP_SECURE, port === 465);
  if (!host || !port || !from || !to) {
    throw createError({
      statusCode: 500,
      statusMessage: "SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, CONTACT_TO."
    });
  }
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : void 0
  });
  const html = `
    <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
    <p><strong>Project:</strong> ${project}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space: pre-line;">${message}</p>
  `;
  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `[Contact] ${project} - ${name}`,
      text: `From: ${name} <${email}>
Project: ${project}

${message}`,
      html
    });
    return { ok: true };
  } catch (err) {
    throw createError({
      statusCode: 502,
      statusMessage: (err == null ? void 0 : err.message) || "Failed to send email"
    });
  }
});

export { contact_post as default };
//# sourceMappingURL=contact.post.mjs.map

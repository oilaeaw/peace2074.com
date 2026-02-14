#!/usr/bin/env node
/**
 * Generate VAPID keys for Web Push notifications
 * Run: node scripts/generate-vapid-keys.mjs
 *
 * Add the output to your .env file:
 * VAPID_PUBLIC_KEY=...
 * VAPID_PRIVATE_KEY=...
 * VAPID_SUBJECT=mailto:your-email@example.com
 */

import { spawnSync } from "node:child_process";

async function loadWebPush() {
  try {
    const mod = await import("web-push");
    return mod.default || mod;
  } catch {
    return null;
  }
}

console.log("\n🔐 Generating VAPID keys for Web Push...\n");

const webpush = await loadWebPush();

if (webpush?.generateVAPIDKeys) {
  const vapidKeys = webpush.generateVAPIDKeys();
  console.log("✅ Keys generated! Add these to your .env file:\n");
  console.log("# Web Push VAPID Keys");
  console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
  console.log(`VAPID_SUBJECT=mailto:your-email@peace2074.com`);
  console.log(
    "\n📝 Note: Replace the email in VAPID_SUBJECT with your actual contact email.\n",
  );
  process.exit(0);
}

console.warn(
  '⚠️ "web-push" is not installed at workspace root; using pnpm dlx fallback...\n',
);
const res = spawnSync("pnpm", ["dlx", "web-push", "generate-vapid-keys"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (res.status !== 0) {
  process.exit(res.status ?? 1);
}

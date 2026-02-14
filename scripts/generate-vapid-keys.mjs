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

import webpush from 'web-push'

console.log('\n🔐 Generating VAPID keys for Web Push...\n')

const vapidKeys = webpush.generateVAPIDKeys()

console.log('✅ Keys generated! Add these to your .env file:\n')
console.log('# Web Push VAPID Keys')
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
console.log(`VAPID_SUBJECT=mailto:your-email@peace2074.com`)
console.log('\n📝 Note: Replace the email in VAPID_SUBJECT with your actual contact email.\n')

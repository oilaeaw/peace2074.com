#!/bin/bash
# Script to set Netlify environment variables
# Run with: netlify env:set VARIABLE_NAME "value"
#
# IMPORTANT: Before running this script:
# 1. Generate VAPID keys: node scripts/generate-vapid-keys.mjs
# 2. Replace YOUR_VAPID_PUBLIC_KEY_HERE and YOUR_VAPID_PRIVATE_KEY_HERE with actual values
# 3. Update other secrets with your production values

echo "Setting Netlify environment variables..."

netlify env:set AUTH_SECRET "T^n?10fZEo@#fsaMg?A1pBej1+Kv?m}k"
netlify env:set NITRO_AUTH_SECRET "T^n?10fZEo@#fsaMg?A1pBej1+Kv?m}k"
netlify env:set DEEPSEEK_API_KEY "sk-c9500709d5d6483689e12cd77f735222"
netlify env:set NITRO_DEEPSEEK_API_KEY "sk-c9500709d5d6483689e12cd77f735222"
# Note: Base URL defaults to api.deepseek.com (no env var needed)
netlify env:set NETLIFY_WEBHOOK_SECRET "csesGwJx367WG37J8L6n"

# Push Notifications (Web Push API)
# Generate VAPID keys with: node scripts/generate-vapid-keys.mjs
netlify env:set VAPID_PUBLIC_KEY "YOUR_VAPID_PUBLIC_KEY_HERE"
netlify env:set VAPID_PRIVATE_KEY "YOUR_VAPID_PRIVATE_KEY_HERE"
netlify env:set VAPID_SUBJECT "mailto:admin@peace2074.com"
netlify env:set NITRO_VAPID_PUBLIC_KEY "YOUR_VAPID_PUBLIC_KEY_HERE"
netlify env:set NITRO_VAPID_PRIVATE_KEY "YOUR_VAPID_PRIVATE_KEY_HERE"
netlify env:set NITRO_VAPID_SUBJECT "mailto:admin@peace2074.com"
netlify env:set ENABLE_BLOG_NOTIFICATIONS "true"

echo "✅ Environment variables set! Redeploy your site to apply changes."
echo "Run: netlify deploy --prod"

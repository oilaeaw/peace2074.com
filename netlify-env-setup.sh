#!/bin/bash
# Script to set Netlify environment variables
# Run with: netlify env:set VARIABLE_NAME "value"
#
# ⚠️ SECURITY WARNING: Never commit real secrets to this file!
# This is a TEMPLATE - replace placeholders with actual values from your .env
#
# IMPORTANT: Before running this script:
# 1. Generate VAPID keys: node scripts/generate-vapid-keys.mjs
# 2. Replace YOUR_* placeholders with actual values from your .env file
# 3. Update all secrets with your production values
# 4. DO NOT commit the modified version with real secrets

echo "⚠️  WARNING: Ensure you've replaced all YOUR_* placeholders with real values!"
echo ""
echo "Setting Netlify environment variables..."

netlify env:set AUTH_SECRET "YOUR_AUTH_SECRET_HERE"
netlify env:set NITRO_AUTH_SECRET "YOUR_AUTH_SECRET_HERE"
netlify env:set DEEPSEEK_API_KEY "YOUR_DEEPSEEK_API_KEY_HERE"
netlify env:set NITRO_DEEPSEEK_API_KEY "YOUR_DEEPSEEK_API_KEY_HERE"
netlify env:set DEEPSEEK_BASE_URL "https://api.deepseek.com"
netlify env:set NETLIFY_WEBHOOK_SECRET "YOUR_WEBHOOK_SECRET_HERE"

# Push Notifications (Web Push API)
# Generate VAPID keys with: node scripts/generate-vapid-keys.mjs
netlify env:set VAPID_PUBLIC_KEY "YOUR_VAPID_PUBLIC_KEY_HERE"
netlify env:set VAPID_PRIVATE_KEY "YOUR_VAPID_PRIVATE_KEY_HERE"
netlify env:set VAPID_SUBJECT "mailto:admin@peace2074.com"
netlify env:set NITRO_VAPID_PUBLIC_KEY "YOUR_VAPID_PUBLIC_KEY_HERE"
netlify env:set NITRO_VAPID_PRIVATE_KEY "YOUR_VAPID_PRIVATE_KEY_HERE"
netlify env:set NITRO_VAPID_SUBJECT "mailto:admin@peace2074.com"
netlify env:set ENABLE_BLOG_NOTIFICATIONS "true"

echo ""
echo "✅ Environment variables set! Redeploy your site to apply changes."
echo "Run: netlify deploy --prod"

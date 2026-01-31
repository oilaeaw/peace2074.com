#!/bin/bash
# Script to set Netlify environment variables
# Run with: netlify env:set VARIABLE_NAME "value"

echo "Setting Netlify environment variables..."

netlify env:set AUTH_SECRET "T^n?10fZEo@#fsaMg?A1pBej1+Kv?m}k"
netlify env:set NITRO_AUTH_SECRET "T^n?10fZEo@#fsaMg?A1pBej1+Kv?m}k"
netlify env:set DEEPSEEK_API_KEY "sk-c9500709d5d6483689e12cd77f735222"
netlify env:set DEEPSEEK_BASE_URL "https://api.deepseek.com"
netlify env:set NITRO_DEEPSEEK_API_KEY "sk-c9500709d5d6483689e12cd77f735222"
netlify env:set NITRO_DEEPSEEK_BASE_URL "https://api.deepseek.com"
netlify env:set NETLIFY_WEBHOOK_SECRET "csesGwJx367WG37J8L6n"

echo "✅ Environment variables set! Redeploy your site to apply changes."
echo "Run: netlify deploy --prod"

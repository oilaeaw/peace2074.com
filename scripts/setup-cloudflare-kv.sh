#!/bin/bash
# Peace2074 — Create Cloudflare KV Namespace & Wire it to the App
# Run this ONCE after getting a full-access API token

set -e

ACCOUNT_ID="f8e411adbc0ac8c96ac4e00beaacd9cd"
TOKEN="${CLOUDFLARE_API_TOKEN_FULL:-$1}"

if [ -z "$TOKEN" ]; then
  echo "❌ Usage: bash scripts/setup-cloudflare-kv.sh YOUR_FULL_API_TOKEN"
  echo ""
  echo "To get a full API token:"
  echo "  1. Go to https://dash.cloudflare.com/profile/api-tokens"
  echo "  2. Click 'Create Token'"
  echo "  3. Use 'Edit Cloudflare Workers' template"
  echo "  4. Set 'Account Resources' to your account"
  echo "  5. Copy the token and run this script"
  exit 1
fi

echo "Creating Cloudflare KV namespace 'peace2074-db'..."
RESPONSE=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"title":"peace2074-db"}')

KV_ID=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['result']['id'] if d['success'] else 'FAILED: '+str(d['errors']))")

if [[ "$KV_ID" == FAILED* ]]; then
  echo "❌ KV creation failed: $KV_ID"
  exit 1
fi

echo "✅ KV namespace created: peace2074-db (ID: $KV_ID)"

# Save to .env
if grep -q "CF_KV_DB_ID" .env; then
  sed -i '' "s|CF_KV_DB_ID=.*|CF_KV_DB_ID=${KV_ID}|" .env
else
  echo "CF_KV_DB_ID=${KV_ID}" >> .env
fi

echo "✅ CF_KV_DB_ID saved to .env"
echo ""
echo "Next step: Add this KV namespace to your Cloudflare Pages project:"
echo "  Dashboard → peace2074.com → Settings → Environment Variables"
echo "  Add: CF_KV_DB_ID = ${KV_ID}"
echo ""
echo "Then redeploy for settings to persist in production."

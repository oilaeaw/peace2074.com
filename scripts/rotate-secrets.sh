#!/bin/bash
# Quick script to rotate all exposed secrets
# Run this after updating values in .env

set -e

echo "🔐 Secret Rotation Helper"
echo "========================="
echo ""
echo "⚠️  WARNING: This will update production secrets!"
echo "    Make sure you've updated your .env file first."
echo ""

read -p "Have you updated .env with new secrets? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled. Update .env first, then run this script."
    exit 1
fi

echo ""
echo "📋 Rotating secrets from .env to Netlify..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Source .env (but don't export to avoid pollution)
source .env

# Rotate each secret
echo "1️⃣  Rotating AUTH_SECRET..."
if [ -n "$AUTH_SECRET" ]; then
    netlify env:set AUTH_SECRET "$AUTH_SECRET"
    netlify env:set NITRO_AUTH_SECRET "$AUTH_SECRET"
    echo "   ✅ AUTH_SECRET updated"
else
    echo "   ⚠️  AUTH_SECRET not found in .env"
fi

echo ""
echo "2️⃣  Rotating DEEPSEEK_API_KEY..."
if [ -n "$DEEPSEEK_API_KEY" ]; then
    netlify env:set DEEPSEEK_API_KEY "$DEEPSEEK_API_KEY"
    netlify env:set NITRO_DEEPSEEK_API_KEY "$DEEPSEEK_API_KEY"
    echo "   ✅ DEEPSEEK_API_KEY updated"
else
    echo "   ⚠️  DEEPSEEK_API_KEY not found in .env"
fi

echo ""
echo "3️⃣  Rotating DATABASE_URL..."
if [ -n "$DATABASE_URL" ]; then
    netlify env:set DATABASE_URL "$DATABASE_URL"
    echo "   ✅ DATABASE_URL updated"
else
    echo "   ⚠️  DATABASE_URL not found in .env"
fi

echo ""
echo "4️⃣  Rotating NETLIFY_WEBHOOK_SECRET..."
if [ -n "$NETLIFY_WEBHOOK_SECRET" ]; then
    netlify env:set NETLIFY_WEBHOOK_SECRET "$NETLIFY_WEBHOOK_SECRET"
    echo "   ✅ NETLIFY_WEBHOOK_SECRET updated"
else
    echo "   ⚠️  NETLIFY_WEBHOOK_SECRET not found in .env"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Secret rotation complete!"
echo ""
echo "Next steps:"
echo "1. Redeploy your site: netlify deploy --prod"
echo "2. Test that everything works"
echo "3. Update GitHub webhook secrets if needed"
echo ""
echo "⚠️  IMPORTANT: Users will need to log in again"
echo "   (AUTH_SECRET rotation invalidates sessions)"

#!/bin/bash
# Netlify Environment Variables Setup Script
# Run this to push all OAuth variables to Netlify in one command

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting Netlify environment variables for OAuth...${NC}"

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Set variables (requires you to be logged in: netlify login)
netlify env:set GOOGLE_CLIENT_ID "166860955615-i3oufoanjcpm3gakrtcqutnhjgn9ci30.apps.googleusercontent.com"
netlify env:set GOOGLE_CLIENT_SECRET "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2822b5265f7cs"
netlify env:set GOOGLE_REDIRECT_URI "https://peace2074.com/api/auth/google/callback"
netlify env:set PUBLIC_URL "https://peace2074.com"

# Apple placeholders
netlify env:set APPLE_CLIENT_ID "not-configured-yet"
netlify env:set APPLE_TEAM_ID "not-configured-yet"
netlify env:set APPLE_KEY_ID "not-configured-yet"
netlify env:set APPLE_PRIVATE_KEY "not-configured-yet"
netlify env:set APPLE_REDIRECT_URI "https://peace2074.com/api/auth/apple/callback"

echo -e "${GREEN}✓ Environment variables set!${NC}"
echo -e "${YELLOW}Triggering new deployment...${NC}"

# Trigger redeploy
netlify deploy --prod --build

echo -e "${GREEN}✓ Done! OAuth should work on production now.${NC}"

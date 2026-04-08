#!/bin/bash
# Netlify Environment Variables Setup Script
# Run this to push all OAuth variables to Netlify in one command
# Reads credentials from .env file

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load .env file
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Source .env file
set -a
source .env
set +a

echo -e "${YELLOW}Setting Netlify environment variables for OAuth...${NC}"

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Set variables (requires you to be logged in: netlify login)
netlify env:set GOOGLE_CLIENT_ID "$GOOGLE_CLIENT_ID"
netlify env:set GOOGLE_CLIENT_SECRET "$GOOGLE_CLIENT_SECRET"
netlify env:set GOOGLE_REDIRECT_URI "https://peace2074.com/api/auth/google/callback"
netlify env:set PUBLIC_URL "https://peace2074.com"

# Apple OAuth (if configured in .env)
if [ -n "$APPLE_CLIENT_ID" ] && [ "$APPLE_CLIENT_ID" != "not-configured-yet" ]; then
    netlify env:set APPLE_CLIENT_ID "$APPLE_CLIENT_ID"
    netlify env:set APPLE_TEAM_ID "$APPLE_TEAM_ID"
    netlify env:set APPLE_KEY_ID "$APPLE_KEY_ID"
    netlify env:set APPLE_PRIVATE_KEY "$APPLE_PRIVATE_KEY"
    netlify env:set APPLE_REDIRECT_URI "https://peace2074.com/api/auth/apple/callback"
else
    echo -e "${YELLOW}Skipping Apple OAuth (not configured in .env)${NC}"
fi

echo -e "${GREEN}✓ Environment variables set!${NC}"
echo -e "${YELLOW}Triggering new deployment...${NC}"

# Trigger redeploy
netlify deploy --prod --build

echo -e "${GREEN}✓ Done! OAuth should work on production now.${NC}"

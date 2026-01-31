#!/bin/bash
# Set environment variables in Netlify
# Usage: ./netlify-env-setup.sh

echo "🚀 Setting up Netlify environment variables..."
echo "⚠️  Make sure you have Netlify CLI installed: npm i -g netlify-cli"
echo "⚠️  And authenticated: netlify login"
echo ""

# Load from .env file (for reference only - DO NOT commit .env!)
if [ -f .env ]; then
  echo "📋 Found .env file - using as reference"
else
  echo "❌ .env file not found. Create one from .env.example first."
  exit 1
fi

# Function to set env var
set_var() {
  local key=$1
  local value=$2
  
  if [ -z "$value" ] || [ "$value" = "your-"* ] || [ "$value" = "<"* ]; then
    echo "⏭️  Skipping $key (placeholder value)"
    return
  fi
  
  echo "✅ Setting $key"
  netlify env:set "$key" "$value" --context production
}

# Read .env and set variables
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ $key =~ ^#.*$ ]] && continue
  [[ -z $key ]] && continue
  
  # Remove quotes and whitespace
  value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//" | xargs)
  
  # Skip reference variables like ${AUTH_SECRET}
  [[ $value =~ ^\$\{.*\}$ ]] && continue
  
  set_var "$key" "$value"
done < .env

echo ""
echo "✨ Done! Check your environment variables at:"
echo "   https://app.netlify.com/sites/[your-site]/configuration/env"
echo ""
echo "⚠️  IMPORTANT: Delete sensitive values from .env after setting them in Netlify"

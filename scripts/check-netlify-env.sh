#!/bin/bash
# Quick script to check and set Netlify environment variables

echo "🔍 Checking Netlify environment setup..."
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Install it with:"
    echo "   npm install -g netlify-cli"
    exit 1
fi

# Check if user is logged in
if ! netlify status &> /dev/null; then
    echo "❌ Not logged in to Netlify. Run:"
    echo "   netlify login"
    exit 1
fi

echo "✅ Netlify CLI installed and authenticated"
echo ""

# Load .env file
if [ -f .env ]; then
    echo "📄 Found .env file. Checking local configuration..."
    
    # Check DATABASE_URL
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL found in .env"
    else
        echo "❌ DATABASE_URL missing in .env"
    fi
    
    # Check AUTH_SECRET
    if grep -q "AUTH_SECRET" .env; then
        echo "✅ AUTH_SECRET found in .env"
    else
        echo "❌ AUTH_SECRET missing in .env"
    fi
    
    # Check AUTH_PASSCODE  
    if grep -q "AUTH_PASSCODE" .env; then
        echo "✅ AUTH_PASSCODE found in .env"
    else
        echo "❌ AUTH_PASSCODE missing in .env"
    fi
else
    echo "❌ .env file not found"
fi

echo ""
echo "📡 Checking Netlify environment variables..."
echo ""

# List current env vars (just show if they exist, not values)
netlify env:list 2>&1 > /tmp/netlify-env.txt

if grep -q "DATABASE_URL" /tmp/netlify-env.txt; then
    echo "✅ DATABASE_URL is set in Netlify"
else
    echo "❌ DATABASE_URL NOT set in Netlify"
    echo ""
    echo "To fix, run:"
    echo '  netlify env:set DATABASE_URL "your-mongodb-connection-string"'
    echo ""
fi

if grep -q "AUTH_SECRET" /tmp/netlify-env.txt; then
    echo "✅ AUTH_SECRET is set in Netlify"
else
    echo "⚠️  AUTH_SECRET NOT set in Netlify"
fi

if grep -q "AUTH_PASSCODE" /tmp/netlify-env.txt; then
    echo "✅ AUTH_PASSCODE is set in Netlify"
else
    echo "⚠️  AUTH_PASSCODE NOT set in Netlify"
fi

if grep -q "DEEPSEEK_API_KEY" /tmp/netlify-env.txt; then
    echo "✅ DEEPSEEK_API_KEY is set in Netlify"
else
    echo "ℹ️  DEEPSEEK_API_KEY not set (optional for AI features)"
fi

rm /tmp/netlify-env.txt

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Offer to copy env vars from .env to Netlify
if [ -f .env ]; then
    echo "Would you like to copy all environment variables from .env to Netlify?"
    echo "(This will skip empty values and existing Netlify vars)"
    read -p "Continue? (y/N) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "🚀 Copying environment variables to Netlify..."
        echo ""
        
        # Read .env and set each variable
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            [[ $key =~ ^#.*$ ]] && continue
            [[ -z $key ]] && continue
            
            # Remove quotes from value
            value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            
            # Skip if value is empty
            [[ -z $value ]] && continue
            
            echo "Setting $key..."
            netlify env:set "$key" "$value" 2>&1 | grep -v "Value set"
        done < <(grep -v '^#' .env | grep '=')
        
        echo ""
        echo "✅ Environment variables copied!"
        echo ""
        echo "⚠️  IMPORTANT: You must redeploy for changes to take effect:"
        echo "   netlify deploy --prod"
        echo ""
        echo "   Or push to trigger auto-deploy:"
        echo "   git commit --allow-empty -m 'Update env vars'"
        echo "   git push origin one"
    fi
else
    echo "💡 TIP: Create a .env file with your environment variables"
    echo "   You can use .env.example as a template if it exists"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 To check your production database connection:"
echo "   curl https://peace2074.com/api/auth/health | jq"
echo ""
echo "📚 For more details, see DATABASE_CONNECTION_FIX.md"

#!/bin/bash
# Add Prisma to function package.json and copy generated client

set -e

FUNC_PKG="netlify/functions/server/package.json"
FUNC_DIR="netlify/functions/server"

echo "🔧 Setting up Prisma for Netlify Functions..."

# Ensure Prisma client is generated
echo "📦 Generating Prisma Client..."
cd apps/nitro-api
pnpm exec prisma generate --schema ./prisma/schema.prisma
cd ../..

# Copy .prisma folder to function directory
echo "📂 Copying Prisma generated client..."
if [ -d "node_modules/.prisma" ]; then
  mkdir -p "$FUNC_DIR/node_modules/.prisma"
  cp -r node_modules/.prisma/client "$FUNC_DIR/node_modules/.prisma/"
  echo "✅ Copied .prisma/client to function directory"
else
  echo "❌ .prisma/client not found in node_modules"
  exit 1
fi

# Patch package.json
if [ -f "$FUNC_PKG" ]; then
  # Add @prisma/client to dependencies using jq
  if command -v jq &> /dev/null; then
    jq '.dependencies["@prisma/client"] = "^6.19.2" | .dependencies[".prisma/client"] = "file:./node_modules/.prisma/client"' "$FUNC_PKG" > "${FUNC_PKG}.tmp" && mv "${FUNC_PKG}.tmp" "$FUNC_PKG"
    echo "✅ Added Prisma to function package.json"
  else
    echo "⚠️  jq not available, using node to patch package.json"
    node -e "
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('$FUNC_PKG', 'utf8'));
      pkg.dependencies['@prisma/client'] = '^6.19.2';
      pkg.dependencies['.prisma/client'] = 'file:./node_modules/.prisma/client';
      fs.writeFileSync('$FUNC_PKG', JSON.stringify(pkg, null, 2) + '\n');
    "
    echo "✅ Added Prisma to function package.json (via node)"
  fi
else
  echo "❌ Function package.json not found at $FUNC_PKG"
  exit 1
fi

echo "✅ Prisma setup complete for Netlify Functions"

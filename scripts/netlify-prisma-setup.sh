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

# Copy .prisma folder and @prisma/client to function directory
echo "📂 Copying Prisma runtime and generated client..."

# Find .prisma/client in pnpm's nested structure
PRISMA_GEN=$(find node_modules/.pnpm -name "client" -path "*/.prisma/client" -type d 2>/dev/null | head -n 1)
# Find the full @prisma/client package directory
PRISMA_CLIENT_PKG=$(find node_modules/.pnpm -type d -path "*/@prisma+client*/node_modules/@prisma/client" 2>/dev/null | head -n 1)

if [ -z "$PRISMA_GEN" ]; then
  # Fallback to standard location (non-pnpm)
  if [ -d "node_modules/.prisma/client" ]; then
    PRISMA_GEN="node_modules/.prisma/client"
  fi
fi

if [ -z "$PRISMA_CLIENT_PKG" ]; then
  # Fallback to standard location (non-pnpm)
  if [ -d "node_modules/@prisma/client" ]; then
    PRISMA_CLIENT_PKG="node_modules/@prisma/client"
  fi
fi

# Copy .prisma/client
if [ -n "$PRISMA_GEN" ]; then
  mkdir -p "$FUNC_DIR/node_modules/.prisma"
  cp -r "$PRISMA_GEN" "$FUNC_DIR/node_modules/.prisma/"
  echo "✅ Copied .prisma/client from $PRISMA_GEN"
else
  echo "❌ .prisma/client not found in node_modules"
  exit 1
fi

# Copy @prisma/client package
if [ -n "$PRISMA_CLIENT_PKG" ]; then
  mkdir -p "$FUNC_DIR/node_modules/@prisma"
  cp -r "$PRISMA_CLIENT_PKG" "$FUNC_DIR/node_modules/@prisma/"
  echo "✅ Copied @prisma/client package from $PRISMA_CLIENT_PKG"
else
  echo "❌ @prisma/client package not found in node_modules"
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

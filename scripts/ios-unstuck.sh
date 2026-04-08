#!/bin/bash
# Quick fix for stuck iOS app during development

set -e

echo "🚑 iOS App Unstuck Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

# Kill any stuck app processes
echo "1️⃣  Killing stuck app processes..."
pkill -9 -f "Peace2074" 2>/dev/null || true
pkill -9 Simulator 2>/dev/null || true

# Get local IP for live reload
LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "localhost")
DEV_SERVER="http://${LOCAL_IP}:4000"

echo "2️⃣  Setting up live reload to ${DEV_SERVER}"

# Sync with live reload enabled
export CAP_SERVER_URL="${DEV_SERVER}"
npx cap sync ios

# Clean Xcode module cache if still stuck
if [ "$1" = "--deep-clean" ]; then
  echo "3️⃣  Deep cleaning Xcode caches..."
  rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
  rm -rf ios/App/DerivedData
fi

echo ""
echo "✅ Done! Now in Xcode:"
echo "   1. Stop the current build (⌘.)"
echo "   2. Clean Build Folder (⌘⇧K)"
echo "   3. Run again (⌘R)"
echo ""
echo "💡 If still stuck, run: ./scripts/ios-unstuck.sh --deep-clean"
echo ""

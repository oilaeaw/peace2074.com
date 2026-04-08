#!/bin/bash
# Clean and rebuild iOS project with updated Swift concurrency settings

set -e

echo "🧹 Cleaning iOS build artifacts..."

# Force quit Xcode if running
pkill -9 Xcode 2>/dev/null || true
sleep 2

# Navigate to iOS project
cd "$(dirname "$0")/../ios/App"

# Clean Xcode build
echo "  → Cleaning Xcode build folder..."
xcodebuild clean -workspace App.xcworkspace -scheme App -quiet 2>/dev/null || true

# Remove all derived data
echo "  → Removing derived data..."
rm -rf DerivedData 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/App-* 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/*peace* 2>/dev/null || true

# Clean Pods
echo "  → Cleaning CocoaPods..."
rm -rf Pods 2>/dev/null || true
rm -rf ~/Library/Caches/CocoaPods 2>/dev/null || true
rm -f Podfile.lock 2>/dev/null || true

# Clear module cache
echo "  → Clearing Swift module cache..."
rm -rf ~/Library/Developer/Xcode/DerivedData/ModuleCache.noindex 2>/dev/null || true

echo ""
echo "📦 Reinstalling CocoaPods dependencies..."
pod install --repo-update

echo ""
echo "✅ iOS project cleaned successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Next steps to rebuild:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1. Open workspace: open ios/App/App.xcworkspace"
echo "  2. In Xcode → Product → Clean Build Folder (⌘⇧K)"
echo "  3. Build and Run (⌘R)"
echo ""
echo "The Swift concurrency warning should be gone! ✨"
echo ""

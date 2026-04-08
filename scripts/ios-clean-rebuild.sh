#!/bin/bash
# Clean and rebuild iOS project with updated Swift concurrency settings

set -e

echo "🧹 Cleaning iOS build artifacts..."

# Clean Xcode build
cd ios/App
xcodebuild clean -quiet 2>/dev/null || true

# Remove derived data
rm -rf DerivedData 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/App-* 2>/dev/null || true

# Clean Pods cache
rm -rf Pods 2>/dev/null || true
rm -f Podfile.lock 2>/dev/null || true

echo "📦 Reinstalling CocoaPods dependencies..."
pod install --repo-update

echo ""
echo "✅ iOS project cleaned and dependencies reinstalled"
echo ""
echo "Next steps:"
echo "  1. Open Xcode: open ios/App/App.xcworkspace"
echo "  2. Product → Clean Build Folder (⌘⇧K)"
echo "  3. Build and run (⌘R)"
echo ""
echo "The Swift concurrency warning should now be gone!"

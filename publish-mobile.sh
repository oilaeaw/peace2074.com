#!/usr/bin/env bash
set -e

# Ignore .DS_Store
find . -name ".DS_Store" -delete || true

echo "Publishing peace2074.com to iOS and Android App Stores..."

# Go to the mobile directory
cd /Users/waelio/Code/GitHub/peace2074/peace2074.com/ios/peace2074-mobile

echo "Installing NativeScript dependencies..."
pnpm install

# Check if android is already added, if not, install the platform package and add it
if ! grep -q "@nativescript/android" package.json; then
  echo "Adding @nativescript/android..."
  pnpm install -D @nativescript/android
fi

if [ ! -d "platforms/android" ]; then
  echo "Adding Android platform to NativeScript..."
  npx nativescript platform add android
fi

echo ""
echo "=== Publishing to Android (Google Play Store) ==="
# Note: Ensure you have your release keystore configured in App_Resources/Android/app/build.gradle
npx nativescript build android --release || echo "Android build may have failed due to missing keystore. Please ensure it's configured."
bundle exec fastlane android release || echo "Fastlane Android upload failed. Please ensure GOOGLE_PLAY_JSON_KEY_CONTENT is in your .env"

echo ""
echo "=== Publishing to iOS (App Store) ==="
bundle exec fastlane ios release || echo "Fastlane iOS upload failed. Please ensure App Store API Keys are in your .env"

echo "Done! The process has finished."

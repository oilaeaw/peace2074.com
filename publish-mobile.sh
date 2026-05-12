#!/usr/bin/env bash
set -e

# Ignore .DS_Store
find . -name ".DS_Store" -delete || true

echo "Publishing peace2074.com to iOS and Android App Stores..."

# Load .env file into bash environment
if [ -f ".env" ]; then
  echo "Loading environment variables from .env..."
  set -a; source .env; set +a
fi

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
if [ -z "$ANDROID_KEYSTORE_PATH" ] || [ -z "$GOOGLE_PLAY_JSON_KEY_CONTENT" ]; then
  echo "Android Keystore or Google Play JSON keys are missing from .env."
  echo "Skipping Android publishing for now..."
else
  npx nativescript build android --release \
    --key-store-path "$ANDROID_KEYSTORE_PATH" \
    --key-store-password "$ANDROID_KEYSTORE_PASSWORD" \
    --key-store-alias "$ANDROID_KEYSTORE_ALIAS" \
    --key-store-alias-password "$ANDROID_KEYSTORE_ALIAS_PASSWORD" \
    --aab || echo "Android release build failed."
    
  fastlane android release || echo "Fastlane Android upload failed."
fi

echo ""
echo "=== Publishing to iOS (App Store) ==="
fastlane ios release || echo "Fastlane iOS upload failed. Please ensure App Store API Keys are in your .env"

echo "Done! The process has finished."

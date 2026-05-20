#!/bin/bash
echo "===================================================="
echo "      BUILDING YOUR BINARY FOR APP STORE CONNECT    "
echo "===================================================="
echo "Please wait. This will take a few minutes..."

cd "/Users/waelio/Code/GitHub/peace2074/peace2074.com/peace2074-mobile/platforms/ios"

# Nuke the corrupted cache and old builds
sudo rm -rf ~/Library/Developer/Xcode/DerivedData/peace2074mobile-* 2>/dev/null
rm -rf ./build 2>/dev/null

# Clean and Build the archive
xcodebuild -project peace2074mobile.xcodeproj -scheme peace2074mobile -configuration Release -archivePath ./peace2074mobile.xcarchive clean archive -allowProvisioningUpdates

echo "===================================================="
echo "                 BUILD COMPLETE!                    "
echo "===================================================="

# Open the archive in Xcode Organizer
open ./peace2074mobile.xcarchive

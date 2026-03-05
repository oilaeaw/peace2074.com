#!/bin/bash
# Fix Capacitor iOS headers for build compatibility
# Run this before building in Xcode if you encounter header import errors

set -e

CAPACITOR_PATH="/Users/waelio/Code/peace2074.com/node_modules/.pnpm/@capacitor+ios@7.5.0_@capacitor+core@7.5.0/node_modules/@capacitor/ios/Capacitor/Capacitor"

if [ ! -d "$CAPACITOR_PATH" ]; then
    echo "❌ Capacitor iOS path not found: $CAPACITOR_PATH"
    exit 1
fi

echo "🔧 Fixing Capacitor iOS headers..."

# Fix CAPInstanceDescriptor.h - replace Cordova.h with CDVConfigParser.h
sed -i '' 's|#import <Cordova/Cordova\.h>|#import <Cordova/CDVConfigParser.h>|g' \
    "$CAPACITOR_PATH/CAPInstanceDescriptor.h"

# Fix CAPInstanceConfiguration.h if needed
sed -i '' 's|#import <Cordova/Cordova\.h>|#import <Cordova/CDVConfigParser.h>|g' \
    "$CAPACITOR_PATH/CAPInstanceConfiguration.h" 2>/dev/null || true

# Fix @import statements
sed -i '' 's|@import UIKit;|#import <UIKit/UIKit.h>|g' "$CAPACITOR_PATH"/*.h
sed -i '' 's|@import Cordova;|#import <Cordova/CDVConfigParser.h>|g' "$CAPACITOR_PATH"/*.h
sed -i '' 's|@import Foundation;|#import <Foundation/Foundation.h>|g' "$CAPACITOR_PATH"/*.h
sed -i '' 's|@import WebKit;|#import <WebKit/WebKit.h>|g' "$CAPACITOR_PATH"/*.h

# Fix CAPBridgeViewController+CDVScreenOrientationDelegate.h - add missing import
SCREEN_ORIENTATION_FILE="$CAPACITOR_PATH/CAPBridgeViewController+CDVScreenOrientationDelegate.h"
if [ -f "$SCREEN_ORIENTATION_FILE" ]; then
    if ! grep -q "CDVScreenOrientationDelegate.h" "$SCREEN_ORIENTATION_FILE"; then
        sed -i '' 's|\(#import <Capacitor/Capacitor-Swift.h>\)|\1\
#import <Cordova/CDVScreenOrientationDelegate.h>|' "$SCREEN_ORIENTATION_FILE"
    fi
fi

echo "✅ Headers fixed!"
echo ""
echo "Now in Xcode:"
echo "  1. Clean Build Folder (Cmd+Shift+K)"
echo "  2. Build (Cmd+B)"

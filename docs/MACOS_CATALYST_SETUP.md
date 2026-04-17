# macOS (Mac Catalyst) Setup — PEACE2074

This document explains how to run the iOS Capacitor app as a macOS app using Mac Catalyst.

## What was enabled in project config

The iOS target has Mac Catalyst support enabled in:

- `ios/App/App.xcodeproj/project.pbxproj`
  - `SUPPORTS_MACCATALYST = YES`
  - `DERIVE_MACCATALYST_PRODUCT_BUNDLE_IDENTIFIER = YES`

for both `Debug` and `Release` target configurations.

## Open and run on macOS

1. Sync latest web/native changes:
   - `pnpm ios:sync`
2. Open Xcode workspace:
   - `ios/App/App.xcworkspace`
3. In Xcode, select target `App`.
4. Select a **My Mac (Designed for iPad)** / **My Mac (Mac Catalyst)** run destination.
5. Build and run.

## Signing notes

- Keep **Automatically manage signing** ON for the `App` target.
- Use the same team that owns `com.peace2074.app`.
- If signing fails on Mac, let Xcode regenerate profiles/certificates and retry.

## Known Capacitor notes

- Most web + Capacitor flows work as-is.
- Any iOS-device-specific plugin or API may need guards before Mac distribution.
- Treat this as Phase 1: functional Catalyst build first, platform polishing next.

## Recommended Phase 2 polish

- Keyboard shortcuts for common Quran actions.
- Pointer/focus optimizations for desktop navigation.
- Window-size adaptive layout tuning for large displays.
- QA pass for native-only branches (`capacitor:` protocol and iOS runtime checks).

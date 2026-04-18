# iOS Development Guide for Peace2074

## Quick Start

### 1. Development Setup

**Install dependencies:**

```bash
pnpm install
```

**Start dev servers (required for live reload):**

```bash
pnpm dev
# This runs:
# - Vite dev server on http://localhost:4000
# - Nitro API on http://localhost:3000
```

### 2. Configure for Local Development

Edit `capacitor.config.ts` to point to your local dev server:

```typescript
const config: CapacitorConfig = {
  appId: 'com.peace2074.app',
  appName: 'Peace2074',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    url: 'http://localhost:4000', // ← Local dev server
    cleartext: true,
  },
}
```

### 3. Build and Open Xcode

**Option A - Use npm script:**

```bash
pnpm mobile:ios
```

**Option B - Manual steps:**

```bash
# Build Vue app
pnpm build

# Sync to iOS (copies dist to native project)
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### 4. Run in Xcode

1. **Wait for indexing** (progress bar at top)
2. **Select "App" scheme** (dropdown at top left)
3. **Choose simulator** (e.g., iPhone 16 Pro)
4. **Click ▶️** to build and run

### Xcode Cloud Shared Environment Variables

If you build the iOS app in Xcode Cloud and want reusable configuration across multiple workflows, create the variable once and apply it to every workflow that should use the production API.

Recommended shared variable for this project:

```text
VITE_NITRO_BASE=https://peace2074.com/api
```

Use these Apple form values:

| Field               | Value                       |
| ------------------- | --------------------------- |
| Name                | `VITE_NITRO_BASE`           |
| Value               | `https://peace2074.com/api` |
| Secret              | `No`                        |
| Keep value redacted | `Off`                       |

How to configure and reuse it:

1. Open **Xcode Cloud** in Xcode or App Store Connect.
2. Go to **Shared Environment Variables**.
3. Add `VITE_NITRO_BASE` with the value `https://peace2074.com/api`.
4. Leave redaction/secret mode **off** because this value is public.
5. Select every iOS workflow that should use the production API.
6. Save once; future edits to the shared variable can then be reused by all attached workflows.

Notes:

- This value is **not a secret**, so it does not need redaction.
- This is for **native iOS/Xcode Cloud builds**, not for the Netlify web deployment.
- The repo also keeps a production mobile fallback to `https://peace2074.com/api`, but setting the variable makes the intended build-time config explicit.

---

## Development Workflows

### Live Reload Development

For the best development experience with hot reload:

1. **Start dev servers:**

   ```bash
   pnpm dev
   ```

2. **Configure local URL** in `capacitor.config.ts`:

   ```typescript
   server: {
       url: 'http://localhost:4000',
       cleartext: true,
   }
   ```

3. **Sync and open:**

   ```bash
   npx cap sync ios
   npx cap open ios
   ```

4. **Run in simulator** - your app will now load from the dev server with hot reload!

**Important:** Your Mac and iOS simulator can both access `localhost:4000`.

### Testing Production Build

To test the bundled production version:

1. **Remove server URL** from `capacitor.config.ts`:

   ```typescript
   server: {
       androidScheme: 'https',
       // url: 'http://localhost:4000',  // ← Comment out or remove
       cleartext: true,
   }
   ```

2. **Build and sync:**

   ```bash
   pnpm build
   npx cap sync ios
   ```

3. **Run in Xcode** - app will use bundled dist files

---

## Common Commands

```bash
# Full rebuild and open
pnpm mobile:ios

# Sync changes without rebuilding everything
npx cap sync ios

# Open in Xcode without syncing
npx cap open ios

# Update Capacitor iOS platform
npx cap update ios

# Add new iOS platform (if removed)
npx cap add ios

# Copy web assets only
npx cap copy ios

# Clean Xcode build cache
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

---

## App Configuration

### App Info

**File:** `capacitor.config.ts`

```typescript
{
    appId: 'com.peace2074.app',      // Bundle identifier
    appName: 'Peace2074',             // Display name
    webDir: 'dist',                   // Build output
}
```

### App Icons & Splash Screen

**iOS icons location:**

```
ios/App/App/Assets.xcassets/AppIcon.appiconset/
```

**Generate icons:**

```bash
# Install icon generator
npm install -g @capacitor/assets

# Generate from source image
npx @capacitor/assets generate --iconSource resources/icon.png
```

### App Store Metadata

Edit in Xcode:

1. Open `App.xcworkspace`
2. Select "App" target
3. Go to "General" tab
4. Set:
   - Display Name
   - Bundle Identifier
   - Version
   - Build Number
   - Team (for signing)

---

## Troubleshooting

### "Failed to load container for document"

**Cause:** Opening `.xcodeproj` instead of `.xcworkspace`

**Solution:** Always open `App.xcworkspace` (includes CocoaPods):

```bash
open ios/App/App.xcworkspace
```

### "Build input file cannot be found: peace2074/Info.plist"

**Cause:** Building wrong target (peace2074 instead of App)

**Solution:**

1. Click scheme dropdown (top left in Xcode)
2. Select **App** (not peace2074)
3. Build again

### Missing Podfile or Dependencies

**Solution:**

```bash
cd ios/App
pod install
```

### Simulator Not Loading App

**Solution:**

1. Clean build: Cmd+Shift+K in Xcode
2. Delete derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   ```
3. Reset simulator: Device → Erase All Content and Settings
4. Rebuild and run

### Cannot Connect to localhost

**Issue:** App can't reach `http://localhost:4000`

**Solutions:**

- Ensure dev server is running (`pnpm dev`)
- Use `localhost` (not `127.0.0.1`) for iOS simulator
- For physical device, use your Mac's IP:
  ```typescript
  url: 'http://192.168.1.100:4000' // Your Mac's IP
  ```

---

## App Store Deployment

### 1. Prepare Production Build

**Update capacitor.config.ts:**

```typescript
server: {
    androidScheme: 'https',
    url: 'https://peace2074.com',  // Production URL
}
```

**Build:**

```bash
pnpm build
npx cap sync ios
```

### 2. Configure Xcode Project

1. Open `App.xcworkspace`
2. Select "App" target
3. **General tab:**
   - Version: `0.2.7` (from package.json)
   - Build: Increment for each submission (e.g., `1`, `2`, `3`)
   - Team: Select your Apple Developer account

4. **Signing & Capabilities:**
   - ✅ Automatically manage signing
   - Select Team
   - Provisioning Profile will auto-generate

### 3. Archive for App Store

1. **Select "Any iOS Device"** (not a simulator)
2. **Product → Archive** (Cmd+Shift+B won't work)
3. Wait for build to complete
4. **Organizer window opens** → Distribute App
5. Follow App Store Connect workflow

### 4. Upload to App Store Connect

1. Choose "App Store Connect"
2. Select "Upload"
3. Sign the app
4. Upload

### 5. App Store Connect

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Select your app
3. Create new version
4. Add metadata:
   - Screenshots
   - Description
   - Keywords
   - Support URL
   - Privacy Policy
5. Submit for review

---

## Adding Capacitor Plugins

### Example: Add Camera Plugin

```bash
# Install plugin
pnpm add @capacitor/camera

# Sync to iOS
npx cap sync ios
```

**Update Info.plist permissions** (if needed):

1. Open Xcode
2. Select App target → Info tab
3. Add keys like `NSCameraUsageDescription`

### Commonly Used Plugins

- `@capacitor/camera` - Camera & photos
- `@capacitor/geolocation` - Location services
- `@capacitor/push-notifications` - Push notifications
- `@capacitor/local-notifications` - Local notifications
- `@capacitor/share` - Native share sheet
- `@capacitor/status-bar` - Status bar styling
- `@capacitor/keyboard` - Keyboard events
- `@capacitor/app` - App state/lifecycle

---

## Performance Tips

1. **Use production builds for testing:**
   - Dev builds are slower
   - Test performance with `pnpm build`

2. **Optimize images:**
   - Use WebP format
   - Compress images before bundling

3. **Code splitting:**
   - Already configured with Vite
   - Routes load on demand

4. **Native splash screen:**
   - Prevents white flash on launch
   - Configure in Xcode Assets

---

## Resources

- [Capacitor iOS Docs](https://capacitorjs.com/docs/ios)
- [Apple Developer Portal](https://developer.apple.com)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Xcode Documentation](https://developer.apple.com/xcode/)

---

## Project Structure

```
ios/
├── App/
│   ├── App.xcodeproj/          # Xcode project
│   ├── App.xcworkspace/        # ← Open this in Xcode
│   ├── App/                     # App target
│   │   ├── Assets.xcassets/    # Icons, splashscreen
│   │   ├── capacitor.config.json
│   │   ├── config.xml
│   │   ├── public/             # Synced from dist/
│   │   └── peace2074/          # (Legacy target - don't use)
│   ├── Podfile                  # CocoaPods dependencies
│   └── Pods/                    # CocoaPods packages
└── capacitor-cordova-ios-plugins/
```

---

## Quick Commands Reference

```bash
# Development
pnpm dev                        # Start dev servers
pnpm mobile:ios                 # Build + sync + open Xcode

# Building
pnpm build                      # Build Vue app
npx cap sync ios               # Sync to iOS

# Xcode
npx cap open ios               # Open in Xcode
open ios/App/App.xcworkspace   # Direct open

# Maintenance
npx cap update ios             # Update Capacitor iOS
pod update                      # Update CocoaPods
rm -rf ~/Library/Developer/Xcode/DerivedData/*  # Clean cache
```

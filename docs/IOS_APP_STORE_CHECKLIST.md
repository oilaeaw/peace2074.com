# iOS App Store Submission Checklist

## Pre-Submission Requirements

### 1. Apple Developer Account

- [ ] Enrolled in Apple Developer Program ($99/year)
- [ ] Account in good standing
- [ ] Team ID configured

### 2. App Store Connect Setup

- [ ] App created in App Store Connect
- [ ] Bundle ID registered: `com.peace2074.app`
- [ ] App name reserved: "Peace2074"
- [ ] Privacy Policy URL added
- [ ] Support URL added

### 3. Code & Build

#### Version Numbers

- [ ] Version in `package.json`: `0.2.7`
- [ ] Build number incremented in Xcode
- [ ] Version matches across all targets

#### App Configuration

- [ ] `capacitor.config.ts` points to production URL
- [ ] No debug code or console.logs
- [ ] API keys secured (not hardcoded)
- [ ] Error handling tested

#### Build Settings (Xcode)

- [ ] Signing: Automatic, with valid Team
- [ ] Deployment Target: iOS 13.0+ (check minimum)
- [ ] Bundle Identifier: `com.peace2074.app`
- [ ] Display Name: "Peace2074"
- [ ] Build Configuration: Release (not Debug)

### 4. Assets & Resources

#### App Icon

- [ ] All required sizes provided (1024×1024 for App Store)
- [ ] No alpha channels in icons
- [ ] No rounded corners (iOS adds them)
- [ ] Icon looks good at all sizes

Location: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

#### Launch Screen / Splash Screen

- [ ] Splash screen configured
- [ ] Loads quickly
- [ ] Matches app branding

#### Screenshots (Required for App Store)

- [ ] iPhone 6.7" (required) - iPhone 15 Pro Max
- [ ] iPhone 6.5" (required) - iPhone 11 Pro Max
- [ ] iPad Pro 12.9" (if supporting iPad)
- [ ] 3-10 screenshots per device size
- [ ] All text readable
- [ ] Shows key features

### 5. App Metadata (App Store Connect)

#### Required Text

- [ ] App Name (30 chars max)
- [ ] Subtitle (30 chars max)
- [ ] Description (4000 chars max)
- [ ] Keywords (100 chars, comma-separated)
- [ ] What's New in This Version
- [ ] Promotional Text (170 chars)

#### URLs

- [ ] Privacy Policy URL (required)
- [ ] Support URL (required)
- [ ] Marketing URL (optional)

#### Categories

- [ ] Primary Category selected
- [ ] Secondary Category (optional)

#### Age Rating

- [ ] Completed Age Rating questionnaire
- [ ] Appropriate for all content

### 6. Capabilities & Permissions

#### Info.plist Keys (if used)

- [ ] `NSCameraUsageDescription` (if using camera)
- [ ] `NSPhotoLibraryUsageDescription` (if using photos)
- [ ] `NSLocationWhenInUseUsageDescription` (if using location)
- [ ] `NSUserTrackingUsageDescription` (if tracking - required for ads)
- [ ] All descriptions are clear and user-friendly

#### App Capabilities (Xcode → Signing & Capabilities)

- [ ] Push Notifications (if used)
- [ ] Background Modes (if used)
- [ ] In-App Purchase (if used)
- [ ] Sign in with Apple (if auth used)

### 7. Testing

#### Functional Testing

- [ ] All core features work
- [ ] Authentication flow (if applicable)
- [ ] Network requests work (API connectivity)
- [ ] Offline behavior tested
- [ ] Forms validation working
- [ ] Deep links work (if applicable)

#### Device Testing

- [ ] Tested on iPhone (multiple sizes if possible)
- [ ] Tested on iPad (if claiming iPad support)
- [ ] Tested on iOS minimum version
- [ ] Tested on latest iOS version

#### Performance

- [ ] App launches within 3 seconds
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] Animations performant
- [ ] Battery usage acceptable

#### Localization (if supporting multiple languages)

- [ ] All text translated
- [ ] RTL layout working (for Arabic/Hebrew)
- [ ] Date/time formats correct
- [ ] Currency formats correct

### 8. Legal & Compliance

#### Privacy

- [ ] Privacy Policy complete and accessible
- [ ] GDPR compliant (if applicable)
- [ ] Data collection disclosed
- [ ] User data deletion process available

#### Content Rights

- [ ] All content properly licensed
- [ ] No copyright violations
- [ ] Quran text sources credited
- [ ] Third-party libraries comply with licenses

#### Terms of Service

- [ ] Terms available and clear
- [ ] User agreements in place

### 9. App Store Review Guidelines Compliance

#### General

- [ ] App is complete (no "coming soon" features)
- [ ] No placeholder content
- [ ] No obvious bugs or crashes
- [ ] App metadata is accurate
- [ ] Screenshots show actual app

#### Specific to Peace2074

- [ ] Religious content is respectful
- [ ] No offensive or inflammatory content
- [ ] User-generated content moderated (if applicable)
- [ ] Complies with App Store guidelines for religious apps

#### Technical

- [ ] App doesn't request unnecessary permissions
- [ ] Network requests use HTTPS
- [ ] No private API usage
- [ ] Compatible with latest iOS

### 10. Archive & Upload

#### Create Archive

- [ ] Select "Any iOS Device" (not simulator)
- [ ] Product → Archive
- [ ] Archive succeeds without errors
- [ ] Archive validates successfully

#### Upload

- [ ] Distribute App → App Store Connect
- [ ] Upload completes
- [ ] No warnings about missing compliance
- [ ] Build appears in App Store Connect

#### TestFlight (Recommended)

- [ ] Build uploaded to TestFlight
- [ ] Internal testing passed
- [ ] External beta testing (optional)
- [ ] All critical bugs fixed

---

## Archive Process (Step-by-Step)

### In Xcode:

1. **Select Device**
   - Click device dropdown → "Any iOS Device"

2. **Product Menu**
   - Product → Clean Build Folder (Cmd+Shift+K)
   - Product → Archive (Cmd+Shift+B won't work)

3. **Organizer Window**
   - Wait for archiving to complete
   - Click "Distribute App"

4. **Distribution Method**
   - Select "App Store Connect"
   - Click "Next"

5. **Upload Options**
   - Select "Upload"
   - Click "Next"

6. **Signing**
   - Automatically manage signing
   - Click "Next"

7. **Review**
   - Review app info
   - Click "Upload"

8. **Wait**
   - Upload completes
   - You'll get an email when processing is done

### In App Store Connect:

1. **Go to App Store Connect**
   - https://appstoreconnect.apple.com

2. **Select App**
   - My Apps → Peace2074

3. **Create Version**
   - Click "+ Version" or "Add for Review"
   - Enter version: 0.2.7

4. **Complete Metadata**
   - Add all required screenshots
   - Fill in description
   - Select pricing

5. **Select Build**
   - Under "Build" section
   - Click "+" to add build
   - Select the uploaded build

6. **Compliance**
   - Answer export compliance questions
   - Usually "No" for encryption

7. **Submit**
   - Click "Submit for Review"
   - Answer additional questions
   - Confirm submission

---

## Common Rejection Reasons (and How to Avoid)

### 1. Crashes

**Solution:** Test thoroughly on multiple devices/iOS versions

### 2. Incomplete Information

**Solution:** Fill out all metadata fields, add all required screenshots

### 3. Privacy Policy Missing

**Solution:** Add valid, accessible privacy policy URL

### 4. App Preview/Screenshots Don't Match

**Solution:** Ensure screenshots show actual current app

### 5. Placeholder Content

**Solution:** Remove all "lorem ipsum" or demo content

### 6. Links Don't Work

**Solution:** Test all URLs in metadata

### 7. Missing Permission Descriptions

**Solution:** Add clear NSUsageDescription strings

### 8. Performance Issues

**Solution:** Optimize app, test on older devices

---

## Post-Submission

### Review Process

- Usually 24-48 hours
- May take up to 7 days
- You'll get email updates

### If Rejected

- Read rejection reason carefully
- Fix issues
- Respond to reviewer (if needed)
- Submit new build

### If Approved

- App goes live (or scheduled release)
- Monitor reviews and ratings
- Respond to user feedback
- Plan updates

---

## Version Update Checklist (for 0.2.8, 0.2.9, etc.)

- [ ] Update version in `package.json`
- [ ] Update version in `apps/nitro-api/package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Increment Build number in Xcode
- [ ] Test all new features
- [ ] Update "What's New" section
- [ ] Create new archive
- [ ] Upload to TestFlight
- [ ] Test via TestFlight
- [ ] Submit for review

---

## Useful Commands

```bash
# Check current version
grep '"version"' package.json

# Build for iOS
pnpm build
npx cap sync ios

# Open in Xcode
npx cap open ios

# Update Capacitor
npx cap update ios

# View archive list
ls ~/Library/Developer/Xcode/Archives/

# Clean everything
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ios/App/Pods
cd ios/App && pod install
```

---

## Resources

- [Apple Developer Program](https://developer.apple.com/programs/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [App Store Screenshot Specifications](https://help.apple.com/app-store-connect/#/devd274dd925)

---

## Timeline Estimate

- **First Submission:** 1-2 weeks preparation
- **Review:** 24-48 hours (can be longer)
- **Updates:** 3-5 days preparation + review time

---

## Support Contacts

If issues arise:

- Apple Developer Support: https://developer.apple.com/contact/
- App Review: Reply to rejection email
- Technical: Apple Developer Forums

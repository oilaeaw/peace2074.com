# OAuth Authentication Integration Guide

## Overview

Implemented Google and Apple OAuth 2.0 authentication for peace2074.com using the **Arctic** TypeScript-first OAuth library.

---

## ✅ What's Been Implemented

### Backend (Nitro API)

1. **OAuth Configuration** ([apps/nitro-api/server/utils/oauth.ts](apps/nitro-api/server/utils/oauth.ts))
   - `getGoogleOAuth()` - Creates Google OAuth client
   - `getAppleOAuth()` - Creates Apple OAuth client
   - Reads credentials from environment variables
   - Type-safe `OAuthUserInfo` interface

2. **Google OAuth Routes**
   - **Initiation**: [/api/auth/google](apps/nitro-api/server/routes/auth/google.get.ts)
     - Generates secure state token (CSRF protection)
     - Redirects to Google consent screen
     - Requests scopes: `openid`, `profile`, `email`
   - **Callback**: [/api/auth/google/callback](apps/nitro-api/server/routes/auth/google/callback.get.ts)
     - Validates state token
     - Exchanges authorization code for access token
     - Fetches user profile from Google
     - Creates or links user account
     - Establishes session with cookie
     - Redirects to `/dashboard`

3. **Apple OAuth Routes**
   - **Initiation**: [/api/auth/apple](apps/nitro-api/server/routes/auth/apple.get.ts)
     - Generates secure state token
     - Redirects to Apple Sign In
     - Requests scopes: `name`, `email`
   - **Callback**: [/api/auth/apple/callback](apps/nitro-api/server/routes/auth/apple/callback.get.ts)
     - Validates state token
     - Exchanges authorization code for ID token
     - Decodes JWT to extract user info
     - Creates or links user account
     - Establishes session with cookie
     - Redirects to `/dashboard`

4. **User Management** ([apps/nitro-api/server/utils/users.ts](apps/nitro-api/server/utils/users.ts))
   - Updated `User` interface with `google_id` and `apple_id` fields
   - New `findOrCreateOAuthUser()` function:
     - Finds existing user by provider ID
     - Links OAuth provider to existing email account
     - Creates new user if not found
     - Works with both Prisma and fallback storage
   - OAuth users created with empty password (not needed)
   - Username generated from email: `user@example.com` → `user_abc123`

### Frontend (Vue 3)

1. **Login UI** ([src/views/login.vue](src/views/login.vue))
   - Updated `openSocialLogin()` to redirect to OAuth endpoints:
     ```typescript
     function openSocialLogin(provider: 'google' | 'apple') {
       const oauthUrl = `${NITRO_BASE}/auth/${provider}`
       window.location.href = oauthUrl
     }
     ```
   - Existing Google and Apple buttons in template work seamlessly
   - Buttons disabled during form submission

---

## 🔧 Setup Instructions

### 1. Google OAuth Setup

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: "Peace2074" (or your preference)
4. Click "Create"

#### Step 2: Enable Google+ API

1. Navigate to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

#### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Configure consent screen (if prompted):
   - User Type: "External"
   - App name: "Peace2074"
   - User support email: Your email
   - Developer contact: Your email
4. Application type: "Web application"
5. Name: "Peace2074 Web Client"
6. **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://peace2074.com/api/auth/google/callback`
7. Click "Create"
8. **Copy Client ID and Client Secret** (you'll need these)

#### Step 4: Set Environment Variables

```bash
# .env (Development)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Netlify (Production)
# Add these in Netlify Dashboard → Site Settings → Environment Variables
GOOGLE_CLIENT_ID=166860955615-i3oufoanjcpm3gakrtcqutnhjgn9ci30.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://peace2074.com/api/auth/google/callback
PUBLIC_URL=https://peace2074.com
```

---

### 2. Apple Sign In Setup

#### Step 1: Apple Developer Account

- Requires paid Apple Developer Program membership ($99/year)
- Enroll at [developer.apple.com](https://developer.apple.com/)

#### Step 2: Create App ID

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list)
2. Click "+" to create new identifier
3. Select "App IDs" → Continue
4. Type: "App"
5. Description: "Peace2074 Web App"
6. Bundle ID: `com.peace2074.app` (explicit)
7. Capabilities: Check "Sign In with Apple"
8. Click "Continue" → "Register"

#### Step 3: Create Services ID

1. Click "+" to create new identifier
2. Select "Services IDs" → Continue
3. Description: "Peace2074 Web Auth"
4. Identifier: `com.peace2074.auth` (must be different from App ID)
5. Check "Sign In with Apple"
6. Click "Configure":
   - Primary App ID: Select your App ID from Step 2
   - Web Domain: `peace2074.com` (no protocol)
   - Return URLs:
     - Development: `http://localhost:3000/api/auth/apple/callback`
     - Production: `https://peace2074.com/api/auth/apple/callback`
7. Click "Continue" → "Register"

#### Step 4: Create Sign In with Apple Key

1. Go to "Keys" section
2. Click "+" to create new key
3. Key Name: "Peace2074 Sign In Key"
4. Check "Sign In with Apple"
5. Click "Configure":
   - Primary App ID: Select your App ID
6. Click "Continue" → "Register"
7. **Download the .p8 key file** (only shown once!)
8. Note the Key ID (10-character string)

#### Step 5: Get Team ID

1. Go to [Apple Developer Membership](https://developer.apple.com/account/#/membership/)
2. Copy your Team ID (10-character alphanumeric)

#### Step 6: Set Environment Variables

```bash
# .env (Development)
APPLE_CLIENT_ID=com.peace2074.auth
APPLE_TEAM_ID=ABCDE12345
APPLE_KEY_ID=XYZ9876543
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
(full contents of .p8 file as single line or with escaped newlines)
-----END PRIVATE KEY-----"
APPLE_REDIRECT_URI=http://localhost:3000/api/auth/apple/callback

# Netlify (Production)
APPLE_CLIENT_ID=com.peace2074.auth
APPLE_TEAM_ID=ABCDE12345
APPLE_KEY_ID=XYZ9876543
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGTAgEA...-----END PRIVATE KEY-----"
APPLE_REDIRECT_URI=https://peace2074.com/api/auth/apple/callback
PUBLIC_URL=https://peace2074.com
```

**Important**: For `APPLE_PRIVATE_KEY`, either:

- Replace newlines with `\n` (recommended for Netlify)
- Or paste entire .p8 file contents as multiline string (development `.env` only)

---

## 🧪 Testing

### Development (Local)

1. **Start servers**:

   ```bash
   pnpm dev
   ```

2. **Test Google OAuth**:
   - Navigate to `http://localhost:4000/login`
   - Click "Sign in with Google"
   - Should redirect to Google consent screen
   - After approval, redirects to `/dashboard` with session cookie

3. **Test Apple OAuth**:
   - Click "Sign in with Apple"
   - Should redirect to Apple Sign In
   - After approval, redirects to `/dashboard`

4. **Verify session**:
   - Open DevTools → Application → Cookies
   - Check for `waelio_session` cookie (httpOnly)
   - Cookie should persist across page reloads

### Production (Netlify)

1. **Deploy with environment variables set**:

   ```bash
   pnpm build
   # Push to GitHub (auto-deploys via Netlify)
   ```

2. **Test on production URL**:
   - Visit `https://peace2074.com/login`
   - Test both Google and Apple sign-in flows
   - Verify redirects work correctly
   - Check session persistence

---

## 🔐 Security Features

### CSRF Protection

- State parameter generated with `crypto.randomBytes(32)`
- Stored in httpOnly cookie with 10-minute expiration
- Validated on callback to prevent CSRF attacks

### Session Management

- HMAC-signed session cookies (existing auth system)
- 7-day expiration
- httpOnly, secure (production), sameSite attributes
- Cookie domain properly configured for Capacitor apps

### OAuth Scopes

- **Google**: Only requests `openid`, `profile`, `email` (minimal permissions)
- **Apple**: Only requests `name`, `email`
- No sensitive permissions requested

### Email Verification

- Google: Checks `email_verified` field
- Apple: Checks `email_verified` claim in ID token
- Rejects unverified emails

---

## 📊 User Data Flow

### First-Time Login (New User)

1. User clicks "Sign in with Google"
2. Redirects to Google consent screen
3. User approves access
4. Google redirects to `/api/auth/google/callback?code=...&state=...`
5. Backend validates state
6. Backend exchanges code for access token
7. Backend fetches user profile (email, name, picture)
8. Backend calls `findOrCreateOAuthUser()`:
   - Checks if `google_id` exists → Not found
   - Checks if email exists → Not found
   - Creates new user:
     ```typescript
     {
       id: "117234567890123456789",
       username: "user_abc123",
       email: "user@gmail.com",
       password: "", // Not needed for OAuth
       role: "user",
       first_name: "John Doe",
       avatar_url: "https://...",
       google_id: "117234567890123456789"
     }
     ```
9. Backend creates session cookie
10. Backend redirects to `/dashboard`
11. Frontend loads with authenticated session

### Subsequent Logins (Existing User)

Same flow, but step 8 finds existing user by `google_id` and returns immediately.

### Account Linking

If user logs in with Google AND email already exists in database (e.g., from password-based registration):

- Backend links Google account by setting `google_id` field
- User can now log in with either password OR Google

Similarly for Apple Sign In with `apple_id`.

---

## 🐛 Troubleshooting

### "Google OAuth not configured"

- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Restart Nitro server after adding env vars
- Check `.env` file has no typos in variable names

### "Invalid OAuth state"

- Browser cookies might be disabled
- Check redirect URI matches exactly in Google Console
- Clear browser cookies and try again
- State cookie expires after 10 minutes - don't take too long

### "Redirect URI mismatch"

- Google Console redirect URIs must match EXACTLY:
  - ✅ `https://peace2074.com/api/auth/google/callback`
  - ❌ `https://www.peace2074.com/api/auth/google/callback` (www subdomain)
  - ❌ `https://peace2074.com/api/auth/google/callback/` (trailing slash)
- Check both development and production URIs are added

### Apple Sign In shows "Service not configured"

- Verify Services ID has "Sign In with Apple" enabled
- Check domains and redirect URLs are configured
- Wait 30 minutes after changes (Apple caches configuration)

### "Failed to fetch Google user info"

- Google+ API not enabled in Cloud Console
- Access token expired (unlikely within OAuth flow)
- Network connectivity issue

### User created but session not working

- Check `waelio_session` cookie is being set (DevTools → Application)
- Verify `credentials: 'include'` in frontend fetch calls
- Check cookie `sameSite` and `secure` attributes match your environment

---

## 📋 Integration Checklist

- [x] Install Arctic library for OAuth
- [x] Create OAuth utility with Google/Apple clients
- [x] Implement Google OAuth routes (initiate + callback)
- [x] Implement Apple OAuth routes (initiate + callback)
- [x] Update User schema with `google_id` and `apple_id`
- [x] Implement `findOrCreateOAuthUser()` function
- [x] Update login UI to redirect to OAuth endpoints
- [x] Document OAuth setup in DEVELOPMENT_REQUIREMENTS.md
- [ ] Set up Google Cloud Console project
- [ ] Set up Apple Developer Services ID
- [ ] Add environment variables to `.env` (development)
- [ ] Add environment variables to Netlify (production)
- [ ] Test Google OAuth end-to-end
- [ ] Test Apple OAuth end-to-end
- [ ] Verify account linking works
- [ ] Update Prisma schema (if using MongoDB)

---

## 📚 Additional Resources

- [Arctic Documentation](https://arctic.js.org/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [OAuth 2.0 RFC](https://datatracker.ietf.org/doc/html/rfc6749)

---

**Last Updated**: April 8, 2026  
**Version**: 3.0.0

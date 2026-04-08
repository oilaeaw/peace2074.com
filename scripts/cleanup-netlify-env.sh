#!/bin/bash
# Script to remove legacy and duplicate Netlify environment variables
# Only keep the NITRO_* prefixed versions and essential variables

set -e

echo "🧹 Cleaning up Netlify environment variables..."

# Array of variables to REMOVE (legacy/duplicates)
VARS_TO_REMOVE=(
  # Legacy Nuxt variables
  "NUXT_AUTH_SECRET"
  "NUXT_CLOUDINARY_API_KEY"
  "NUXT_CLOUDINARY_API_SECRET"
  "NUXT_CLOUDINARY_CLOUD_NAME"
  "NUXT_EMAIL_PRIVATE_KEY"
  "NUXT_EMAIL_PUBLIC_KEY"
  "NUXT_EMAIL_TEMPLATE"
  "NUXT_GITHUB_CALLBACK_URL"
  "NUXT_GITHUB_CLIENT_ID"
  "NUXT_GITHUB_CLIENT_SECRET"
  "NUXT_JWT_ACCESS_TOKEN_SECRET"
  "NUXT_JWT_REFRESH_TOKEN_SECRET"
  "NUXT_MAILJS_API_URL"
  "NUXT_ROOT_USER"
  
  # Duplicate GitHub variables
  "GithubAppID"
  "GithubClientID"
  "GithubClientSecret"
  
  # EmailJS (if not used, otherwise keep)
  "EMAILJS_PRIVATE_KEY"
  "EMAILJS_PUBLIC_KEY"
  "EMAILJS_TEMPLATE_ID"
  
  # Legacy email variables
  "EMAIL_PRIVATE_KEY"
  "EMAIL_PUBLIC_KEY"
  "EMAIL_TEMPLATE"
  "EMAIL_USER"
  
  # Netlify Emails plugin vars (if not using the plugin)
  "NETLIFY_EMAILS_DIRECTORY"
  "NETLIFY_EMAILS_MAILGUN_DOMAIN"
  "NETLIFY_EMAILS_MAILGUN_HOST_REGION"
  "NETLIFY_EMAILS_PROVIDER"
  "NETLIFY_EMAILS_PROVIDER_API_KEY"
  "NETLIFY_EMAILS_SECRET"
  
  # Duplicates (keep NITRO_ versions only)
  "AUTH_SECRET"
  "DEEPSEEK_API_KEY"
  "DEEPSEEK_BASE_URL"
  "VAPID_PRIVATE_KEY"
  "VAPID_PUBLIC_KEY"
  "VAPID_SUBJECT"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "GOOGLE_REDIRECT_URI"
  "APPLE_CLIENT_ID"
  "APPLE_TEAM_ID"
  "APPLE_KEY_ID"
  "APPLE_PRIVATE_KEY"
  "APPLE_REDIRECT_URI"
  
  # Unused
  "JWT_SECRET"
  "MONGODB_URI"
  "API_URL"
  "VITE_NITRO_PREFIX"
)

# Remove each variable
for var in "${VARS_TO_REMOVE[@]}"; do
  echo "Removing: $var"
  netlify env:unset "$var" --force 2>/dev/null || echo "  ⚠️  $var not found (already removed?)"
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Recommended variables to keep:"
echo "  Core:"
echo "    - DATABASE_URL"
echo "    - NITRO_AUTH_SECRET"
echo "    - JWT_ACCESS_TOKEN_SECRET"
echo "    - JWT_REFRESH_TOKEN_SECRET"
echo "    - CONF_ENCRYPTION_KEY"
echo ""
echo "  DeepSeek AI:"
echo "    - NITRO_DEEPSEEK_API_KEY"
echo "    - NITRO_DEEPSEEK_BASE_URL"
echo ""
echo "  OAuth:"
echo "    - GITHUB_CLIENT_ID (keep this one without NITRO_ prefix)"
echo "    - GITHUB_CLIENT_SECRET"
echo "    - NITRO_GOOGLE_CLIENT_ID"
echo "    - NITRO_GOOGLE_CLIENT_SECRET"
echo "    - NITRO_GOOGLE_REDIRECT_URI"
echo ""
echo "  SMTP:"
echo "    - SMTP_HOST"
echo "    - SMTP_PORT"
echo "    - SMTP_USER"
echo "    - SMTP_PASS"
echo "    - SMTP_FROM"
echo "    - SMTP_SECURE"
echo "    - CONTACT_TO"
echo ""
echo "  Cloudinary:"
echo "    - CLOUDINARY_CLOUD_NAME"
echo "    - CLOUDINARY_API_KEY"
echo "    - CLOUDINARY_API_SECRET"
echo "    - CLOUDINARY_URL (optional)"
echo ""
echo "  Push Notifications:"
echo "    - NITRO_VAPID_PUBLIC_KEY"
echo "    - NITRO_VAPID_PRIVATE_KEY"
echo "    - NITRO_VAPID_SUBJECT"
echo ""
echo "  Optional:"
echo "    - NETLIFY_WEBHOOK_SECRET"
echo "    - GOOGLE_ANALYTICS_ID"
echo "    - NETLIFY_ACCESS_TOKEN"
echo "    - NETLIFY_SITE_ID"
echo "    - PUBLIC_URL"
echo "    - VITE_NITRO_BASE"
echo "    - DISABLE_PRISMA"
echo "    - ENABLE_BLOG_NOTIFICATIONS"
echo "    - AUTH_PASSCODE"
echo ""
echo "Run 'netlify env:list' to verify remaining variables"

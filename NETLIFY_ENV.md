# Environment Variables for Netlify

Set these in Netlify Dashboard → Site Settings → Environment Variables

## Required for Production

### Authentication

- `AUTH_SECRET` - Random secret (32+ chars). Generate: `openssl rand -base64 32`
- `NITRO_AUTH_SECRET` - Same as AUTH_SECRET

### DeepSeek AI

- `DEEPSEEK_API_KEY` - Your DeepSeek API key (starts with sk-)
- `NITRO_DEEPSEEK_API_KEY` - Same as DEEPSEEK_API_KEY
  - Note: Base URL defaults to api.deepseek.com (no env var needed)

### GitHub OAuth

- `GITHUB_CLIENT_ID` - From GitHub OAuth App settings
- `GITHUB_CLIENT_SECRET` - From GitHub OAuth App settings
  - Callback URL: https://your-site.netlify.app/auth/github/callback

### SMTP (for contact form)

- `SMTP_HOST` - smtp.gmail.com
- `SMTP_PORT` - 587
- `SMTP_USER` - your-email@gmail.com
- `SMTP_PASS` - Gmail App Password (not regular password)
- `SMTP_FROM` - your-email@gmail.com
- `CONTACT_TO` - your-email@gmail.com
- `SMTP_SECURE` - false

## Optional

### Netlify Webhooks

- `NETLIFY_WEBHOOK_SECRET` - For build trigger security

### Google Analytics

- `GOOGLE_ANALYTICS_ID` - Your GA4 measurement ID (G-XXXXXXXXXX)

## Security Notes

- Never commit `.env` file to git (already in .gitignore)
- Use strong, unique secrets for production
- Rotate secrets regularly
- Use Netlify's environment variable scoping (Deploy contexts)
  - Production: Required for live site
  - Deploy Previews: Can use test values
  - Branch deploys: Can use test values

## Setting in Netlify UI

1. Go to: https://app.netlify.com/sites/[your-site]/configuration/env
2. Click "Add a variable"
3. Choose scope: "All" or "Production only"
4. Enter Key and Value
5. Click "Create variable"

## Using Netlify CLI (optional)

```bash
# Set individual variable
netlify env:set AUTH_SECRET "your-secret-value"

# Import from .env file (careful!)
netlify env:import .env
```

## Netlify Identity (Managed Service)

Netlify Identity is configured in the Netlify UI:

- Site Settings → Identity → Enable Identity
- External providers (GitHub, Google) configured there
- Email templates in ./emails/ directory
- No env vars needed (handled by Netlify)

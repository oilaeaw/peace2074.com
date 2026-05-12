# Disabling Legacy Prerendering on Cloudflare

## Background

Cloudflare is deprecating its legacy prerendering feature. The legacy built-in prerendering will be disabled in phases:

- **January 20, 2026**: Free plans
- **February 2026**: Personal/Pro plans  
- **March 17, 2026**: Enterprise plans

After these dates, prerendered pages will stop being served unless you migrate to the new Prerender Extension or disable the feature.

## Why This Project Doesn't Need Prerendering

This project is a **Vue 3 SPA (Single Page Application)** with a separate Nitro API backend. It:

- Serves static assets (HTML, CSS, JS) from the Vite build
- Uses client-side routing with Vue Router
- Makes API calls to the Nitro backend for dynamic content
- Does not require server-side rendering or static site generation

For SPAs like this, legacy prerendering is unnecessary and should be disabled.

## How to Disable Legacy Prerendering

Since legacy prerendering cannot be disabled through `cloudflare.toml` or file-based configuration, you must disable it through the Cloudflare dashboard:

### Steps:

1. Log in to your [Cloudflare dashboard](https://app.cloudflare.com)
2. Navigate to your site
3. Go to **Site Configuration** → **Build & deploy** → **Post processing**
4. Find the **Prerendering** section
5. **Disable** or turn off "Legacy Prerendering"
6. Save your changes

## Alternative: Use the New Prerender Extension

If you need prerendering for SEO purposes (e.g., for AI crawlers or search engines), you can migrate to the new [Cloudflare Prerender Extension](https://docs.cloudflare.com/build/post-processing/prerendering/):

1. Disable legacy prerendering (as described above)
2. Go to **Extensions** in your Cloudflare dashboard
3. Find and install the **Prerender** extension
4. Configure it according to your needs

However, for most SPAs, this is not necessary unless you have specific SEO requirements.

## More Information

- [Cloudflare Prerendering Documentation](https://docs.cloudflare.com/build/post-processing/prerendering/)
- [Prerender Extension Announcement](https://www.cloudflare.com/changelog/2025-12-16-prerender-extension-ga/)
- [Prerendering for Modern SPAs](https://www.cloudflare.com/blog/prerendering-an-old-trick-new-again/)

## Verification

After disabling legacy prerendering:

1. Trigger a new deployment
2. Verify the site still works correctly
3. Check that no prerendering warnings appear in the build logs

The site should function identically, as it relies on client-side routing and does not depend on prerendering.

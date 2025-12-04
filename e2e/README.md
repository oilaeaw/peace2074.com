# E2E Testing for Peace2074.com

This directory contains end-to-end tests to verify the application works correctly both locally and in production.

## Test Files

- `basic.test.ts` - Basic functionality tests (homepage, API, health checks)
- `deployment.test.ts` - Deployment verification and technology stack validation

## Running Tests

### Local Development
```bash
# Start the dev server first
deno task dev

# In another terminal, run tests against local server
deno task test:e2e:local
```

### Production Testing
```bash
# Test against deployed Netlify site
deno task test:e2e:prod
```

### Custom URL Testing
```bash
# Test against any URL
deno test --allow-all e2e/tests/ -- --base-url=https://your-custom-url.com
```

## What Tests Verify

✅ **Homepage Loading**
- Returns 200 status code
- Contains Peace2074.com branding
- Shows correct technology stack
- Proper HTML content type

✅ **API Functionality**
- API endpoint responds correctly
- Returns proper JSON structure
- Health check endpoint works
- Correct content types

✅ **Performance**
- Response times under 5 seconds
- Acceptable for serverless cold starts

✅ **Deployment Verification**
- All endpoints accessible
- No legacy framework conflicts
- Correct technology stack reporting
- No Nuxt/Vercel traces

## Test Output

Tests provide detailed console output showing:
- Which endpoint is being tested
- Response times for performance monitoring
- Success/failure status for each test
- Detailed error messages for debugging
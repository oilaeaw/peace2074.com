# Peace2074.com - AI Coding Agent Instructions

## Architecture Overview

This is a **pure Nitro + Deno project** (NOT Nuxt), serving HTML routes and APIs. Key distinction: file-based Nitro routing without Vue/Nuxt components.

```
server/
├── routes/        # HTML handlers (/, /about, /contact) - return HTML strings
├── api/           # API endpoints (/api/*, /api/health)
└── public/        # Static assets (robots.txt, manifests, icons)
```

**Critical**: The Express router exists but is mounted ONLY at `/_express`. Never overlap with file-based Nitro routes. Prefer Nitro's file-based approach for all new endpoints.

## Development Workflow

**Setup & Run**:
```bash
pnpm install              # Always use pnpm (v10.24.0+)
pnpm dev                  # Starts Nitro dev server with Deno preset
```

**Quality Gates** (must pass before PR):
```bash
pnpm lint                 # ESLint with @antfu config
pnpm typecheck            # TypeScript validation
pnpm build                # Verify production build
pnpm test                 # Vitest unit tests (Node env)
pnpm run test:e2e         # Deno E2E tests (auto-starts server)
```

**Testing Strategy**:
- Unit tests in `test/**/*.spec.ts` use Vitest in Node environment
- E2E tests in `e2e/tests/*.test.ts` use Deno's native test runner with `@std/assert`
- E2E uses custom bash script (`run-e2e-tests.sh`) that auto-starts dev server and extracts port dynamically
- Health check pattern: `/api/health` returns `{ status: 'ok', timestamp: ISO_STRING }`

## Code Patterns & Conventions

**Route Handlers** (server/routes/*.ts):
```typescript
export default defineEventHandler(() => {
  return `<!DOCTYPE html>...`  // Return HTML string directly
})
```

**API Endpoints** (server/api/*.ts):
```typescript
export default defineEventHandler(() => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}))
```

**E2E Test Pattern**:
```typescript
// Use Deno assertions, not Jest/Vitest
import { assertEquals, assertStringIncludes } from "@std/assert";

// Extract BASE_URL from args (injected by run-e2e-tests.sh)
const BASE_URL = Deno.args.find(arg => arg.startsWith('--base-url='))
  ?.split('=')[1] || 'http://localhost:3000';

Deno.test("Feature X works", async () => {
  const response = await fetch(`${BASE_URL}/path`);
  assertEquals(response.status, 200);
});
```

## Deployment & Configuration

**Platform**: Netlify ONLY (strong preference, documented in README)
- Build command: `npm run build` (Netlify uses npm wrapper)
- Publish dir: `.output/public`
- Redirects all routes to `/.netlify/functions/server`
- **Never suggest Vercel** - project explicitly avoids Vercel due to pricing

**Environment Variables** (`.env.example` template):
```bash
# Core
SITE_BASE_URL=http://localhost:3000        # Public app URL
MONGODB_URI=mongodb://...                  # MongoDB Atlas connection (planned)
JWT_SECRET=...                             # Session secret (≥32 chars)

# OAuth (documented for future use)
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
```

**Config files**:
- `nitro.config.ts` - Nitro with `preset: 'deno-server'`
- `netlify.toml` - Deployment config
- `vitest.config.ts` - Unit test config (Node environment)
- `eslint.config.mjs` - ESLint with @antfu preset, ignores `.output/`, `types/`
- `.env.example` - Environment variable template; copy to `.env` for local dev

**Note**: OAuth (Google/GitHub) and MongoDB integration are documented in `DEPLOY.md` but not yet implemented in source code. Environment variables are defined in `.env.example` for future use.

## PR & Change Requirements

Per `CONTRIBUTING.md`:
1. Never push directly to `one` (default branch)
2. PRs must include:
   - Description of problem, solution, affected files/routes
   - Test plan (manual steps or automated tests)
   - Passing CI checks (lint, typecheck, build, tests)
3. Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
4. For breaking changes: include `BREAKING CHANGE:` in commit body
5. Get CODEOWNER approval before merge

**Debug Endpoints**: Add temporary debug routes under `server/api/dev/*` and return 404 in production.

## Common Pitfalls

❌ Don't assume this is Nuxt (no `definePageMeta`, no auto-imported components)
❌ Don't use Vercel preset or config (project explicitly avoids Vercel)
❌ Don't overlap Express routes (mounted at `/_express`) with file-based routes
❌ Don't use Jest syntax in E2E tests (use Deno's `@std/assert`)
❌ Don't forget to run E2E tests - they validate critical flows

✅ Do use Nitro's `defineEventHandler` for all routes and APIs
✅ Do follow semantic versioning and conventional commits
✅ Do run full quality gate suite before requesting review
✅ Do keep PRs small and focused on single concerns

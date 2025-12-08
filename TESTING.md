# Testing Guide

This document describes how to run tests for the Peace2074.com project.

## Overview

The project has a comprehensive testing setup with:
- **Unit Tests** - Using Vitest for TypeScript/JavaScript tests
- **E2E Tests** - Using Deno for end-to-end browser testing
- **Linting** - Using ESLint with @antfu/eslint-config
- **Type Checking** - Using TypeScript compiler

## Prerequisites

- Node.js 18.x or 20.x
- pnpm 10.24.0 or later
- Deno (for E2E tests)

## Installation

```bash
# Install dependencies
pnpm install
```

## Running Tests

### Unit Tests

Unit tests are located in the `test/` directory and use Vitest.

```bash
# Run all unit tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch
```

### E2E Tests

E2E tests are located in the `e2e/` directory and use Deno.

```bash
# Run E2E tests with auto-started dev server
pnpm run test:e2e

# Run E2E tests against local dev server (must be running)
pnpm run test:e2e:local

# Run E2E tests against production
pnpm run test:e2e:prod
```

### Linting

```bash
# Run linter
pnpm run lint

# Run linter with auto-fix
pnpm run lint:fix
```

### Type Checking

```bash
# Run TypeScript type checker
pnpm run typecheck
```

## Continuous Integration

All tests run automatically on every push and pull request via GitHub Actions. The CI workflow includes:

1. **Lint** - Code style and quality checks
2. **Typecheck** - TypeScript type validation
3. **Build** - Verify the project builds successfully
4. **Test** - Run unit tests on Node 18.x and 20.x
5. **E2E** - Run end-to-end tests against the built application

See `.github/workflows/ci.yml` for the full CI configuration.

## Test Structure

### Unit Tests

```
test/
├── i18n.spec.ts              # Internationalization tests
├── i18n.runtime.spec.ts      # i18n runtime tests
├── pages/
│   └── miracles2.spec.ts     # Page-specific tests
└── plugins/
    └── colada.spec.ts        # Plugin tests
```

Unit tests use the Vitest testing framework with the following patterns:

```typescript
import { describe, it, expect } from 'vitest'

describe('Feature name', () => {
  it('should do something', () => {
    expect(result).toBe(expected)
  })
})
```

### E2E Tests

```
e2e/
└── tests/
    ├── basic.test.ts         # Basic functionality tests
    └── deployment.test.ts    # Deployment verification tests
```

E2E tests use Deno's built-in test runner:

```typescript
import { assertEquals } from "@std/assert"

Deno.test("Feature works", async () => {
  const response = await fetch(url)
  assertEquals(response.status, 200)
})
```

## Writing Tests

### Adding Unit Tests

1. Create a new `.spec.ts` file in the `test/` directory
2. Import testing utilities from `vitest`
3. Write your test cases using `describe` and `it` blocks
4. Run `pnpm run test` to verify

### Adding E2E Tests

1. Create a new `.test.ts` file in `e2e/tests/`
2. Import assertions from `@std/assert`
3. Write test cases using `Deno.test()`
4. Run `pnpm run test:e2e` to verify

## Debugging Tests

### Debugging Unit Tests

```bash
# Run a specific test file
pnpm exec vitest run test/i18n.spec.ts

# Run tests with verbose output
pnpm exec vitest run --reporter=verbose
```

### Debugging E2E Tests

```bash
# Run a specific E2E test file
deno test --allow-all e2e/tests/basic.test.ts -- --base-url=http://localhost:3000
```

## Best Practices

1. **Keep tests focused** - Each test should verify one specific behavior
2. **Use descriptive names** - Test names should clearly describe what is being tested
3. **Avoid test interdependencies** - Tests should be able to run in any order
4. **Mock external dependencies** - Use mocks/stubs for external APIs and services
5. **Keep tests fast** - Unit tests should run quickly; use E2E tests for integration scenarios

## Troubleshooting

### Tests failing locally but passing in CI

- Ensure you have the correct Node.js and pnpm versions
- Clear node_modules and reinstall: `rm -rf node_modules pnpm-lock.yaml && pnpm install`
- Check for environment-specific issues (paths, environment variables, etc.)

### E2E tests failing

- Ensure the dev server is running if using `test:e2e:local`
- Check the server logs in `/tmp` when using `test:e2e`
- Verify network connectivity for `test:e2e:prod`

### Linting errors

- Run `pnpm run lint:fix` to auto-fix many common issues
- Review the ESLint config in `eslint.config.mjs`
- Check the `.eslintignore` patterns if files are unexpectedly linted

## Contributing

When contributing code:

1. Write tests for new features
2. Ensure all tests pass: `pnpm run test && pnpm run test:e2e`
3. Run linting: `pnpm run lint`
4. Run type checking: `pnpm run typecheck`
5. Verify your changes don't break the build: `pnpm run build`

The CI system will automatically run all checks when you create a pull request.

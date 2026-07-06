/**
 * Post-build patch for Cloudflare Workers compatibility.
 *
 * Problem: The CF Workers ESM runtime does not expose a default export on
 * `node:stream`.  Rollup bundles `import * as T from "node:stream"` and then
 * evaluates `bc = getDefaultExportFromNamespaceIfNotNamed(T)`.  Because the
 * namespace has no `.default`, `bc` ends up being the namespace object itself,
 * which has no `.prototype`.  Three top-level variables (SC, FC, QC) are
 * aliased to `bc` and passed as the super-constructor to `util.inherits()`
 * (from the `jws` / `through` package), causing an immediate TypeError at
 * module-initialisation time.
 *
 * Fix: replace those three assignments with `T.Transform` (the actual
 * Transform class from node:stream, which has a proper `.prototype`).
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const workerPath = resolve(
    'apps/nitro-api/dist/_worker.js/chunks/nitro/nitro.mjs'
)

let src: string
try {
    src = readFileSync(workerPath, 'utf8')
} catch {
    console.log('[patch-cf-worker] Worker bundle not found – skipping patch.')
    process.exit(0)
}

// The jws package defines three Transform subclasses (DataStream, SignStream,
// VerifyStream) via `util.inherits(Ctor, Stream)`. Rollup rewrites the base to
// `getDefaultExportFromNamespaceIfNotNamed(node:stream)`, which on the CF Workers
// runtime resolves to the namespace object (no `.prototype`) and throws a
// TypeError at module-init. Fix: point each base at the real `Transform` class.
//
// Minifier names change on every build, so resolve them dynamically instead of
// hard-coding string literals (which silently no-op when the names drift).

// 1. Find the node:stream namespace import alias, e.g. `import*as M from"node:stream"`.
const streamNsMatch = src.match(/import\s*\*\s*as\s+([A-Za-z0-9_$]+)\s+from\s*["']node:stream["']/)
if (!streamNsMatch) {
    console.error('[patch-cf-worker] ✗ Could not locate the node:stream namespace import — jws would crash on Workers. Aborting.')
    process.exit(1)
}
const streamNs = streamNsMatch[1]

// 2. Rewrite `<inherits>(<DataStream|SignStream|VerifyStream>$N, <base>)` so the
//    base class is `<streamNs>.Transform`. Matches a function call whose first
//    arg is one of the jws constructors and whose second arg is a bare identifier.
const inheritsPattern =
    /([A-Za-z0-9_$]+\((?:DataStream|SignStream|VerifyStream)\$\d+,)[A-Za-z0-9_$.]+(\))/g

let appliedCount = 0
const patched = src.replace(inheritsPattern, (_match, prefix, suffix) => {
    appliedCount++
    return `${prefix}${streamNs}.Transform${suffix}`
})

if (appliedCount === 0) {
    console.error('[patch-cf-worker] ✗ No jws stream inherits() calls found — bundle layout changed. Review patch-cf-worker.ts before deploying.')
    process.exit(1)
}

writeFileSync(workerPath, patched, 'utf8')
console.log(`[patch-cf-worker] Done – rewrote ${appliedCount} jws stream base class(es) to ${streamNs}.Transform.`)

// Patch 2: Safe hasOwnProperty
// Problem: `getDefaultExportFromNamespaceIfNotNamed` may return a null-prototype
// namespace object. Calling `.hasOwnProperty()` on it throws:
//   TypeError: Cs.hasOwnProperty is not a function
// Fix: rewrite all `X.hasOwnProperty(Y)` → `Object.prototype.hasOwnProperty.call(X, Y)`
// throughout the bundle so it works on any object regardless of prototype chain.
let src2 = readFileSync(workerPath, 'utf8')
const hasOwnPropertyPattern = /([A-Za-z0-9_$]+)\.hasOwnProperty\(([^)]+)\)/g
let hasOwnCount = 0
const patched2 = src2.replace(hasOwnPropertyPattern, (_match, obj, key) => {
    hasOwnCount++
    return `Object.prototype.hasOwnProperty.call(${obj},${key})`
})
writeFileSync(workerPath, patched2, 'utf8')
console.log(`[patch-cf-worker] ✓ Rewrote ${hasOwnCount} hasOwnProperty call(s) to Object.prototype.hasOwnProperty.call().`)

// Fix _routes.json: only route /api/* through the Worker.
// Nitro generates include:["/*"] which causes it to intercept SPA requests
// and 302-redirect / → /api/ (the baseURL). Restricting to /api/* lets
// Cloudflare Pages serve static assets and the SPA index.html directly.
const routesPath = resolve('apps/nitro-api/dist/_routes.json')
writeFileSync(routesPath, JSON.stringify({ version: 1, include: ['/api/*'], exclude: [] }, null, 2) + '\n', 'utf8')
console.log('[patch-cf-worker] ✓ Fixed _routes.json → include: ["/api/*"]')

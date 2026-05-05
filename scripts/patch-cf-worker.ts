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

const patches: Array<[string, string]> = [
    // DataStream$2 base class (jws / safe-buffer interop)
    ['SC=bc;function DataStream$2', 'SC=T.Transform;function DataStream$2'],
    // SignStream$1 base class (jws)
    [',FC=bc,VC=tostring,zC=Ys', ',FC=T.Transform,VC=tostring,zC=Ys'],
    // VerifyStream$1 base class (jws)
    ['KC=bC,GC=jwa$2,QC=bc,YC=tostring', 'KC=bC,GC=jwa$2,QC=T.Transform,YC=tostring'],
]

let patched = src
let appliedCount = 0

for (const [from, to] of patches) {
    const count = patched.split(from).length - 1
    if (count === 1) {
        patched = patched.replace(from, to)
        appliedCount++
        console.log(`[patch-cf-worker] ✓ Applied: ${from.slice(0, 40)}...`)
    } else if (count === 0) {
        console.warn(`[patch-cf-worker] ⚠ Target not found (already patched?): ${from.slice(0, 40)}...`)
    } else {
        console.error(`[patch-cf-worker] ✗ Unexpected ${count} occurrences: ${from.slice(0, 40)}`)
        process.exit(1)
    }
}

writeFileSync(workerPath, patched, 'utf8')
console.log(`[patch-cf-worker] Done – applied ${appliedCount}/${patches.length} patches.`)

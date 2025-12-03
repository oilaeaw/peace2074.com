#!/usr/bin/env node
// Dev runner: load dev-only runtime patches then run `nuxi dev`.
// Using a small CJS runner avoids NODE_OPTIONS and keeps the patch explicit.
try {
  // prefer project-local patch
  require('../../../node-crypto-patch.cjs')
}
catch (e) {
  // best-effort, continue without patch if it fails
  try { console.warn('dev patch load failed:', e && e.message) }
  catch {}
}

const { spawn } = require('node:child_process')
const proc = require('node:process')

const args = proc.argv.slice(2)
const cmd = 'npx'
const cmdArgs = ['nuxi', 'dev', ...args]

const path = require('node:path')

// Prefer a local patch next to this script; fall back to the project root patch if
// the local copy doesn't exist. This keeps the original intent but avoids
// crashing when the local file isn't present.
const localPatch = path.resolve(__dirname, '..', 'node-crypto-patch.cjs')
const rootPatch = path.resolve(__dirname, '..', '..', '..', 'node-crypto-patch.cjs')
const fallbackPatch = path.resolve(__dirname, '..', '..', '..', '..', 'node-crypto-patch.cjs')
let patchPath = localPatch
try {
  const fs = require('node:fs')
  if (!fs.existsSync(patchPath)) {
    if (fs.existsSync(rootPatch)) patchPath = rootPatch
    else if (fs.existsSync(fallbackPatch)) patchPath = fallbackPatch
    else patchPath = null
  }
} catch (e) {
  // best-effort - if fs isn't available for some reason, continue without patch
  patchPath = null
}

// Ensure child process preloads the dev patch (works like NODE_OPTIONS=--require=...)
const childEnv = Object.assign({}, proc.env)
const existing = (childEnv.NODE_OPTIONS || '').trim()
if (patchPath) {
  childEnv.NODE_OPTIONS = (`--require=${patchPath} ${existing}`).trim()
} else {
  // no patch available; leave NODE_OPTIONS as-is
  childEnv.NODE_OPTIONS = existing
}

// WebSockets removed: do not start standalone socket server
let wsChild = null

// Nuxt dev server
const child = spawn(cmd, cmdArgs, {
  stdio: 'inherit',
  env: Object.assign(childEnv, {}),
})

child.on('exit', code => proc.exit(code))
child.on('error', (err) => {
  console.error('Failed to start dev server:', err)
  proc.exit(1)
})

// Ensure both are cleaned up on exit
process.on('exit', () => { try { wsChild && wsChild.kill() } catch {} })

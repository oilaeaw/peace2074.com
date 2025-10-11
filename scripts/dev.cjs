#!/usr/bin/env node
// Dev runner: load dev-only runtime patches then run `nuxi dev`.
// Using a small CJS runner avoids NODE_OPTIONS and keeps the patch explicit.
try {
  // prefer project-local patch
  require('../node-crypto-patch.cjs')
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

const patchPath = path.resolve(__dirname, '..', 'node-crypto-patch.cjs')
// Ensure child process preloads the dev patch (works like NODE_OPTIONS=--require=...)
const childEnv = Object.assign({}, proc.env)
const existing = (childEnv.NODE_OPTIONS || '').trim()
childEnv.NODE_OPTIONS = (`--require=${patchPath} ${existing}`).trim()

const child = spawn(cmd, cmdArgs, {
  stdio: 'inherit',
  env: childEnv,
})

child.on('exit', code => proc.exit(code))
child.on('error', (err) => {
  console.error('Failed to start dev server:', err)
  proc.exit(1)
})

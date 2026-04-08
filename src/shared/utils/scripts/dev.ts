#!/usr/bin/env node
// Dev runner: load dev-only runtime patches then run `nuxi dev`.
// Using a small TS runner keeps the patch explicit without relying on NODE_OPTIONS externally.

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const currentDir = path.dirname(fileURLToPath(import.meta.url))

function resolvePatchPath(): string | null {
  const candidates = [
    path.resolve(currentDir, '..', 'node-crypto-patch.cjs'),
    path.resolve(currentDir, '..', '..', '..', 'node-crypto-patch.cjs'),
    path.resolve(currentDir, '..', '..', '..', '..', 'node-crypto-patch.cjs'),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  return null
}

const patchPath = resolvePatchPath()

if (patchPath) {
  try {
    require(patchPath)
  } catch (error) {
    try {
      const message = error instanceof Error ? error.message : String(error)
      console.warn('dev patch load failed:', message)
    } catch {
      // best-effort logging only
    }
  }
}

const args = process.argv.slice(2)
const cmd = 'npx'
const cmdArgs = ['nuxi', 'dev', ...args]

// Ensure child process preloads the dev patch (same effect as NODE_OPTIONS=--require=...)
const childEnv: NodeJS.ProcessEnv = { ...process.env }
const existingNodeOptions = (childEnv.NODE_OPTIONS || '').trim()

if (patchPath) {
  childEnv.NODE_OPTIONS = `--require=${patchPath} ${existingNodeOptions}`.trim()
} else {
  childEnv.NODE_OPTIONS = existingNodeOptions
}

const child = spawn(cmd, cmdArgs, {
  stdio: 'inherit',
  env: childEnv,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})

child.on('error', (error) => {
  console.error('Failed to start dev server:', error)
  process.exit(1)
})
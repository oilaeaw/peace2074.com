#!/usr/bin/env node
/**
 * sync-mobile-branding.mjs
 * Copies branding assets from public/ios and public/android
 * into the native Capacitor project directories.
 */

import { copyFile, access } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const execFileAsync = promisify(execFile)

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function copy(src, dest) {
  if (!(await exists(src))) {
    console.warn(`  SKIP  ${src} (not found)`)
    return
  }
  await copyFile(src, dest)
  console.log(`  OK    ${src.replace(root, '')} → ${dest.replace(root, '')}`)
}

async function sanitizeIosIcon(src, dest) {
  if (!(await exists(src))) {
    console.warn(`  SKIP  ${src} (not found)`)
    return
  }

  const scriptPath = resolve(root, 'scripts/sanitize-ios-icon.swift')

  try {
    await execFileAsync('xcrun', ['swift', scriptPath, src, dest])
    console.log(
      `  OK    ${src.replace(root, '')} → ${dest.replace(root, '')} (opaque)`
    )
  } catch (error) {
    const details = error?.stderr || error?.message || String(error)
    throw new Error(`Unable to sanitize iOS app icon: ${details}`)
  }
}

// ---------------------------------------------------------------------------
// iOS — single 1024×1024 universal icon
// ---------------------------------------------------------------------------
async function syncIos() {
  console.log('\n[iOS] Syncing app icon...')
  await sanitizeIosIcon(
    resolve(root, 'public/ios/1024.png'),
    resolve(
      root,
      'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'
    )
  )
}

// ---------------------------------------------------------------------------
// Android — mipmap density buckets
// ---------------------------------------------------------------------------
const ANDROID_ICONS = [
  {
    src: 'android-launchericon-48-48.png',
    dest: 'mipmap-mdpi/ic_launcher.png',
  },
  {
    src: 'android-launchericon-72-72.png',
    dest: 'mipmap-hdpi/ic_launcher.png',
  },
  {
    src: 'android-launchericon-96-96.png',
    dest: 'mipmap-xhdpi/ic_launcher.png',
  },
  {
    src: 'android-launchericon-144-144.png',
    dest: 'mipmap-xxhdpi/ic_launcher.png',
  },
  {
    src: 'android-launchericon-192-192.png',
    dest: 'mipmap-xxxhdpi/ic_launcher.png',
  },
]

async function syncAndroid() {
  console.log('\n[Android] Syncing launcher icons...')
  const srcDir = resolve(root, 'public/android')
  const destDir = resolve(root, 'android/app/src/main/res')
  await Promise.all(
    ANDROID_ICONS.map(({ src, dest }) =>
      copy(resolve(srcDir, src), resolve(destDir, dest))
    )
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
try {
  await syncIos()
  await syncAndroid()
  console.log('\nBranding sync complete.\n')
} catch (err) {
  console.error('\nBranding sync failed:', err.message)
  process.exit(1)
}

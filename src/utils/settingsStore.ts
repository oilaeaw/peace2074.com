/**
 * settingsStore.ts
 * ─────────────────────────────────────────────────────────────────
 * Encrypted key-value store for ALL user preferences.
 *
 * Strategy
 * --------
 * - Uses `_encrypt` / `_decrypt` from `waelio-utils` (already in the project).
 * - The salt is derived from a stable device fingerprint stored once in
 *   sessionStorage so it survives across tab reloads but resets on a new
 *   session (additional privacy layer).  A VITE_CONF_ENCRYPTION_KEY env-var
 *   takes priority over the fingerprint so CI / server-side rendering works
 *   deterministically.
 * - All values are JSON-serialised before encryption so booleans, numbers and
 *   objects round-trip correctly.
 * - A `__enc__` prefix guards encrypted blobs; plain (legacy) values are
 *   returned as-is so old data is not silently lost.
 *
 * Usage
 * -----
 *   import { settings } from '@/utils/settingsStore'
 *
 *   settings.set('pref-dark-mode', true)
 *   const dark = settings.get<boolean>('pref-dark-mode', false)
 *   settings.remove('pref-dark-mode')
 */

import { _encrypt, _decrypt } from 'waelio-utils'

// ─── Constants ────────────────────────────────────────────────────

const NS         = 'p2074-settings'   // localStorage namespace prefix
const ENC_PREFIX = '__enc__'
const FP_KEY     = 'p2074-device-fp'  // key where fingerprint is cached

// ─── Salt resolution ──────────────────────────────────────────────

function resolveEnvKey(): string | undefined {
  try {
    // Vite exposes env vars at build time
    const env = (import.meta as any).env
    return env?.VITE_CONF_ENCRYPTION_KEY || undefined
  } catch {
    return undefined
  }
}

/**
 * Returns a stable per-device salt.
 * Priority: env key > sessionStorage fingerprint > random fingerprint.
 */
function resolveSalt(): string {
  const envKey = resolveEnvKey()
  if (envKey) return envKey

  if (typeof window === 'undefined') return 'ssr-fallback-salt'

  // Try cached fingerprint
  try {
    const cached = sessionStorage.getItem(FP_KEY)
    if (cached) return cached
  } catch { /* private-mode browsers may block sessionStorage */ }

  // Generate a new random fingerprint and persist it
  const fp = `fp-${Date.now()}-${Math.random().toString(36).slice(2)}`
  try { sessionStorage.setItem(FP_KEY, fp) } catch { /* ignore */ }
  return fp
}

// ─── Storage helpers ──────────────────────────────────────────────

function storageKey(key: string): string {
  return `${NS}:${key}`
}

function rawGet(key: string): string | null {
  try {
    return localStorage.getItem(storageKey(key))
  } catch {
    return null
  }
}

function rawSet(key: string, value: string): void {
  try {
    localStorage.setItem(storageKey(key), value)
  } catch { /* quota / private mode */ }
}

function rawRemove(key: string): void {
  try {
    localStorage.removeItem(storageKey(key))
  } catch { /* ignore */ }
}

// ─── Encrypt / Decrypt ────────────────────────────────────────────

function encrypt(value: unknown, salt: string): string {
  const json = JSON.stringify(value)
  try {
    const cipher = _encrypt(json, salt)
    return `${ENC_PREFIX}${cipher}`
  } catch {
    // Encryption failed — store plaintext JSON as a last resort
    return json
  }
}

function decrypt<T>(raw: string, salt: string, fallback: T): T {
  if (!raw.startsWith(ENC_PREFIX)) {
    // Legacy plaintext — try JSON parse
    try { return JSON.parse(raw) as T } catch { return fallback }
  }
  try {
    const json = _decrypt(raw.slice(ENC_PREFIX.length), salt) as string
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

// ─── Public API ───────────────────────────────────────────────────

class SettingsStore {
  private _salt: string

  constructor() {
    this._salt = resolveSalt()
  }

  /** Re-derive salt (call after login / logout if env key changed). */
  refreshSalt(): void {
    this._salt = resolveSalt()
  }

  set<T = unknown>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    const blob = encrypt(value, this._salt)
    rawSet(key, blob)
  }

  get<T = unknown>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback
    const raw = rawGet(key)
    if (raw === null) return fallback
    return decrypt<T>(raw, this._salt, fallback)
  }

  has(key: string): boolean {
    if (typeof window === 'undefined') return false
    return rawGet(key) !== null
  }

  remove(key: string): void {
    rawRemove(key)
  }

  /**
   * Migrate a plain (unencrypted) localStorage key into the encrypted store,
   * then remove the old key.  Safe to call even if the old key doesn't exist.
   */
  migrate(plainKey: string): void {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem(plainKey)
    if (raw === null) return
    // Try to parse existing value
    let value: unknown = raw
    try { value = JSON.parse(raw) } catch { /* keep string */ }
    this.set(plainKey, value)
    try { localStorage.removeItem(plainKey) } catch { /* ignore */ }
  }

  /**
   * Bulk-migrate an array of plain keys.
   * Call once on app mount after the store is initialised.
   */
  migrateAll(plainKeys: string[]): void {
    plainKeys.forEach((k) => this.migrate(k))
  }
}

export const settings = new SettingsStore()
export default settings

import { createStorage } from 'unstorage'
import localStorageDriver from 'unstorage/drivers/localstorage'
import { _encrypt, _decrypt } from 'waelio-utils'

type CoreRecord = Record<string, unknown>
type CoreImportMeta = ImportMeta & {
  env?: {
    VITE_CONF_ENCRYPTION_KEY?: string
  }
}
type GlobalWithConfKey = typeof globalThis & {
  __CONF_ENCRYPTION_KEY__?: string
}

const ENC_PREFIX = '__enc__'

function isCoreRecord(value: unknown): value is CoreRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

class Core {
  private storage = createStorage({
    // In the browser, persist to localStorage; on server, default memory.
    driver:
      typeof window !== 'undefined'
        ? localStorageDriver({ base: 'peace2074' })
        : undefined,
  })
  private encryptionKey?: string
  private warnedMissingKey = false

  constructor() {
    this.encryptionKey = this.resolveEncryptionKey()
  }

  private resolveEncryptionKey(): string | undefined {
    let key: string | undefined
    const env = (import.meta as CoreImportMeta).env
    // Prefer Vite-exposed key in the browser
    if (typeof import.meta !== 'undefined' && env?.VITE_CONF_ENCRYPTION_KEY) {
      key = env.VITE_CONF_ENCRYPTION_KEY
    }
    // Fallback to server/env key
    if (
      !key &&
      typeof process !== 'undefined' &&
      typeof process.env !== 'undefined'
    ) {
      key = process.env.CONF_ENCRYPTION_KEY
    }
    // Allow manual injection for tests or custom bootstraps
    const globalConfig = globalThis as GlobalWithConfKey
    if (
      !key &&
      typeof globalThis !== 'undefined' &&
      globalConfig.__CONF_ENCRYPTION_KEY__
    ) {
      key = globalConfig.__CONF_ENCRYPTION_KEY__
    }
    return key || undefined
  }

  private encryptValue(value: unknown) {
    if (!this.encryptionKey) {
      // Only warn in development, not in production (guest IDs don't need encryption)
      if (!this.warnedMissingKey && import.meta.env?.DEV) {
        this.warnedMissingKey = true
        console.warn('[core] CONF_ENCRYPTION_KEY missing; storing plaintext.')
      }
      return value
    }

    try {
      const cipher = _encrypt(value, this.encryptionKey)
      return `${ENC_PREFIX}${cipher}`
    } catch (e) {
      console.warn('[core] Failed to encrypt; storing plaintext.', e)
      return value
    }
  }

  private decryptValue(raw: unknown) {
    const hasPrefix = typeof raw === 'string' && raw.startsWith(ENC_PREFIX)
    if (!hasPrefix) return raw

    if (!this.encryptionKey) {
      // Only warn in development
      if (!this.warnedMissingKey && import.meta.env?.DEV) {
        this.warnedMissingKey = true
        console.warn(
          '[core] Encrypted value found but CONF_ENCRYPTION_KEY is missing; returning null.'
        )
      }
      return null
    }

    try {
      return _decrypt(raw.slice(ENC_PREFIX.length), this.encryptionKey)
    } catch (e) {
      console.warn('[core] Failed to decrypt; returning null.', e)
      return null
    }
  }

  private async readItem(key: string) {
    const raw = await this.storage.getItem(key)
    return this.decryptValue(raw)
  }

  private async writeItem(key: string, value: unknown) {
    const payload = this.encryptValue(value)
    await this.storage.setItem(key, payload)
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const v = await this.readItem(key)
    return v === undefined ? null : (v as T)
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    await this.writeItem(key, value)
  }

  async remove(key: string): Promise<void> {
    await this.storage.removeItem(key)
  }

  async has(key: string): Promise<boolean> {
    const v = await this.readItem(key)
    return v !== undefined && v !== null
  }

  // nested helpers: use colon (:) to address nested properties inside a root object
  async getNested<T = unknown>(nestedKey: string): Promise<T | undefined> {
    if (!nestedKey.includes(':')) {
      return this.get<T>(nestedKey) as Promise<T | undefined>
    }

    const [root, ...rest] = nestedKey.split(':')
    const rootVal = await this.readItem(root)
    if (rootVal == null) return undefined

    let cur: unknown
    if (typeof rootVal === 'string') {
      try {
        cur = JSON.parse(rootVal) as unknown
      } catch {
        cur = undefined
      }
    } else if (isCoreRecord(rootVal)) {
      cur = rootVal
    } else {
      return undefined
    }

    for (const part of rest) {
      if (!isCoreRecord(cur) || !(part in cur)) return undefined
      cur = cur[part]
    }

    return cur as T
  }

  async setNested<T = unknown>(nestedKey: string, value: T): Promise<void> {
    if (!nestedKey.includes(':')) return this.set(nestedKey, value)

    const [root, ...rest] = nestedKey.split(':')
    const rawRoot = await this.readItem(root)
    let rootVal: CoreRecord = {}
    if (rawRoot == null) rootVal = {}
    else if (typeof rawRoot === 'string') {
      try {
        const parsed = JSON.parse(rawRoot) as unknown
        rootVal = isCoreRecord(parsed) ? parsed : {}
      } catch {
        rootVal = {}
      }
    } else if (isCoreRecord(rawRoot)) {
      rootVal = rawRoot
    }

    let cur: CoreRecord = rootVal
    for (let i = 0; i < rest.length - 1; i++) {
      const p = rest[i]
      if (!p) continue
      if (!isCoreRecord(cur[p])) cur[p] = {}
      cur = cur[p] as CoreRecord
    }
    const last = rest[rest.length - 1]
    if (last) cur[last] = value
    await this.writeItem(root, rootVal)
  }
}

const core = new Core()

export { core, Core }
export default core

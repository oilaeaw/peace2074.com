
import { createStorage } from 'unstorage'
import localStorageDriver from 'unstorage/drivers/localstorage'
import { _encrypt, _decrypt } from 'waelio-utils'

type AnyObject = Record<string, any>

const ENC_PREFIX = '__enc__'

class Core {
  private storage = createStorage({
    // In the browser, persist to localStorage; on server, default memory.
    driver: (typeof window !== 'undefined')
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
    // Prefer Vite-exposed key in the browser
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_CONF_ENCRYPTION_KEY) {
      key = (import.meta as any).env.VITE_CONF_ENCRYPTION_KEY as string
    }
    // Fallback to server/env key
    if (!key && typeof process !== 'undefined' && typeof process.env !== 'undefined') {
      key = process.env.CONF_ENCRYPTION_KEY
    }
    // Allow manual injection for tests or custom bootstraps
    if (!key && typeof globalThis !== 'undefined' && (globalThis as any).__CONF_ENCRYPTION_KEY__) {
      key = (globalThis as any).__CONF_ENCRYPTION_KEY__ as string
    }
    return key || undefined
  }

  private encryptValue(value: any) {
    if (!this.encryptionKey) {
      if (!this.warnedMissingKey) {
        this.warnedMissingKey = true
        console.warn('[core] CONF_ENCRYPTION_KEY missing; storing plaintext.')
      }
      return value
    }

    try {
      const cipher = _encrypt(value as any, this.encryptionKey)
      return `${ENC_PREFIX}${cipher}`
    }
    catch (e) {
      console.warn('[core] Failed to encrypt; storing plaintext.', e)
      return value
    }
  }

  private decryptValue(raw: any) {
    const hasPrefix = typeof raw === 'string' && raw.startsWith(ENC_PREFIX)
    if (!hasPrefix) return raw

    if (!this.encryptionKey) {
      if (!this.warnedMissingKey) {
        this.warnedMissingKey = true
        console.warn('[core] Encrypted value found but CONF_ENCRYPTION_KEY is missing; returning null.')
      }
      return null
    }

    try {
      return _decrypt(raw.slice(ENC_PREFIX.length), this.encryptionKey)
    }
    catch (e) {
      console.warn('[core] Failed to decrypt; returning null.', e)
      return null
    }
  }

  private async readItem(key: string) {
    const raw = await (this.storage as any).getItem(key)
    return this.decryptValue(raw)
  }

  private async writeItem(key: string, value: any) {
    const payload = this.encryptValue(value)
    await (this.storage as any).setItem(key, payload)
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const v = await this.readItem(key)
    return v === undefined ? null : (v as T)
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    await this.writeItem(key, value)
  }

  async remove(key: string): Promise<void> {
    await (this.storage as any).removeItem(key)
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

    let cur: AnyObject | undefined
    if (typeof rootVal === 'string') {
      try { cur = JSON.parse(rootVal) } catch { cur = undefined }
    }
    else if (typeof rootVal === 'object') {
      cur = rootVal as AnyObject
    }
    else {
      return undefined
    }

    for (const part of rest) {
      if (!cur || typeof cur !== 'object' || !(part in cur)) return undefined
      cur = cur[part] as AnyObject
    }

    return cur as unknown as T
  }

  async setNested<T = unknown>(nestedKey: string, value: T): Promise<void> {
    if (!nestedKey.includes(':')) return this.set(nestedKey, value)

    const [root, ...rest] = nestedKey.split(':')
    const rawRoot = await this.readItem(root)
    let rootVal: AnyObject = {}
    if (rawRoot == null) rootVal = {}
    else if (typeof rawRoot === 'string') {
      try { rootVal = JSON.parse(rawRoot) as AnyObject } catch { rootVal = {} }
    }
    else if (typeof rawRoot === 'object') rootVal = rawRoot as AnyObject

    let cur: AnyObject = rootVal
    for (let i = 0; i < rest.length - 1; i++) {
      const p = rest[i]
      if (!p) continue
      if (!(p in cur) || typeof cur[p] !== 'object') cur[p] = {}
      cur = cur[p] as AnyObject
    }
    const last = rest[rest.length - 1]
    if (last) cur[last] = value as any
    await this.writeItem(root, rootVal)
  }
}

const core = new Core()

export { core, Core }
export default core


import { createStorage } from 'unstorage'
import localStorageDriver from 'unstorage/drivers/localstorage'

type AnyObject = Record<string, any>

class Core {
  private storage = createStorage({
    // In the browser, persist to localStorage; on server, default memory.
    driver: (typeof window !== 'undefined')
      ? localStorageDriver({ base: 'peace2074' })
      : undefined,
  })

  async get<T = unknown>(key: string): Promise<T | null> {
    const v = await (this.storage as any).getItem(key)
    return v === undefined ? null : (v as T)
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    await (this.storage as any).setItem(key, value)
  }

  async remove(key: string): Promise<void> {
    await (this.storage as any).removeItem(key)
  }

  async has(key: string): Promise<boolean> {
    const v = await (this.storage as any).getItem(key)
    return v !== undefined && v !== null
  }

  // nested helpers: use colon (:) to address nested properties inside a root object
  async getNested<T = unknown>(nestedKey: string): Promise<T | undefined> {
    if (!nestedKey.includes(':')) {
      return this.get<T>(nestedKey) as Promise<T | undefined>
    }

    const [root, ...rest] = nestedKey.split(':')
    const rootVal = await (this.storage as any).getItem(root)
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
    const rawRoot = await (this.storage as any).getItem(root)
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
    await (this.storage as any).setItem(root, rootVal)
  }
}

const core = new Core()

export { core, Core }
export default core

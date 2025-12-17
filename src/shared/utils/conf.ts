import client from '../../app/config/client'
import dev from '../../app/config/dev'
import prod from '../../app/config/prod'
import server from '../../server/config/server'

type CT = typeof client
type DT = typeof dev
type PT = typeof prod
type ST = typeof server
// Minimal store factory inspired by nbubna/store. Returns an object with
// get/set/subscribe/update/setAll/getSnapshot/asObservable. This is
// dependency-free and SSR-safe.
function createLocalStore(initial: Record<string, any>) {
  let state: Record<string, any> = initial || {}
  const listeners = new Set<(s: Record<string, any>) => void>()

  const notify = () => {
    const snap = state
    for (const l of Array.from(listeners)) {
      try { l(snap) } catch (e) { /* swallow */ }
    }
  }

  const walker = (o: any) => {
    if (!o || typeof o !== 'object') return o
    for (const k of Object.keys(o)) {
      o[k] = walker(o[k])
    }
    return new Proxy(o, {
      set(target, prop, value) {
        // @ts-ignore
        target[prop] = value
        notify()
        return true
      },
      deleteProperty(target, prop) {
        // @ts-ignore
        const ok = delete target[prop]
        notify()
        return ok
      }
    })
  }

  // expose a proxied view for convenient property access
  let proxied = walker(JSON.parse(JSON.stringify(state)))

  return {
    getSnapshot() { return proxied },
    get(key: string) {
      if (!key) return proxied
      if (key.includes(':')) {
        const keys = key.split(':')
        let cur: any = proxied
        for (const k of keys) {
          if (!cur) return undefined
          cur = cur[k]
        }
        return cur
      }
      return proxied?.[key]
    },
    set(key: string, value: any) {
      if (key.includes(':')) {
        const keys = key.split(':')
        let cur: any = state
        for (let i = 0; i < keys.length; i++) {
          const k = String(keys[i])
          if (i === keys.length - 1) {
            cur[k] = value
          } else {
            if (cur[k] === undefined) cur[k] = {}
            cur = cur[k]
          }
        }
      } else {
        state[key] = value
      }
      // recreate proxied snapshot
      proxied = walker(JSON.parse(JSON.stringify(state)))
      notify()
    },
    update(updater: any, maybeFn?: any) {
      if (typeof updater === 'function') {
        try {
          const copy = JSON.parse(JSON.stringify(state))
          const next = updater(copy) || copy
          state = next
          proxied = walker(JSON.parse(JSON.stringify(state)))
          notify()
        } catch (e) {
          /* swallow */
        }
        return
      }
      const key = String(updater)
      if (typeof maybeFn !== 'function') return
      const old = this.get(key)
      const result = maybeFn(old)
      this.set(key, result)
    },
    setAll(obj: Record<string, any>) {
      state = obj || {}
      proxied = walker(JSON.parse(JSON.stringify(state)))
      notify()
    },
    subscribe(fn: (s: any) => void) {
      listeners.add(fn)
      try { fn(proxied) } catch (e) { /* swallow */ }
      return () => listeners.delete(fn)
    },
    asObservable() {
      const self = this
      return {
        subscribe(fn: (s: any) => void) { return self.subscribe(fn) },
        get value() { return proxied }
      }
    }
  }
}
class Conf {
  // explicit typed internal fields
  // `_raw` keeps the underlying plain JS object. `_store` is the reactive view
  // (either a Proxy fallback or a Solid store state when available).
  private _raw: Record<string, any> = {}
  private _store: any = {}
  private _storeInstance: any = undefined
  private _setStore: any = undefined
  private _server?: ST
  private _client?: CT
  private _dev?: DT
  private _prod?: PT
  private _env?: 'client' | 'server'
  // internal reactor: listeners and current snapshot
  private _reactorListeners: Set<(v: Record<string, any>) => void> = new Set()
  private _reactorValue: Record<string, any> = {}

  constructor() {
    // initialize environment and values
    this.setEnvironment()
    this._server = this.getServerVars() as ST
    this._client = this.getClientVars() as CT
    this._dev = this.getUrgentOverrides() as DT
    this._prod = this.getUrgentOverrides() as PT

    const initial = Object.assign(
      { ...(this._client || {}) },
      { ...(this._server || {}) },
      { ...(this._dev || {}) },
      { client: this._client },
      { server: this._server || {} },
      { dev: this._dev },
    )

    // keep a raw object for server and for solid createStore bridging
    this._raw = initial
  // create an internal local store (proxied fallback) that notifies
  // subscribers on mutation and provides a small store API.
  this._storeInstance = createLocalStore(this._raw)
  this._store = this._storeInstance.getSnapshot()

  // seed reactor value
  this._reactorValue = this._store

    // If running in client, attempt to dynamically load solid-js/store and
    // replace the reactive store with a real Solid store when available.
    if (typeof import.meta !== 'undefined' && (import.meta as any).client) {
      // dynamic import - don't await in constructor; swap when ready
  // Use a non-static import string so Vite won't try to resolve the package at
  // build-time. This keeps the runtime dynamic import (and your runtime
  // fallback) while avoiding the dev-time warning when `solid-js` isn't
  // installed.
  const _modName = 'solid-js/store'
  import(_modName)
    .then((mod) => {
          try {
            const createStore = (mod as any).createStore
            if (typeof createStore === 'function') {
              const [s, set] = createStore(this._raw)
              this._store = s
              this._setStore = set
              // when solid store arrives, prefer it for external `get`/`set`
              this._reactorValue = this._store
              this.notify()
            }
          }
          catch (e) {
            // swallow - keep proxy fallback
             
            console.warn('solid-js store import failed, using fallback proxy store.')
          }
        })
        .catch(() => {
          // solid not installed - silent fallback
        })
    }
  }

  set(key: string, value: string | number | object) {
    // prefer using Solid's set when available for proper reactivity
    const isNested = Boolean(key.match(/:/))
    const path = isNested ? key.split(':') : [key]

    if (this._setStore) {
      try {
        // Solid's set API accepts (path, value) where path can be array
        this._setStore(path, value)
        this.notify()
        return
      }
      catch (e) {
        // fallback to proxy assignment below
      }
    }

    // Use internal fallback store instance when available (proxied local store)
    if (this._storeInstance) {
      try {
        this._storeInstance.set(key, value)
        this._store = this._storeInstance.getSnapshot()
        this.notify()
        return
      } catch (e) {
        // continue to raw fallback
      }
    }

    // Fallback: operate on raw object which the Proxy watches
    if (isNested) {
      let storeKey: Record<string, any> = this._raw
      path.forEach((rawK: string, i: number) => {
        const k = String(rawK)
        if (storeKey[k] === undefined) {
          if (path.length === i + 1) {
            storeKey[k] = value
            return
          }
          storeKey[k] = {}
        }

        if (path.length === i + 1) {
          storeKey[k] = value
        }

        const next = storeKey[k]
        if (typeof next === 'object' && next !== null) {
          storeKey = next as Record<string, any>
        } else {
          storeKey[k] = {}
          storeKey = storeKey[k]
        }
      })
    }
    else {
      this._raw[key] = value
    }

    // notify subscribers after mutation
    this.notify()
  }

  // Update the store by applying a mutator function to the current snapshot.
  // Usage:
  //  conf.update(s => { s.foo = 'bar' })        -> replaces store with mutated snapshot
  //  conf.update('nested:count', v => v + 1)    -> updates nested key with returned value
  update<T extends string | number | object = any>(updater: ((s: Record<string, any>) => Record<string, any>) | string, maybeFn?: (v: T) => T) {
    // Functional update over the whole store
    if (typeof updater === 'function') {
      try {
        const current = this.getSnapshot()
        const copy = JSON.parse(JSON.stringify(current))
        const next = (updater as (s: Record<string, any>) => Record<string, any>)(copy) || copy
        // replace raw + rewrap proxy/solid
        this._raw = next
        this._store = this.createProxy(this._raw)
        // If Solid setter available re-create Solid store state
        if (this._setStore) {
          try {
            const set = this._setStore
            set(Object.keys(next), next)
          } catch (e) {
            // ignore; keep proxy
          }
        }
        this.notify()
      } catch (e) {
        // swallow errors from user updater
      }
      return
    }

    // Keyed update: update a nested key with maybeFn
    const key = String(updater)
    if (typeof maybeFn !== 'function') return
    const old = this.get(key)
    const result = maybeFn(old)
  this.set(key, result as unknown as string | number | object)
  }

  // Replace the whole store with a plain object
  setAll(obj: Record<string, any>) {
    this._raw = obj || {}
    this._store = this.createProxy(this._raw)
    if (this._setStore) {
      try {
        // best-effort: attempt to write the whole object via Solid set
        this._setStore(Object.keys(this._raw), this._raw)
      } catch (e) { /* ignore */ }
    }
    this.notify()
  }

  getAll(): Record<string, any> {
    return this._store
  }

  getItem(key: string): any {
    // reading should work whether store is a proxy, solid store, or plain
    try {
      return this._store?.[key]
    }
    catch (e) {
      return this._raw?.[key]
    }
  }

  get(key: string): any {
    // Is the key a nested object
    if (key.match(/:/)) {
      // Transform getter string into object
      return this.buildNestedKey(key)
    }

    // Return regular key
    return this._store?.[key]
  }

  client(): CT | undefined {
    return this.getItem('client')
  }

  dev(): DT | undefined {
    return this.getItem('dev')
  }

  server(): ST | undefined {
    return this.getItem('server')
  }

  store(): Record<string, any> {
    return this._store
  }

  // Return the current reactive snapshot (store or raw)
  getSnapshot(): Record<string, any> {
    return this._reactorValue
  }

  // Lightweight observable interface: returns a subscribe function
  // so callers can do: const unsub = conf.asObservable().subscribe(fn)
  // This replicates a very small BehaviorSubject-like object without deps.
  asObservable() {
    const self = this
    return {
      subscribe(fn: (v: Record<string, any>) => void) {
        return self.subscribe(fn)
      },
      // convenience: immediate value
      get value() {
        return self.getSnapshot()
      }
    }
  }

  has(key: any): boolean {
    return Boolean(this.get(key))
  }

  setEnvironment() {
    if (typeof import.meta !== 'undefined' && (import.meta as any).client) {
      this._env = 'client'
    }
    else {
      this._env = 'server'
    }
  }

  getServerVars(): ST | {} {
    let serverVars: ST | {} = {}

    if (typeof import.meta !== 'undefined' && (import.meta as any).server) {
      try {
        serverVars = server
      }
       
      catch (err: any) {
         
        if (process.env.NODE_ENV === 'development') {
          console.warn('Didn\'t find a server config in `./config`.')
        }
      }
    }

    return serverVars
  }

  getClientVars(): CT | {} {
    let clientVars: CT | {} = {}

    try {
      clientVars = client as CT
    }
     
    catch (e) {
      clientVars = {}
      if (typeof import.meta !== 'undefined' && (import.meta as any).dev) {
        console.warn('Didn\'t find a client config in `./config`.')
      }
    }

    return clientVars
  }

  getUrgentOverrides(): DT | {} {
    let overrides: DT | {} = {}
    const filename = (typeof import.meta !== 'undefined' && (import.meta as any).dev) ? 'dev' : 'prod'
    try {
      overrides = (typeof import.meta !== 'undefined' && (import.meta as any).dev) ? dev as DT : prod as PT
      if (filename === 'dev') {
        console.warn(
          `FYI: data in \`./config/${filename}.js\` file will override Server & Client equal data/values.`,
        )
      }
    }
     
    catch (e) {
      overrides = {}
    }

    return overrides
  }

  // Builds out a nested key to get nested values
  buildNestedKey(nestedKey: string): any {
    // Transform getter string into object
    const keys = nestedKey.split(':')
    let storeKey: any = this._store ?? this._raw

    for (const rawK of keys) {
      const k = String(rawK)
      if (storeKey === undefined || storeKey === null) return undefined
      try {
        storeKey = storeKey[k]
      }
       
      catch (e) {
        return undefined
      }
    }

    return storeKey
  }

  // Subscribe to store changes. Returns an unsubscribe function.
  subscribe(fn: (s: any) => void) {
    this._reactorListeners.add(fn)
    try {
      fn(this._reactorValue)
    }
    catch (e) {
      /* swallow listener errors */
    }
    return () => this._reactorListeners.delete(fn)
  }

  private notify() {
    // Try to give listeners the reactive state (solid state when available)
    const snapshot = this._store ?? this._raw
    // update reactor snapshot and notify listeners
    this._reactorValue = snapshot
    for (const fn of Array.from(this._reactorListeners)) {
      try { fn(snapshot) } catch (e) { /* swallow */ }
    }
  }

  // Create a proxy that notifies on mutation. Lightweight fallback for SSR
  private createProxy(obj: Record<string, any>) {
    const self = this
    const handler: ProxyHandler<any> = {
      set(target, prop, value) {
        // assign
        // @ts-ignore
        target[prop] = value
        // notify subscribers
        self.notify()
        return true
      },
      deleteProperty(target, prop) {
        // @ts-ignore
        const ok = delete target[prop]
        self.notify()
        return ok
      }
    }

    // handle nested objects: wrap them too so deep sets notify
    const walker = (o: any) => {
      if (!o || typeof o !== 'object') return o
      for (const k of Object.keys(o)) {
        o[k] = walker(o[k])
      }
      return new Proxy(o, handler)
    }

    return walker(obj)
  }
}
const conf = new Conf()

export { conf }

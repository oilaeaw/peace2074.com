import client from '../../app/config/client'
import dev from '../../app/config/dev'
import prod from '../../app/config/prod'
import server from '../../server/config/server'

type CT = typeof client
type DT = typeof dev
type PT = typeof prod
type ST = typeof server

class Conf {
  // explicit typed internal fields
  private _store: Record<string, any> = {}
  private _server?: ST
  private _client?: CT
  private _dev?: DT
  private _prod?: PT
  private _env?: 'client' | 'server'

  constructor() {
    // initialize environment and values
    this.setEnvironment()
    this._server = this.getServerVars() as ST
    this._client = this.getClientVars() as CT
    this._dev = this.getUrgentOverrides() as DT
    this._prod = this.getUrgentOverrides() as PT

    this._store = Object.assign(
      { ...(this._client || {}) },
      { ...(this._server || {}) },
      { ...(this._dev || {}) },
      { client: this._client },
      { server: this._server || {} },
      { dev: this._dev },
    )
  }

  set(key: string, value: string | number | object) {
    if (key.match(/:/)) {
      const keys = key.split(':')
      let storeKey: Record<string, any> = this._store

      keys.forEach((rawK: string, i: number) => {
        const k = String(rawK)

        // initialize the nested level if it doesn't exist
        if (storeKey[k] === undefined) {
          // if it's the last key, assign the value directly
          if (keys.length === i + 1) {
            storeKey[k] = value
            return
          }
          storeKey[k] = {}
        }

        // if last key and wasn't handled above, set it
        if (keys.length === i + 1) {
          storeKey[k] = value
        }

        // descend
        const next = storeKey[k]
        if (typeof next === 'object' && next !== null) {
          storeKey = next as Record<string, any>
        } else {
          // overwrite non-object with object to continue descent
          storeKey[k] = {}
          storeKey = storeKey[k]
        }
      })
    }
    else {
      this._store[key] = value
    }
  }

  getAll(): Record<string, any> {
    return this._store
  }

  getItem(key: string): any {
    return this._store?.[key]
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
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (err: any) {
        // eslint-disable-next-line node/prefer-global/process
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
    // eslint-disable-next-line unused-imports/no-unused-vars
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
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (e) {
      overrides = {}
    }

    return overrides
  }

  // Builds out a nested key to get nested values
  buildNestedKey(nestedKey: string): any {
    // Transform getter string into object
    const keys = nestedKey.split(':')
    let storeKey: any = this._store

    for (const rawK of keys) {
      const k = String(rawK)
      if (storeKey === undefined || storeKey === null) return undefined
      try {
        storeKey = storeKey[k]
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {
        return undefined
      }
    }

    return storeKey
  }
}
const conf = new Conf()

export { conf }

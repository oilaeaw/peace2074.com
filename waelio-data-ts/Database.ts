import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { EventEmitter } from 'node:events'

export interface DatabaseOptions {
  filePath?: string
  encryptionKey?: string
}

export type DatabaseEventPayload = {
  event: 'set' | 'delete' | 'clear'
  collection: string
  key?: string
  value?: any
}

export class Database extends EventEmitter {
  private _filePath: string
  private _encryptionKey: string | null
  private _data: Record<string, Record<string, any>>

  constructor(options: DatabaseOptions = {}) {
    super()

    this._filePath = options.filePath
      ? path.resolve(options.filePath)
      : path.join(process.cwd(), 'db.json')

    this._encryptionKey = options.encryptionKey || null
    if (
      this._encryptionKey &&
      Buffer.from(this._encryptionKey, 'hex').length !== 32
    ) {
      throw new Error(
        'encryptionKey must be a 64-character hex string (32 bytes).'
      )
    }

    this._data = Object.create(null)
    this._load()
  }

  // ── persistence helpers ───────────────────────────────────────────────────

  private _nullProtoData(parsed: Record<string, any>) {
    const root = Object.create(null)
    for (const col of Object.keys(parsed)) {
      const sub = Object.create(null)
      Object.assign(sub, parsed[col])
      root[col] = sub
    }
    return root
  }

  private _load() {
    if (!fs.existsSync(this._filePath)) {
      this._data = Object.create(null)
      return
    }
    const raw = fs.readFileSync(this._filePath, 'utf8')
    if (!raw.trim()) {
      this._data = Object.create(null)
      return
    }
    const parsed = this._encryptionKey
      ? JSON.parse(this._decrypt(raw))
      : JSON.parse(raw)
    this._data = this._nullProtoData(parsed)
  }

  private _save() {
    const json = JSON.stringify(this._data, null, 2)
    const content = this._encryptionKey ? this._encrypt(json) : json
    fs.writeFileSync(this._filePath, content, 'utf8')
  }

  // ── encryption helpers (AES-256-CBC) ─────────────────────────────────────

  private _encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this._encryptionKey!, 'hex'),
      iv
    )
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ])
    return iv.toString('hex') + ':' + encrypted.toString('hex')
  }

  private _decrypt(text: string): string {
    const [ivHex, dataHex] = text.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this._encryptionKey!, 'hex'),
      iv
    )
    return Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]).toString('utf8')
  }

  // ── collection helpers ────────────────────────────────────────────────────

  private _validateName(name: any, label: string) {
    if (
      typeof name !== 'string' ||
      name === '' ||
      name === '__proto__' ||
      name === 'constructor' ||
      name === 'prototype'
    ) {
      throw new TypeError(`Invalid ${label} name: ${JSON.stringify(name)}`)
    }
  }

  private _ensureCollection(collection: string) {
    this._validateName(collection, 'collection')
    if (!Object.prototype.hasOwnProperty.call(this._data, collection)) {
      this._data[collection] = Object.create(null)
    }
  }

  // ── public API ────────────────────────────────────────────────────────────

  public set(collection: string, key: string, value: any) {
    this._validateName(key, 'key')
    this._ensureCollection(collection)
    this._data[collection][key] = value
    this._save()
    const payload: DatabaseEventPayload = {
      event: 'set',
      collection,
      key,
      value,
    }
    this.emit('set', payload)
    this.emit('change', payload)
  }

  public get(collection: string, key: string): any {
    this._validateName(collection, 'collection')
    this._validateName(key, 'key')
    const col = this._data[collection]
    if (!col) return undefined
    return col[key]
  }

  public has(collection: string, key: string): boolean {
    this._validateName(collection, 'collection')
    this._validateName(key, 'key')
    return !!(this._data[collection] && key in this._data[collection])
  }

  public delete(collection: string, key: string): boolean {
    this._validateName(key, 'key')
    if (!this.has(collection, key)) return false
    delete this._data[collection][key]
    this._save()
    const payload: DatabaseEventPayload = { event: 'delete', collection, key }
    this.emit('delete', payload)
    this.emit('change', payload)
    return true
  }

  public getAll(collection: string): Record<string, any> {
    this._validateName(collection, 'collection')
    return Object.assign({}, this._data[collection] || {})
  }

  public clear(collection: string) {
    this._validateName(collection, 'collection')
    this._data[collection] = Object.create(null)
    this._save()
    const payload: DatabaseEventPayload = { event: 'clear', collection }
    this.emit('clear', payload)
    this.emit('change', payload)
  }

  public collections(): string[] {
    return Object.keys(this._data)
  }
}

export default Database

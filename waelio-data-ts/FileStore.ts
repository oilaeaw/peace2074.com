import fs from 'node:fs'
import path from 'node:path'
import { EventEmitter } from 'node:events'

export interface FileStoreOptions {
  storageDir?: string
}

export class FileStore extends EventEmitter {
  private _storageDir: string

  constructor(options: FileStoreOptions = {}) {
    super()
    this._storageDir = options.storageDir
      ? path.resolve(options.storageDir)
      : path.join(process.cwd(), 'blobs')

    this._ensureDir()
  }

  private _ensureDir() {
    if (!fs.existsSync(this._storageDir)) {
      fs.mkdirSync(this._storageDir, { recursive: true })
    }
  }

  private _validateKey(key: string) {
    if (
      !key ||
      typeof key !== 'string' ||
      key.includes('..') ||
      key.startsWith('/')
    ) {
      throw new Error(`Invalid file key: ${key}`)
    }
  }

  private _getFilePath(key: string) {
    this._validateKey(key)
    return path.join(this._storageDir, key)
  }

  public saveFile(key: string, buffer: Buffer): void {
    const filePath = this._getFilePath(key)
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, buffer)
    this.emit('change', { event: 'saveFile', key })
  }

  public getFileStream(key: string): fs.ReadStream | null {
    const filePath = this._getFilePath(key)
    if (!fs.existsSync(filePath)) {
      return null
    }
    return fs.createReadStream(filePath)
  }

  public getFileSize(key: string): number | null {
    const filePath = this._getFilePath(key)
    if (!fs.existsSync(filePath)) {
      return null
    }
    return fs.statSync(filePath).size
  }

  public deleteFile(key: string): boolean {
    const filePath = this._getFilePath(key)
    if (!fs.existsSync(filePath)) {
      return false
    }
    fs.unlinkSync(filePath)
    this.emit('change', { event: 'deleteFile', key })
    return true
  }

  public hasFile(key: string): boolean {
    const filePath = this._getFilePath(key)
    return fs.existsSync(filePath)
  }
}

export default FileStore

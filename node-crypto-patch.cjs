// Combined startup patch (CommonJS)
// - Adds node crypto.hash and globalThis.crypto.hash (ArrayBuffer style)
// - Adds minimal web File/Blob polyfills used by some libs (undici/webidl)
// - Provides a fallback for process.getBuiltinModule when missing (used by some adapters)

try {
	const { Buffer } = require('node:buffer')
	const nativeCrypto = require('node:crypto')

	if (typeof nativeCrypto.hash !== 'function') {
		nativeCrypto.hash = (alg, data, encoding) => {
			let buf
			if (typeof data === 'string') buf = Buffer.from(data)
			else if (data instanceof ArrayBuffer) buf = Buffer.from(new Uint8Array(data))
			else if (data instanceof Uint8Array) buf = Buffer.from(data)
			else buf = Buffer.from(String(data))

			const algMap = {
				'SHA-256': 'sha256', 'SHA256': 'sha256', 'sha-256': 'sha256',
				'SHA-1': 'sha1', 'SHA1': 'sha1', 'MD5': 'md5'
			}
			const nodeAlg = algMap[alg] || String(alg).toLowerCase()
			const res = nativeCrypto.createHash(nodeAlg).update(buf).digest(encoding)
			return res
		}
	}

	if (typeof globalThis.crypto === 'undefined') {
		globalThis.crypto = nativeCrypto.webcrypto || {}
	}
	if (typeof (globalThis.crypto).hash !== 'function') {
		;(globalThis.crypto).hash = async (alg, data) => {
			let buf
			if (typeof data === 'string') buf = Buffer.from(data)
			else if (data instanceof ArrayBuffer) buf = Buffer.from(new Uint8Array(data))
			else if (data instanceof Uint8Array) buf = Buffer.from(data)
			else buf = Buffer.from(String(data))
			const algMap = {
				'SHA-256': 'sha256', 'SHA256': 'sha256', 'sha-256': 'sha256',
				'SHA-1': 'sha1', 'SHA1': 'sha1', 'MD5': 'md5'
			}
			const nodeAlg = algMap[alg] || String(alg).toLowerCase()
			const hash = nativeCrypto.createHash(nodeAlg).update(buf).digest()
			return hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength)
		}
	}

	// Minimal File polyfill used by undici/webidl when run in Node dev environment
	if (typeof globalThis.File === 'undefined') {
		class _File {
			constructor(parts = [], name = 'file', options = {}) {
				this._parts = Array.isArray(parts) ? parts : [parts]
				this.name = name
				this.lastModified = options.lastModified || Date.now()
				this.type = options.type || ''
				this.size = this._parts.reduce((s, p) => s + (typeof p === 'string' ? Buffer.byteLength(p) : (p ? p.length || 0 : 0)), 0)
			}
			async arrayBuffer() {
				// concatenate as Buffer then return underlying ArrayBuffer
				const bufs = this._parts.map(p => (typeof p === 'string' ? Buffer.from(p) : Buffer.from(p)))
				const b = Buffer.concat(bufs)
				return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
			}
			stream() {
				const { Readable } = require('node:stream')
				const r = new Readable({ read() {} })
				for (const p of this._parts) r.push(typeof p === 'string' ? Buffer.from(p) : p)
				r.push(null)
				return r
			}
			text() {
				return Promise.resolve(this._parts.map(p => (typeof p === 'string' ? p : p.toString())).join(''))
			}
		}
		globalThis.File = _File
	}

	// Minimal Blob polyfill if missing
	if (typeof globalThis.Blob === 'undefined') {
		class _Blob {
			constructor(parts = [], options = {}) {
				this._parts = Array.isArray(parts) ? parts : [parts]
				this.type = (options && options.type) || ''
				this.size = this._parts.reduce((s, p) => s + (typeof p === 'string' ? Buffer.byteLength(p) : (p ? p.length || 0 : 0)), 0)
			}
			async arrayBuffer() {
				const bufs = this._parts.map(p => (typeof p === 'string' ? Buffer.from(p) : Buffer.from(p)))
				const b = Buffer.concat(bufs)
				return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
			}
			text() { return Promise.resolve(this._parts.map(p => (typeof p === 'string' ? p : p.toString())).join('')) }
		}
		globalThis.Blob = _Blob
	}

	// Some libs (srvx / adapters) call process.getBuiltinModule — polyfill to require builtin
	try {
		if (typeof globalThis.process !== 'undefined' && typeof globalThis.process.getBuiltinModule !== 'function') {
			globalThis.process.getBuiltinModule = (name) => {
				try {
					// Prefer native builtin via require
					return require(name)
				}
				catch (e) {
					return undefined
				}
			}
		}
	}
	catch (e) {
		// ignore
	}
}
catch (e) {
	// best-effort, swallow errors to avoid blocking startup
	try { console.warn('node-crypto-patch failed', e) } catch {}
}


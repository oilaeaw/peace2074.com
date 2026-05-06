// Safe node:util stub for Cloudflare Workers builds.
// Provides a patched `inherits` that guards against undefined superCtor,
// which Mongoose triggers when some optional deps are stubbed out.

export function inherits(ctor: any, superCtor: any) {
    if (superCtor == null || superCtor.prototype == null) {
        // superCtor is undefined/null — skip inheritance silently
        return
    }
    Object.defineProperty(ctor, 'super_', {
        value: superCtor,
        writable: true,
        configurable: true,
    })
    Object.setPrototypeOf(ctor.prototype, superCtor.prototype)
}

export function deprecate<T extends (...args: any[]) => any>(fn: T, _msg: string): T {
    return fn
}

export function inspect(obj: unknown, _opts?: unknown): string {
    try {
        return JSON.stringify(obj)
    } catch {
        return String(obj)
    }
}

export function format(fmt: unknown, ...args: unknown[]): string {
    if (typeof fmt !== 'string') return String(fmt)
    let i = 0
    return fmt.replace(/%[sdjoO%]/g, (m) => {
        if (m === '%%') return '%'
        const arg = args[i++]
        if (m === '%s') return String(arg)
        if (m === '%d') return Number(arg).toString()
        if (m === '%j' || m === '%o' || m === '%O') {
            try { return JSON.stringify(arg) } catch { return '[Circular]' }
        }
        return m
    })
}

export function promisify(fn: (...args: any[]) => any) {
    return (...args: any[]) =>
        new Promise((resolve, reject) =>
            fn(...args, (err: any, result: any) => (err ? reject(err) : resolve(result)))
        )
}

export function callbackify(fn: (...args: any[]) => Promise<any>) {
    return (...args: any[]) => {
        const cb = args.pop()
        fn(...args).then((v: any) => cb(null, v), cb)
    }
}

export const types = {
    isNativeError: (v: unknown) => v instanceof Error,
    isRegExp: (v: unknown) => v instanceof RegExp,
    isDate: (v: unknown) => v instanceof Date,
    isMap: (v: unknown) => v instanceof Map,
    isSet: (v: unknown) => v instanceof Set,
    isPromise: (v: unknown) => v instanceof Promise,
    isFunction: (v: unknown) => typeof v === 'function',
    isBuffer: (_v: unknown) => false,
    isUint8Array: (v: unknown) => v instanceof Uint8Array,
}

export const TextDecoder = globalThis.TextDecoder
export const TextEncoder = globalThis.TextEncoder

export default {
    inherits,
    deprecate,
    inspect,
    format,
    promisify,
    callbackify,
    types,
    TextDecoder: globalThis.TextDecoder,
    TextEncoder: globalThis.TextEncoder,
}

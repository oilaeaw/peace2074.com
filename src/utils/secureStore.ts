import { configStorage, memoryStorage } from "@waelio/ustore";
import { _encrypt, _decrypt } from "waelio-utils";

// Minimal secure wrapper for @waelio/ustore.
// Encrypts before save; decrypts on read. Uses in-memory store during SSR.
// Provide a salt when calling; without a salt, writes are skipped.

const ENC_PREFIX = "__enc__";
const DEFAULT_NAMESPACE = "peace-secure";

type StoreDriver = {
  getItem: (key: string) => any;
  set: (key: string, value: any) => void;
  removeItem?: (key: string) => void;
  clear?: () => void;
};

type CommonOpts = {
  namespace?: string;
  storage?: StoreDriver;
  salt: string;
};

type SetOpts = CommonOpts;

type GetOpts<T> = CommonOpts & { fallback?: T };

type RemoveOpts = {
  namespace?: string;
  storage?: StoreDriver;
};

function ns(namespace: string, key: string) {
  return `${namespace}:${key}`;
}

function pickStorage(custom?: StoreDriver): StoreDriver {
  return typeof window === "undefined" ? memoryStorage : custom || configStorage;
}

export function setSecure<T = unknown>(key: string, value: T, opts: SetOpts): boolean {
  if (!key) throw new Error("setSecure requires a key");
  const { salt, namespace = DEFAULT_NAMESPACE, storage } = opts;
  if (!salt) {
    console.warn("[secureStore] salt is required; skipped write.");
    return false;
  }
  const store = pickStorage(storage);
  try {
    const encrypted = _encrypt(value as any, salt);
    store.set(ns(namespace, key), `${ENC_PREFIX}${encrypted}`);
    return true;
  } catch (err) {
    console.warn(`[secureStore] failed to encrypt key "${key}"`, err);
    return false;
  }
}

export function getSecure<T = unknown>(key: string, opts: GetOpts<T>): T | undefined {
  if (!key) throw new Error("getSecure requires a key");
  const { salt, namespace = DEFAULT_NAMESPACE, storage, fallback } = opts;
  const store = pickStorage(storage);
  const raw = store.getItem(ns(namespace, key)) as any;
  if (raw === undefined) return fallback;
  if (typeof raw !== "string" || !raw.startsWith(ENC_PREFIX)) return fallback;
  if (!salt) {
    console.warn("[secureStore] salt is required to decrypt; returning fallback.");
    return fallback;
  }
  try {
    const decrypted = _decrypt(raw.slice(ENC_PREFIX.length), salt) as T;
    return decrypted === undefined ? fallback : decrypted;
  } catch (err) {
    console.warn(`[secureStore] failed to decrypt key "${key}"`, err);
    return fallback;
  }
}

export function removeSecure(key: string, opts: RemoveOpts = {}) {
  if (!key) throw new Error("removeSecure requires a key");
  const { namespace = DEFAULT_NAMESPACE, storage } = opts;
  const store = pickStorage(storage);
  const scoped = ns(namespace, key);
  if (typeof store.removeItem === "function") {
    store.removeItem(scoped);
  } else {
    // fallback for drivers without removeItem
    store.set(scoped, undefined as any);
  }
}

export function createSecureStore(baseOpts: CommonOpts) {
  const { namespace = DEFAULT_NAMESPACE, storage, salt } = baseOpts;
  return {
    set: <T>(key: string, value: T) => setSecure(key, value, { salt, namespace, storage }),
    get: <T>(key: string, fallback?: T) => getSecure<T>(key, { salt, namespace, storage, fallback }),
    remove: (key: string) => removeSecure(key, { namespace, storage }),
  };
}

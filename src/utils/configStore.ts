import { configStorage, memoryStorage } from "@waelio/ustore";
import { _encrypt, _decrypt } from "waelio-utils";

// Lightweight wrapper around @waelio/ustore config storage.
// - Uses in-memory fallback during SSR to avoid window access.
// - Namespaces keys to reduce collision risk.
// - Warns (does not store securely) if key name suggests sensitive data.

const NAMESPACE = "peace-config";
const SENSITIVE_HINTS = ["token", "secret", "key", "password", "jwt", "api_key"];
const ENC_PREFIX = "__enc__";

const storage = typeof window === "undefined" ? memoryStorage : configStorage;

function ns(key: string) {
    return `${NAMESPACE}:${key}`;
}

function warnIfSensitive(key: string) {
    const lower = key.toLowerCase();
    if (SENSITIVE_HINTS.some((hint) => lower.includes(hint))) {
        console.warn(
            `[configStore] Key "${key}" looks sensitive. Client-side storage is not secure; prefer server/env storage for secrets.`
        );
    }
}

type SetOptions = {
    encrypt?: boolean;
    salt?: string;
};

type GetOptions = {
    decrypt?: boolean;
    salt?: string;
};

export function setConfig<T = unknown>(key: string, value: T, options: SetOptions = {}) {
    if (!key) throw new Error("setConfig requires a key");
    warnIfSensitive(key);
    const { encrypt = false, salt } = options;

    if (encrypt) {
        if (!salt) {
            console.warn(`[configStore] Encryption requested for "${key}" but no salt provided; storing plaintext.`);
            storage.set(ns(key), value as any);
            return;
        }
        try {
            const encrypted = _encrypt(value as any, salt);
            storage.set(ns(key), `${ENC_PREFIX}${encrypted}`);
            return;
        } catch (err) {
            console.warn(`[configStore] Failed to encrypt "${key}"; storing plaintext.`, err);
        }
    }

    storage.set(ns(key), value as any);
}

export function getConfig<T = unknown>(key: string, fallback?: T, options: GetOptions = {}): T | undefined {
    if (!key) throw new Error("getConfig requires a key");
    const raw = storage.getItem(ns(key)) as any;
    if (raw === undefined) return fallback;

    const { decrypt = false, salt } = options;

    if (decrypt && typeof raw === "string" && raw.startsWith(ENC_PREFIX)) {
        if (!salt) {
            console.warn(`[configStore] Decryption requested for "${key}" but no salt provided; returning undefined.`);
            return fallback;
        }
        try {
            const decrypted = _decrypt(raw.slice(ENC_PREFIX.length), salt) as T;
            return decrypted === undefined ? fallback : decrypted;
        } catch (err) {
            console.warn(`[configStore] Failed to decrypt "${key}"; returning fallback.`, err);
            return fallback;
        }
    }

    return raw === undefined ? fallback : (raw as T);
}

export function removeConfig(key: string) {
    if (!key) throw new Error("removeConfig requires a key");
    const scoped = ns(key);
    if (typeof (storage as any).removeItem === "function") {
        (storage as any).removeItem(scoped);
    } else {
        storage.set(scoped, undefined as any);
    }
}

export function clearConfigNamespace() {
    if (typeof (storage as any).clear === "function") {
        (storage as any).clear();
    }
}

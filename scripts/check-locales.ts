import fs from 'node:fs';
import path from 'node:path';

const LOCALES = ['en', 'ar', 'de', 'es', 'ru', 'he', 'it', 'tr', 'uz'] as const;
type Locale = (typeof LOCALES)[number];
const BASE: Locale = 'en';
const LOCALE_DIR = path.join('src', 'locale');

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

type FlatKeys = Record<string, true>;

const load = (locale: Locale): JsonObject => {
    const file = path.join(LOCALE_DIR, `${locale}.json`);
    return JSON.parse(fs.readFileSync(file, 'utf8')) as JsonObject;
};

const flatten = (obj: JsonValue, prefix = ''): FlatKeys => {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return prefix ? { [prefix]: true } : {};
    }

    return Object.entries(obj).reduce<FlatKeys>((acc, [key, value]) => {
        const next = prefix ? `${prefix}.${key}` : key;
        const flatChild = flatten(value, next);
        return { ...acc, ...flatChild };
    }, {});
};

const data: Record<Locale, FlatKeys> = Object.fromEntries(
    LOCALES.map((locale) => [locale, flatten(load(locale))])
) as Record<Locale, FlatKeys>;

const ref = data[BASE];
let failed = false;

for (const [locale, keys] of Object.entries<FlatKeys>(data)) {
    const missing = Object.keys(ref).filter((k) => !(k in keys));
    const extra = Object.keys(keys).filter((k) => !(k in ref));

    if (missing.length || extra.length) {
        failed = true;
        if (missing.length) {
            console.error(`[${locale}] missing keys:`);
            missing.forEach((k) => console.error(`  ${k}`));
        }
        if (extra.length) {
            console.error(`[${locale}] extra keys:`);
            extra.forEach((k) => console.error(`  ${k}`));
        }
    }
}

if (failed) {
    console.error('\nLocale check failed. Please sync keys.');
    process.exitCode = 1;
} else {
    console.log('Locales are aligned ✔');
}

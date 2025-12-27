import fs from 'fs';
import path from 'path';

const LOCALES = ['en', 'ar', 'de', 'ru', 'he'];
const BASE = 'en';
const LOCALE_DIR = path.join('src', 'locale');

const load = (locale) => {
  const file = path.join(LOCALE_DIR, `${locale}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const flatten = (obj, prefix = '') =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return { ...acc, ...flatten(value, next) };
    }
    return { ...acc, [next]: true };
  }, {});

const data = Object.fromEntries(LOCALES.map((l) => [l, flatten(load(l))]));
const ref = data[BASE];
let failed = false;

for (const [locale, keys] of Object.entries(data)) {
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

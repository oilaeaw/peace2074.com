import { d as defineEventHandler, g as getQuery } from '../nitro/nitro.mjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:crypto';
import 'node:url';

const chapterFiles = {
  en: "en.json",
  ru: "ru.json",
  ar: "ar.json",
  de: "en.json",
  he: "en.json"
};
const chapterCache = /* @__PURE__ */ new Map();
let quranCache = null;
async function loadJSON(p) {
  const buf = await readFile(p, "utf-8");
  return JSON.parse(buf);
}
function normalizeText(str) {
  const noHarakat = str.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "").replace(/[\u0622\u0623\u0624\u0625\u0626]/g, "\u0627").replace(/[^\p{L}\p{N}\s]/gu, " ");
  return noHarakat.toLowerCase().trim();
}
function normalizeLang(lang) {
  if (!lang) return "en";
  const short = String(lang).toLowerCase().split("-")[0];
  if (chapterFiles[short]) return short;
  return "en";
}
async function ensureQuran() {
  if (quranCache) return;
  const root = path.resolve(process.cwd(), "..", "..");
  const quranPath = path.join(root, "src", "shared", "data", "quran.json");
  quranCache = await loadJSON(quranPath);
}
async function ensureChapters(lang) {
  const loc = normalizeLang(lang);
  if (chapterCache.has(loc)) return;
  const root = path.resolve(process.cwd(), "..", "..");
  const file = chapterFiles[loc] || chapterFiles.en;
  const chaptersPath = path.join(root, "src", "shared", "data", "chapters", file);
  try {
    const data = await loadJSON(chaptersPath);
    chapterCache.set(loc, data);
  } catch (e) {
    if (!chapterCache.has("en")) {
      const fallback = path.join(root, "src", "shared", "data", "chapters", "en.json");
      chapterCache.set("en", await loadJSON(fallback));
    }
    if (loc !== "en") {
      chapterCache.set(loc, chapterCache.get("en") || []);
    }
  }
}
const search_get = defineEventHandler(async (event) => {
  const { q = "", limit = "20", lang = "en" } = getQuery(event);
  const rawQuery = String(q || "");
  const query = rawQuery.trim().toLowerCase();
  const normQuery = normalizeText(rawQuery);
  const max = Math.min(50, Math.max(1, Number(limit) || 20));
  if (!query) return { results: [] };
  const loc = normalizeLang(String(lang));
  await Promise.all([ensureChapters(loc), ensureQuran()]);
  const chapters = chapterCache.get(loc) || chapterCache.get("en") || [];
  const quran = quranCache || {};
  const results = [];
  for (const c of chapters) {
    const name = String(c.name || "");
    const transliteration = String(c.transliteration || "");
    const translation = String(c.translation || "");
    const hay = `${name} ${transliteration} ${translation}`.toLowerCase();
    const hayNorm = normalizeText(`${name} ${transliteration} ${translation}`);
    if (hay.includes(query) || normQuery && hayNorm.includes(normQuery)) {
      results.push({
        type: "sura",
        id: c.id,
        title: `${c.id}. ${transliteration || translation || name}`.trim(),
        subtitle: translation || name,
        path: `/quran/${c.id}`
      });
    }
    if (results.length >= max) break;
  }
  outer: for (const [suraId, verses] of Object.entries(quran)) {
    for (const verse of verses || []) {
      const text = String(verse.text || "");
      const hay = text.toLowerCase();
      const hayNorm = normalizeText(text);
      if (hay.includes(query) || normQuery && hayNorm.includes(normQuery)) {
        const id = `${suraId}:${verse.verse || ""}`;
        results.push({
          type: "verse",
          id,
          title: `Ayah ${id}`,
          subtitle: text.slice(0, 140),
          path: `/quran/${suraId}#verse-${verse.verse || ""}`
        });
        if (results.length >= max) break outer;
      }
    }
  }
  return { results: results.slice(0, max) };
});

export { search_get as default };
//# sourceMappingURL=search.get.mjs.map

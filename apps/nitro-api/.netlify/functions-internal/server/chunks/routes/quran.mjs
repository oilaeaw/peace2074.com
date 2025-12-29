import { d as defineEventHandler } from '../nitro/nitro.mjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:crypto';

async function loadJSON(p) {
  const buf = await readFile(p, "utf-8");
  return JSON.parse(buf);
}
const quran = defineEventHandler(async () => {
  const root = path.resolve(process.cwd(), "..", "..");
  const chaptersPath = path.join(root, "src", "shared", "data", "chapters", "en.json");
  const quranPath = path.join(root, "src", "shared", "data", "quran.json");
  const chapters = await loadJSON(chaptersPath);
  const book = await loadJSON(quranPath);
  const list = (chapters || []).map((meta) => {
    const id = Number((meta == null ? void 0 : meta.id) || (meta == null ? void 0 : meta.number));
    const verses = Array.isArray(book[String(id)]) ? book[String(id)] : [];
    return {
      id,
      name: String((meta == null ? void 0 : meta.name) || (meta == null ? void 0 : meta.suraName) || (meta == null ? void 0 : meta.transliteration) || ""),
      e_name: String((meta == null ? void 0 : meta.translation) || (meta == null ? void 0 : meta.suraName) || ""),
      type: String((meta == null ? void 0 : meta.type) || ""),
      total_verses: verses.length
    };
  });
  return list;
});

export { quran as default };
//# sourceMappingURL=quran.mjs.map

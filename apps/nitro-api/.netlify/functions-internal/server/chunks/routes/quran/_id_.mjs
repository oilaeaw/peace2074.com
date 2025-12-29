import { d as defineEventHandler, i as getRouterParam } from '../../nitro/nitro.mjs';
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
const _id_ = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id") || 1);
  const root = path.resolve(process.cwd(), "..", "..");
  const chaptersPath = path.join(root, "src", "shared", "data", "chapters", "en.json");
  const quranPath = path.join(root, "src", "shared", "data", "quran.json");
  const chapters = await loadJSON(chaptersPath);
  const book = await loadJSON(quranPath);
  const meta = (chapters || []).find((c) => Number((c == null ? void 0 : c.id) || (c == null ? void 0 : c.number)) === id);
  const verses = Array.isArray(book[String(id)]) ? book[String(id)] : [];
  const sura = {
    id,
    name: String((meta == null ? void 0 : meta.name) || (meta == null ? void 0 : meta.suraName) || (meta == null ? void 0 : meta.transliteration) || ""),
    e_name: String((meta == null ? void 0 : meta.translation) || (meta == null ? void 0 : meta.suraName) || ""),
    type: String((meta == null ? void 0 : meta.type) || ""),
    total_verses: verses.length,
    ayat: verses.map((v) => ({ verse: v.verse, text: v.text, translation: v.translation }))
  };
  return { sura };
});

export { _id_ as default };
//# sourceMappingURL=_id_.mjs.map

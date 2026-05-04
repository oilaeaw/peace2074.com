import { d as defineEventHandler, b as getQuery } from '../nitro/nitro.mjs';
import { c as chaptersEn } from '../_/en.mjs';
import { q as quranData } from '../_/quran.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const quran = defineEventHandler((event) => {
  const chapters = chaptersEn;
  const book = quranData;
  const query = getQuery(event);
  const requestedId = Number((query == null ? void 0 : query.s) || (query == null ? void 0 : query.id) || 0);
  if (requestedId > 0) {
    const meta = (chapters || []).find((c) => Number((c == null ? void 0 : c.id) || (c == null ? void 0 : c.number)) === requestedId);
    const verses = Array.isArray(book[String(requestedId)]) ? book[String(requestedId)] : [];
    return {
      sura: {
        id: requestedId,
        name: String((meta == null ? void 0 : meta.name) || (meta == null ? void 0 : meta.suraName) || (meta == null ? void 0 : meta.transliteration) || ""),
        e_name: String((meta == null ? void 0 : meta.translation) || (meta == null ? void 0 : meta.suraName) || ""),
        type: String((meta == null ? void 0 : meta.type) || ""),
        total_verses: verses.length,
        ayat: verses.map((v) => ({ verse: v.verse, text: v.text, translation: v.translation }))
      }
    };
  }
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

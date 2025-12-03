import { d as defineEventHandler, a as getQuery } from '../../nitro/nitro.mjs';
import hdetails from '@server/data/editions/en.json';
import hbook from '@server/data/quran.json';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '#auth';
import '@server/utils/abilities';

const quran = defineEventHandler((event) => {
  const params = getQuery(event);
  const s = params == null ? void 0 : params.s;
  const ready = [];
  Object.keys(hdetails).forEach((key) => {
    const id = Number(key);
    const metaSample = (hdetails[key] || [])[0];
    const ayat = hbook[key] || [];
    if (!Array.isArray(ayat)) return;
    ready.push({
      id,
      name: String((metaSample == null ? void 0 : metaSample.suraName) || ""),
      e_name: String((metaSample == null ? void 0 : metaSample.suraName) || ""),
      type: String((metaSample == null ? void 0 : metaSample.type) || ""),
      total_verses: ayat.length,
      ayat
    });
  });
  if (s) {
    const idx = Number(Array.isArray(s) ? s[0] : s);
    const found = ready.find((r) => r.id === idx);
    return found;
  }
  return ready;
});

export { quran as default };
//# sourceMappingURL=quran.mjs.map

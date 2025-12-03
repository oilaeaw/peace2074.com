import { d as defineEventHandler, s as sendError, c as createError, f as setHeader } from '../../../nitro/nitro.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:crypto';
import 'mongoose';
import '#auth';
import '@server/utils/abilities';

const DATA_PATH = join(process.cwd(), "shared", "data", "quran.json");
const cache = {};
const CACHE_TTL = 1e3 * 60 * 10;
const _sura_ = defineEventHandler(async (event) => {
  var _a;
  const suraParam = (_a = event.context.params) == null ? void 0 : _a.sura;
  if (!suraParam)
    return sendError(event, createError({ statusCode: 400, statusMessage: "sura param required" }));
  const suraId = Number(suraParam);
  if (Number.isNaN(suraId) || suraId <= 0)
    return sendError(event, createError({ statusCode: 400, statusMessage: "invalid sura id" }));
  const cacheKey = String(suraId);
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].ts < CACHE_TTL) {
    setHeader(event, "Cache-Control", `public, max-age=${Math.floor(CACHE_TTL / 1e3)}`);
    return cache[cacheKey].data;
  }
  let raw;
  try {
    raw = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  } catch (err) {
    return sendError(event, createError({ statusCode: 500, statusMessage: "failed to read quran data", cause: err }));
  }
  let found = null;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    if (raw[String(suraId)]) {
      const ayat = raw[String(suraId)];
      found = {
        id: suraId,
        name: "",
        e_name: "",
        type: "",
        total_verses: Array.isArray(ayat) ? ayat.length : 0,
        ayat
      };
    } else if (Array.isArray(raw.Surah)) {
      found = raw.Surah.find((s) => Number(s.id) === suraId) || null;
    }
  }
  if (!found && Array.isArray(raw)) {
    found = raw.find((s) => Number(s.id) === suraId) || null;
  }
  if (!found)
    return sendError(event, createError({ statusCode: 404, statusMessage: "sura not found" }));
  const payload = { sura: found };
  cache[cacheKey] = { ts: now, data: payload };
  setHeader(event, "Cache-Control", `public, max-age=${Math.floor(CACHE_TTL / 1e3)}`);
  return payload;
});

export { _sura_ as default };
//# sourceMappingURL=_sura_.mjs.map

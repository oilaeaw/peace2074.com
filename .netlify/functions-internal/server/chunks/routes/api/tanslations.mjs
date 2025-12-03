import { d as defineEventHandler, u as useRuntimeConfig, a as getQuery, r as readBody } from '../../nitro/nitro.mjs';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
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

const localesDir = join(process.cwd(), "app", "locale");
const tanslations = defineEventHandler(async (event) => {
  var _a;
  const config = useRuntimeConfig();
  if (((_a = config == null ? void 0 : config.public) == null ? void 0 : _a.allowTranslationsApi) !== true && true) {
    return { ok: false, error: "translations api disabled" };
  }
  const q = getQuery(event);
  q.action || event.node.req.method;
  if (event.node.req.method === "GET") {
    const actionParam = q.action || "";
    if (actionParam === "list") {
      try {
        const files = await readdir(localesDir);
        const jsonFiles = files.filter((f) => f.endsWith(".json"));
        return { ok: true, files: jsonFiles };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    }
    const file = q.file || "en.json";
    const full = join(localesDir, file);
    try {
      const raw = await readFile(full, "utf8");
      return { ok: true, file, data: JSON.parse(raw) };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
  if (event.node.req.method === "POST") {
    try {
      const body = await readBody(event);
      const file = body.file || "en.json";
      const content = body.content;
      if (!content || typeof content !== "object") return { ok: false, error: "invalid content" };
      const full = join(localesDir, file);
      await writeFile(full, JSON.stringify(content, null, 2) + "\n", "utf8");
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
  return { ok: false, error: "unsupported method" };
});

export { tanslations as default };
//# sourceMappingURL=tanslations.mjs.map

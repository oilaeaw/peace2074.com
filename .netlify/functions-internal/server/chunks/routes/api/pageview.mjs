import { d as defineEventHandler } from '../../nitro/nitro.mjs';
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

const startAt = Date.now();
let count = 0;
const pageview = defineEventHandler((_event) => {
  const payload = { pageview: count++, startAt };
  try {
    const io = globalThis.__io;
    if (io && typeof io.emit === "function") {
      io.emit("pageview", payload);
    }
  } catch {
  }
  return payload;
});

export { pageview as default };
//# sourceMappingURL=pageview.mjs.map

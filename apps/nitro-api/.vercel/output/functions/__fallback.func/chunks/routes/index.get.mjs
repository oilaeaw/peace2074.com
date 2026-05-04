import { d as defineEventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const index_get = defineEventHandler(() => ({
  name: "Peace2074 API",
  version: "1.0.0",
  routes: [
    "GET /",
    "GET /health",
    "GET /quran",
    "GET /quran/:id",
    "POST /kimi"
  ],
  message: "Nitro API ready. Override PORT to change the default 3000 listener."
}));

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map

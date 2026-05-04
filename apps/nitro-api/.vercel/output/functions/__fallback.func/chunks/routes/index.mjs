import { d as defineEventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const index = defineEventHandler(() => ({
  name: "Peace2074 API",
  version: "1.0.0",
  routes: [
    "/health",
    "/quran",
    "/quran/:id",
    "/kimi"
  ],
  message: "Nitro API is running on port 3000 by default. Override with PORT env var if needed."
}));

export { index as default };
//# sourceMappingURL=index.mjs.map

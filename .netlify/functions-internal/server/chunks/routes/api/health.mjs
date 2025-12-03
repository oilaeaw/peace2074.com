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

const health = defineEventHandler(async () => {
  return {
    status: "\u2705 Healthy",
    uptime: "Running",
    database: "Not connected yet",
    memory: "Good",
    server: "Nitro + Deno",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: "3.0.0"
  };
});

export { health as default };
//# sourceMappingURL=health.mjs.map

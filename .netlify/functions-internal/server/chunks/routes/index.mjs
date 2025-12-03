import { d as defineEventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const index = defineEventHandler(async () => {
  return {
    message: "\u{1F54C} Peace2074.com API is running!",
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    server: "Nitro + Deno",
    deployment: "Netlify Ready",
    features: [
      "Authentication",
      "Quran API",
      "Prayer times",
      "Bookmarks",
      "Tasbeeh counter"
    ]
  };
});

export { index as default };
//# sourceMappingURL=index.mjs.map

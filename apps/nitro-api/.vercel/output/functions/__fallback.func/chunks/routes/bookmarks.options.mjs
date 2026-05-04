import { d as defineEventHandler } from '../nitro/nitro.mjs';
import { a as applyCors } from '../_/cors.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const bookmarks_options = defineEventHandler((event) => {
  applyCors(event);
  return null;
});

export { bookmarks_options as default };
//# sourceMappingURL=bookmarks.options.mjs.map

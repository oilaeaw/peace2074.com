import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const likes_options = defineEventHandler((event) => {
  return { ok: true };
});

export { likes_options as default };
//# sourceMappingURL=likes.options.mjs.map

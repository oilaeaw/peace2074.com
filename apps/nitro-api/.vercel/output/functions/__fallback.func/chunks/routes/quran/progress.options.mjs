import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const progress_options = defineEventHandler(() => {
  return { ok: true };
});

export { progress_options as default };
//# sourceMappingURL=progress.options.mjs.map

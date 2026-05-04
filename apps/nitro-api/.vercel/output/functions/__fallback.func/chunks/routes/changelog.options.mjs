import { d as defineEventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const changelog_options = defineEventHandler(() => {
  return { ok: true };
});

export { changelog_options as default };
//# sourceMappingURL=changelog.options.mjs.map

import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const _id__options = defineEventHandler((event) => {
  applyCors(event);
  return null;
});

export { _id__options as default };
//# sourceMappingURL=_id_.options.mjs.map

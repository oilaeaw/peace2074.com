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

const exchange_options = defineEventHandler((event) => {
  applyCors(event);
  return null;
});

export { exchange_options as default };
//# sourceMappingURL=exchange.options.mjs.map

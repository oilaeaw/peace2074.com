import { d as defineEventHandler, x as setResponseStatus } from '../nitro/nitro.mjs';
import { a as applyCors } from '../_/cors.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const tasbeeh_options = defineEventHandler((event) => {
  applyCors(event);
  setResponseStatus(event, 204);
  return "";
});

export { tasbeeh_options as default };
//# sourceMappingURL=tasbeeh.options.mjs.map

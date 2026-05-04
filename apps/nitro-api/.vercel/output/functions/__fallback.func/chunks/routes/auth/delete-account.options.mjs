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

const deleteAccount_options = defineEventHandler((event) => {
  applyCors(event);
  return { statusCode: 204 };
});

export { deleteAccount_options as default };
//# sourceMappingURL=delete-account.options.mjs.map

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

const changePassword_options = defineEventHandler((event) => {
  applyCors(event);
  return { statusCode: 204 };
});

export { changePassword_options as default };
//# sourceMappingURL=change-password.options.mjs.map

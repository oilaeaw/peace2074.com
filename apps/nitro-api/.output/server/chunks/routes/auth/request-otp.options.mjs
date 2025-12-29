import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import { a as applyCors } from '../../_/cors.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const requestOtp_options = defineEventHandler((event) => {
  applyCors(event);
  event.node.res.statusCode = 204;
  event.node.res.end();
});

export { requestOtp_options as default };
//# sourceMappingURL=request-otp.options.mjs.map

import { d as defineEventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const health = defineEventHandler(() => ({ status: "OK", message: "Nitro API is healthy" }));

export { health as default };
//# sourceMappingURL=health.mjs.map

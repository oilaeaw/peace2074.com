import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '#auth';
import '@server/utils/abilities';

const socketStatus = defineEventHandler(() => {
  var _a, _b, _c, _d, _e, _f;
  try {
    const io = globalThis.__io;
    return { socketEnabled: !!io, clients: io ? (_f = (_e = (_b = (_a = io.sockets) == null ? void 0 : _a.sockets) == null ? void 0 : _b.size) != null ? _e : (_d = (_c = io.sockets) == null ? void 0 : _c.sockets) == null ? void 0 : _d.length) != null ? _f : 0 : 0 };
  } catch {
    return { socketEnabled: false, clients: 0 };
  }
});

export { socketStatus as default };
//# sourceMappingURL=socket-status.mjs.map

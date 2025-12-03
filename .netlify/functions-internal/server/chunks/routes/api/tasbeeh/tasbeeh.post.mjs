import handler from '../index.post.mjs';
import '../../../nitro/nitro.mjs';
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
import '@server/models/tasbeeh';
import '@server/utils/database';
import '@server/utils/auth';



export { handler as default };
//# sourceMappingURL=tasbeeh.post.mjs.map

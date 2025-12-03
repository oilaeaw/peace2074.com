import { d as defineEventHandler } from '../../../nitro/nitro.mjs';
import { getServerSession } from '#auth';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '@server/utils/abilities';

const me = defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session) {
    return { user: null };
  }
  return { user: session.user };
});

export { me as default };
//# sourceMappingURL=me.mjs.map

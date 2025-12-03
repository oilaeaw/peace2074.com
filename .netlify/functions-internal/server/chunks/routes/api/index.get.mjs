import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import Tasbeeh from '@server/models/tasbeeh';
import { ensureDbConnection } from '@server/utils/database';
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

const handler = defineEventHandler(async (event) => {
  await ensureDbConnection();
  const { getUserFromEvent } = await import('../../_/auth.mjs');
  const userData = await getUserFromEvent(event);
  const userId = userData == null ? void 0 : userData.id;
  if (!userId)
    return { message: "Not authenticated", data: null };
  const T = Tasbeeh;
  const doc = await T.findOne({ userId });
  if (!doc)
    return { message: "No data", data: null };
  return { message: "OK", data: doc };
});

export { handler as default };
//# sourceMappingURL=index.get.mjs.map

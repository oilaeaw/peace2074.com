import { d as defineEventHandler } from '../../../nitro/nitro.mjs';
import Bookmark from '@server/models/bookmark';
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

const bookmarks = defineEventHandler(async (_event) => {
  await ensureDbConnection();
  return await Bookmark.find();
});

export { bookmarks as default };
//# sourceMappingURL=bookmarks.mjs.map

import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import { q as quranData } from '../../_/quran.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const data_get = defineEventHandler(() => {
  return quranData;
});

export { data_get as default };
//# sourceMappingURL=data.get.mjs.map

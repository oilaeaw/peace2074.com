import { d as defineEventHandler, r as readBody } from '../../nitro/nitro.mjs';
import Tasbeeh from '@server/models/tasbeeh';
import { ensureDbConnection } from '@server/utils/database';
import { requireUser } from '@server/utils/auth';
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
  const body = await readBody(event);
  await ensureDbConnection();
  const user = await requireUser(event);
  const userId = user == null ? void 0 : user.id;
  const { date, total, sessions, session } = body;
  const T = Tasbeeh;
  let doc = await T.findOne({ userId });
  if (!doc) {
    doc = await T.create({ userId, daily: [], sessions: [] });
  }
  const today = date || (/* @__PURE__ */ new Date()).toDateString();
  const dailyRec = doc.daily.find((d) => d.date === today);
  if (dailyRec) {
    dailyRec.total += total || 0;
    dailyRec.sessions += sessions || (session ? 1 : 0);
  } else {
    doc.daily.push({ date: today, total: total || (session ? session.count || 0 : 0), sessions: sessions || (session ? 1 : 0) });
  }
  if (session) {
    doc.sessions.push({ phraseIndex: session.phraseIndex, count: session.count, target: session.target });
  }
  await doc.save();
  return { message: "Saved", data: doc };
});

export { handler as default };
//# sourceMappingURL=index.post.mjs.map

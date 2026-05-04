import { g as getMongoose, d as defineEventHandler, r as readBody, c as createError } from '../nitro/nitro.mjs';
import { a as applyCors } from '../_/cors.mjs';
import { a as readSession } from '../_/auth.mjs';
import { T as TasbeehModel } from '../_/Tasbeeh.mjs';
import { d as updateTasbeehSummary } from '../_/profile.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

async function isDbReady() {
  try {
    await getMongoose();
    return true;
  } catch {
    return false;
  }
}
async function getTasbeehByUserId(userId) {
  if (await isDbReady()) {
    try {
      const tasbeeh = await TasbeehModel.findOne({ userId }).lean();
      return tasbeeh;
    } catch (e) {
      console.error("Failed to get tasbeeh:", e);
    }
  }
  return null;
}
async function createTasbeehRecord(userId) {
  if (await isDbReady()) {
    try {
      const created = await TasbeehModel.create({ userId, daily: [], sessions: [] });
      return created.toObject();
    } catch (e) {
      console.error("Failed to create tasbeeh record:", e);
    }
  }
  return null;
}
async function addTasbeehDaily(userId, daily) {
  let tasbeeh = await getTasbeehByUserId(userId);
  if (!tasbeeh) {
    tasbeeh = await createTasbeehRecord(userId);
    if (!tasbeeh) return false;
  }
  const dailyArray = Array.isArray(tasbeeh.daily) ? [...tasbeeh.daily] : [];
  const existingIndex = dailyArray.findIndex((d) => d.date === daily.date);
  if (existingIndex >= 0) {
    dailyArray[existingIndex] = daily;
  } else {
    dailyArray.push(daily);
  }
  if (dailyArray.length > 30) {
    dailyArray.splice(0, dailyArray.length - 30);
  }
  if (await isDbReady()) {
    try {
      await TasbeehModel.updateOne({ userId }, { $set: { daily: dailyArray } });
      await updateTasbeehSummary(userId, daily.total - (existingIndex >= 0 ? dailyArray[existingIndex].total : 0), false);
      return true;
    } catch (e) {
      console.error("Failed to update tasbeeh daily:", e);
    }
  }
  return false;
}
async function addTasbeehSession(userId, session) {
  let tasbeeh = await getTasbeehByUserId(userId);
  if (!tasbeeh) {
    tasbeeh = await createTasbeehRecord(userId);
    if (!tasbeeh) return false;
  }
  const sessions = Array.isArray(tasbeeh.sessions) ? [...tasbeeh.sessions] : [];
  sessions.push(session);
  if (sessions.length > 100) {
    sessions.splice(0, sessions.length - 100);
  }
  if (await isDbReady()) {
    try {
      await TasbeehModel.updateOne({ userId }, { $set: { sessions } });
      await updateTasbeehSummary(userId, session.count, true);
      return true;
    } catch (e) {
      console.error("Failed to update tasbeeh session:", e);
    }
  }
  return false;
}
async function getTasbeehDaily(userId) {
  const tasbeeh = await getTasbeehByUserId(userId);
  return (tasbeeh == null ? void 0 : tasbeeh.daily) || [];
}

const tasbeeh = defineEventHandler(async (event) => {
  applyCors(event);
  const session = await readSession(event);
  if (event.method === "GET") {
    if (!session) {
      return { data: { daily: [] } };
    }
    const userId = session.id;
    const tasbeehData = await getTasbeehDaily(userId);
    return { data: { daily: tasbeehData } };
  }
  if (event.method === "POST") {
    if (!session) {
      return { ok: false, message: "Not authenticated - data not saved" };
    }
    const body = await readBody(event);
    const { date, total, sessions, session: sessionData } = body;
    const userId = session.id;
    if (date && typeof total === "number" && typeof sessions === "number") {
      const success = await addTasbeehDaily(userId, { date, total, sessions });
      if (!success) {
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to save tasbeeh data"
        });
      }
    }
    if (sessionData && sessionData.phraseIndex !== void 0) {
      await addTasbeehSession(userId, {
        phraseIndex: sessionData.phraseIndex,
        count: sessionData.count || 0,
        target: sessionData.target || 33,
        completedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    return { ok: true, message: "Tasbeeh data saved" };
  }
  throw createError({
    statusCode: 405,
    statusMessage: "Method not allowed"
  });
});

export { tasbeeh as default };
//# sourceMappingURL=tasbeeh.mjs.map

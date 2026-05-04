import { g as getMongoose, d as defineEventHandler, c as createError, r as readBody } from '../nitro/nitro.mjs';
import { a as applyCors } from '../_/cors.mjs';
import { a as readSession } from '../_/auth.mjs';
import { R as ReaderStatsModel } from '../_/ReaderStats.mjs';
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
async function recordReaderStat(userId, sura) {
  if (await isDbReady()) {
    try {
      const stat = await ReaderStatsModel.create({ userId, sura, timestamp: /* @__PURE__ */ new Date() });
      return stat.toObject();
    } catch (e) {
      console.error("Failed to record reader stat:", e);
    }
  }
  return null;
}
async function getUserReaderStats(userId) {
  if (await isDbReady()) {
    try {
      const stats = await ReaderStatsModel.find({ userId }).sort({ timestamp: -1 }).lean();
      return stats;
    } catch (e) {
      console.error("Failed to get user reader stats:", e);
    }
  }
  return [];
}
async function getUserReadingAnalytics(userId) {
  if (await isDbReady()) {
    try {
      const stats = await ReaderStatsModel.find({ userId }).lean();
      const totalReadings = stats.length;
      const uniqueSuras = new Set(stats.map((s) => s.sura)).size;
      const surahCounts = stats.reduce((acc, stat) => {
        acc[stat.sura] = (acc[stat.sura] || 0) + 1;
        return acc;
      }, {});
      const mostRead = Object.entries(surahCounts).sort(([, a], [, b]) => b - a).slice(0, 10).map(([sura, count]) => ({ sura: Number(sura), count }));
      return { totalReadings, uniqueSuras, mostRead, surahCounts };
    } catch (e) {
      console.error("Failed to get user reading analytics:", e);
    }
  }
  return null;
}

const readerStats = defineEventHandler(async (event) => {
  applyCors(event);
  const session = await readSession(event);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required"
    });
  }
  if (event.method === "POST") {
    const body = await readBody(event);
    const { sura } = body;
    if (!sura || typeof sura !== "number" || sura < 1 || sura > 114) {
      throw createError({
        statusCode: 400,
        statusMessage: "Valid sura number (1-114) is required"
      });
    }
    const stat = await recordReaderStat(session.id, sura);
    if (!stat) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to record reading stat"
      });
    }
    return { ok: true, stat };
  }
  if (event.method === "GET") {
    const url = new URL(event.node.req.url || "", `http://${event.node.req.headers.host}`);
    const analytics = url.searchParams.get("analytics");
    if (analytics === "true") {
      const data = await getUserReadingAnalytics(session.id);
      if (!data) {
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to fetch analytics"
        });
      }
      return { ok: true, analytics: data };
    } else {
      const stats = await getUserReaderStats(session.id);
      return { ok: true, stats };
    }
  }
  throw createError({
    statusCode: 405,
    statusMessage: "Method not allowed"
  });
});

export { readerStats as default };
//# sourceMappingURL=reader-stats.mjs.map

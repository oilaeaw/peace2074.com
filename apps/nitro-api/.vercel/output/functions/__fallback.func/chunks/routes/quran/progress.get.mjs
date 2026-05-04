import { d as defineEventHandler, g as getMongoose } from '../../nitro/nitro.mjs';
import { a as readSession } from '../../_/auth.mjs';
import { Q as QuranProgressModel } from '../../_/QuranProgress.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const progress_get = defineEventHandler(async (event) => {
  try {
    const session = await readSession(event);
    if (!(session == null ? void 0 : session.userId)) {
      return {
        ok: false,
        completedSuras: [],
        message: "Not authenticated"
      };
    }
    await getMongoose();
    const progress = await QuranProgressModel.findOne(
      { userId: session.userId },
      { completedSuras: 1, lastUpdated: 1 }
    ).lean();
    return {
      ok: true,
      completedSuras: (progress == null ? void 0 : progress.completedSuras) || [],
      lastUpdated: (progress == null ? void 0 : progress.lastUpdated) || null
    };
  } catch (error) {
    console.error("Failed to fetch Quran progress:", error);
    return {
      ok: false,
      completedSuras: [],
      error: (error == null ? void 0 : error.message) || "Failed to fetch progress"
    };
  }
});

export { progress_get as default };
//# sourceMappingURL=progress.get.mjs.map

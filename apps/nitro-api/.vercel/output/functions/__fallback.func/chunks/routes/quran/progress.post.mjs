import { d as defineEventHandler, r as readBody, g as getMongoose } from '../../nitro/nitro.mjs';
import { r as requireAuth } from '../../_/auth.mjs';
import { Q as QuranProgressModel } from '../../_/QuranProgress.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const progress_post = defineEventHandler(async (event) => {
  try {
    const { userId } = await requireAuth(event);
    const body = await readBody(event);
    const completedSuras = Array.isArray(body.completedSuras) ? body.completedSuras.filter((id) => typeof id === "number") : [];
    await getMongoose();
    const progress = await QuranProgressModel.findOneAndUpdate(
      { userId },
      { completedSuras, lastUpdated: /* @__PURE__ */ new Date() },
      { upsert: true, new: true }
    ).lean();
    return {
      ok: true,
      completedSuras: progress.completedSuras,
      lastUpdated: progress.lastUpdated
    };
  } catch (error) {
    if ((error == null ? void 0 : error.statusCode) === 401) {
      return {
        ok: false,
        authRequired: true,
        message: "Authentication required"
      };
    }
    console.error("Failed to save Quran progress:", error);
    return {
      ok: false,
      error: (error == null ? void 0 : error.message) || "Failed to save progress"
    };
  }
});

export { progress_post as default };
//# sourceMappingURL=progress.post.mjs.map

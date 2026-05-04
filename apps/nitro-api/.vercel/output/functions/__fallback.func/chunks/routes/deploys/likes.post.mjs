import { d as defineEventHandler, r as readBody, g as getMongoose } from '../../nitro/nitro.mjs';
import { D as DeployLikeModel } from '../../_/DeployLike.mjs';
import { r as requireAuth } from '../../_/auth.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const likes_post = defineEventHandler(async (event) => {
  try {
    const session = requireAuth(event);
    const userId = session.id;
    const body = await readBody(event);
    const { version } = body;
    if (!version || typeof version !== "string") {
      return {
        ok: false,
        error: "Version is required"
      };
    }
    await getMongoose();
    const existingLike = await DeployLikeModel.findOne({ version, userId }).lean();
    if (existingLike) {
      await DeployLikeModel.findByIdAndDelete(existingLike._id);
      const count = await DeployLikeModel.countDocuments({ version });
      return { ok: true, liked: false, count };
    } else {
      await DeployLikeModel.create({ version, userId });
      const count = await DeployLikeModel.countDocuments({ version });
      return {
        ok: true,
        liked: true,
        count
      };
    }
  } catch (err) {
    console.error("[Deploys Likes POST] Error:", err);
    if (err.statusCode === 401) {
      return {
        ok: false,
        error: "Authentication required",
        authRequired: true
      };
    }
    return {
      ok: false,
      error: (err == null ? void 0 : err.message) || "Failed to toggle like"
    };
  }
});

export { likes_post as default };
//# sourceMappingURL=likes.post.mjs.map

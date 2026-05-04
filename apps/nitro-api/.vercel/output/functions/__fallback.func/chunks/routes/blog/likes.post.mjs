import { d as defineEventHandler, r as readBody, g as getMongoose } from '../../nitro/nitro.mjs';
import { B as BlogLikeModel } from '../../_/BlogLike.mjs';
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
    const { slug } = body;
    if (!slug || typeof slug !== "string") {
      return {
        ok: false,
        error: "Slug is required"
      };
    }
    await getMongoose();
    const existingLike = await BlogLikeModel.findOne({ slug, userId }).lean();
    if (existingLike) {
      await BlogLikeModel.findByIdAndDelete(existingLike._id);
      const count = await BlogLikeModel.countDocuments({ slug });
      return {
        ok: true,
        liked: false,
        count
      };
    } else {
      await BlogLikeModel.create({ slug, userId });
      const count = await BlogLikeModel.countDocuments({ slug });
      return {
        ok: true,
        liked: true,
        count
      };
    }
  } catch (err) {
    console.error("[Blog Likes POST] Error:", err);
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

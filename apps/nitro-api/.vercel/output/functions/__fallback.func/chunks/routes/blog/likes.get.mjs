import { d as defineEventHandler, g as getMongoose } from '../../nitro/nitro.mjs';
import { B as BlogLikeModel } from '../../_/BlogLike.mjs';
import { a as readSession } from '../../_/auth.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const likes_get = defineEventHandler(async (event) => {
  try {
    await getMongoose();
    const session = readSession(event);
    const userId = session == null ? void 0 : session.id;
    const grouped = await BlogLikeModel.aggregate([
      { $group: { _id: "$slug", count: { $sum: 1 } } }
    ]);
    const likeCounts = grouped.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    let userLiked = [];
    if (userId) {
      const userLikes = await BlogLikeModel.find({ userId }, { slug: 1 }).lean();
      userLiked = userLikes.map((l) => l.slug);
    }
    return {
      ok: true,
      likeCounts,
      userLiked
    };
  } catch (err) {
    console.error("[Blog Likes GET] Error:", err);
    return {
      ok: false,
      error: (err == null ? void 0 : err.message) || "Failed to fetch likes"
    };
  }
});

export { likes_get as default };
//# sourceMappingURL=likes.get.mjs.map

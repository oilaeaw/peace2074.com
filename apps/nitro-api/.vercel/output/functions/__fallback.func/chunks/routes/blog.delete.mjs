import { d as defineEventHandler, b as getQuery, g as getMongoose, B as BlogPostModel } from '../nitro/nitro.mjs';
import { r as requireAuth } from '../_/auth.mjs';
import { d as deleteDatoCmsBlogPostBySlug } from '../_/datocms.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const blog_delete = defineEventHandler(async (event) => {
  const user = requireAuth(event);
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }
  try {
    const query = getQuery(event);
    const { slug } = query;
    if (!slug || typeof slug !== "string") {
      return { ok: false, error: "Missing slug parameter" };
    }
    const normalizedSlug = String(slug).trim();
    try {
      await getMongoose();
      await BlogPostModel.findOneAndDelete({ slug: normalizedSlug });
      let datocmsSynced = false;
      try {
        const datocmsDelete = await deleteDatoCmsBlogPostBySlug(normalizedSlug);
        datocmsSynced = !!datocmsDelete;
      } catch (err) {
        console.warn("[Blog DELETE] MongoDB delete succeeded but DatoCMS sync failed:", err instanceof Error ? err.message : "unknown");
      }
      return { ok: true, message: "Post deleted successfully", source: "mongodb", datocmsSynced };
    } catch (dbErr) {
      console.warn("[Blog DELETE] MongoDB delete failed, trying DatoCMS fallback:", dbErr instanceof Error ? dbErr.message : "unknown");
    }
    try {
      const datocmsDelete = await deleteDatoCmsBlogPostBySlug(normalizedSlug);
      if (datocmsDelete) {
        return { ok: true, message: "Post deleted successfully", source: "datocms-fallback" };
      }
    } catch (err) {
      console.warn("[Blog DELETE] DatoCMS fallback failed:", err instanceof Error ? err.message : "unknown");
    }
    return { ok: false, error: "Database not available" };
  } catch (err) {
    console.error("[Blog DELETE] Error:", err);
    return { ok: false, error: (err == null ? void 0 : err.message) || "Failed to delete post" };
  }
});

export { blog_delete as default };
//# sourceMappingURL=blog.delete.mjs.map

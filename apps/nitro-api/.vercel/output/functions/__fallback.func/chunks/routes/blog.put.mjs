import { d as defineEventHandler, r as readBody, g as getMongoose, B as BlogPostModel } from '../nitro/nitro.mjs';
import { r as requireAuth } from '../_/auth.mjs';
import { u as updateDatoCmsBlogPostBySlug } from '../_/datocms.mjs';
import { g as generateEmbedding, b as blogPostEmbeddingText } from '../_/embeddings.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const blog_put = defineEventHandler(async (event) => {
  const user = requireAuth(event);
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }
  try {
    const body = await readBody(event);
    const { slug, title, excerpt, content, tags } = body;
    if (!slug) {
      return { ok: false, error: "Missing slug parameter" };
    }
    const normalizedSlug = String(slug).trim();
    const updateTags = tags ? Array.isArray(tags) ? tags : [] : void 0;
    try {
      await getMongoose();
      const update = {};
      if (title) update.title = title;
      if (excerpt !== void 0) update.excerpt = excerpt;
      if (content) update.content = content;
      if (updateTags !== void 0) update.tags = updateTags;
      if (title || excerpt !== void 0 || content || updateTags !== void 0) {
        try {
          const current = await BlogPostModel.findOne({ slug: normalizedSlug }).lean();
          if (current) {
            update.embedding = await generateEmbedding(
              blogPostEmbeddingText({
                title: title != null ? title : current.title,
                excerpt: excerpt !== void 0 ? excerpt : current.excerpt,
                content: content != null ? content : current.content,
                tags: updateTags !== void 0 ? updateTags : current.tags
              })
            );
          }
        } catch (err) {
          console.warn("[Blog PUT] Embedding generation failed:", err instanceof Error ? err.message : "unknown");
        }
      }
      const result = await BlogPostModel.findOneAndUpdate(
        { slug: normalizedSlug },
        { $set: update },
        { new: true }
      ).lean();
      if (!result) {
        return { ok: false, error: "Post not found" };
      }
      let datocmsSynced = false;
      try {
        const datocmsPost = await updateDatoCmsBlogPostBySlug(normalizedSlug, {
          title,
          excerpt,
          content,
          tags: updateTags
        });
        datocmsSynced = !!datocmsPost;
      } catch (err) {
        console.warn("[Blog PUT] MongoDB update succeeded but DatoCMS sync failed:", err instanceof Error ? err.message : "unknown");
      }
      return { ok: true, post: result, source: "mongodb", datocmsSynced };
    } catch (dbErr) {
      console.warn("[Blog PUT] MongoDB update failed, trying DatoCMS fallback:", dbErr instanceof Error ? dbErr.message : "unknown");
    }
    try {
      const datocmsPost = await updateDatoCmsBlogPostBySlug(normalizedSlug, {
        title,
        excerpt,
        content,
        tags: updateTags
      });
      if (datocmsPost) {
        return { ok: true, post: datocmsPost, source: "datocms-fallback" };
      }
    } catch (err) {
      console.warn("[Blog PUT] DatoCMS fallback failed:", err instanceof Error ? err.message : "unknown");
    }
    return { ok: false, error: "Database not available" };
  } catch (err) {
    console.error("[Blog PUT] Error:", err);
    return { ok: false, error: (err == null ? void 0 : err.message) || "Failed to update post" };
  }
});

export { blog_put as default };
//# sourceMappingURL=blog.put.mjs.map

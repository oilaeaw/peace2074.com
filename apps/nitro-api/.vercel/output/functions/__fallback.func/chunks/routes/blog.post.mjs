import { d as defineEventHandler, r as readBody, g as getMongoose, B as BlogPostModel, v as sendBlogPostNotification } from '../nitro/nitro.mjs';
import { r as requireAuth } from '../_/auth.mjs';
import { c as createDatoCmsBlogPost } from '../_/datocms.mjs';
import { g as generateEmbedding, b as blogPostEmbeddingText } from '../_/embeddings.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

function toCanonicalSlug(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "-").replace(/-+/g, "-");
}
const blog_post = defineEventHandler(async (event) => {
  const user = requireAuth(event);
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }
  try {
    const body = await readBody(event);
    const { title, excerpt, content, tags, slug } = body;
    if (!title || !content || !slug) {
      return {
        ok: false,
        error: "Missing required fields: title, content, slug"
      };
    }
    const normalizedSlug = toCanonicalSlug(String(slug));
    const normalizedTitle = String(title).trim();
    const normalizedExcerpt = String(excerpt || "").trim();
    const normalizedTags = Array.isArray(tags) ? tags : [];
    const normalizedAuthor = user.name || user.id;
    const normalizedDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    if (!normalizedSlug) {
      return { ok: false, error: "Invalid slug value" };
    }
    try {
      await getMongoose();
      const existing = await BlogPostModel.findOne({ slug: normalizedSlug }).lean();
      if (existing) {
        return { ok: false, error: "A post with this slug already exists" };
      }
      let embedding = [];
      try {
        embedding = await generateEmbedding(
          blogPostEmbeddingText({
            title: normalizedTitle,
            excerpt: normalizedExcerpt,
            content,
            tags: normalizedTags
          })
        );
      } catch (err) {
        console.warn(
          "[Blog POST] Embedding generation failed:",
          err instanceof Error ? err.message : "unknown"
        );
      }
      const postDoc = await BlogPostModel.create({
        _id: normalizedSlug,
        slug: normalizedSlug,
        title: normalizedTitle,
        excerpt: normalizedExcerpt,
        content,
        tags: normalizedTags,
        date: normalizedDate,
        author: normalizedAuthor,
        embedding
      });
      const post = postDoc.toObject();
      let datocmsSynced = false;
      try {
        const datocmsPost = await createDatoCmsBlogPost({
          slug: normalizedSlug,
          title: normalizedTitle,
          excerpt: normalizedExcerpt,
          content,
          tags: normalizedTags,
          date: normalizedDate,
          author: normalizedAuthor
        });
        datocmsSynced = !!datocmsPost;
      } catch (err) {
        console.warn(
          "[Blog POST] MongoDB write succeeded but DatoCMS sync failed:",
          err instanceof Error ? err.message : "unknown"
        );
      }
      void sendBlogPostNotification({
        slug: normalizedSlug,
        title: normalizedTitle
      }).catch((err) => {
        console.error("[Blog] Failed to send push notifications:", err);
      });
      return {
        ok: true,
        post,
        source: "mongodb",
        datocmsSynced
      };
    } catch (dbErr) {
      console.warn("[Blog POST] MongoDB write failed, trying DatoCMS fallback:", dbErr instanceof Error ? dbErr.message : "unknown");
    }
    try {
      const datocmsPost = await createDatoCmsBlogPost({
        slug: normalizedSlug,
        title: normalizedTitle,
        excerpt: normalizedExcerpt,
        content,
        tags: normalizedTags,
        date: normalizedDate,
        author: normalizedAuthor
      });
      if (datocmsPost) {
        return {
          ok: true,
          post: datocmsPost,
          source: "datocms-fallback"
        };
      }
    } catch (err) {
      console.warn(
        "[Blog POST] DatoCMS fallback failed:",
        err instanceof Error ? err.message : "unknown"
      );
    }
    return { ok: false, error: "Database not available" };
  } catch (err) {
    console.error("[Blog POST] Error:", err);
    return { ok: false, error: (err == null ? void 0 : err.message) || "Failed to create post" };
  }
});

export { blog_post as default };
//# sourceMappingURL=blog.post.mjs.map

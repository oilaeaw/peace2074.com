import { d as defineEventHandler, b as getQuery, g as getMongoose, B as BlogPostModel } from '../nitro/nitro.mjs';
import blogSeedData from '../_/blog-seed.mjs';
import { f as fetchDatoCmsBlogPosts } from '../_/datocms.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

function buildSlugVariants(slug) {
  const raw = String(slug || "").trim();
  if (!raw) return [];
  const variants = /* @__PURE__ */ new Set([
    raw,
    raw.toLowerCase(),
    raw.replace(/\s+/g, "-"),
    raw.toLowerCase().replace(/\s+/g, "-"),
    raw.replace(/-/g, " "),
    raw.toLowerCase().replace(/-/g, " "),
    `${raw} `,
    `${raw.toLowerCase()} `
  ]);
  return [...variants].filter(Boolean);
}
function toCanonicalSlug(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "-").replace(/-+/g, "-");
}
function toPublicSeedPost(post) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    tags: post.tags,
    date: post.date,
    author: post.author,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  };
}
function loadSeedPosts() {
  try {
    return Array.isArray(blogSeedData) ? blogSeedData.map(toPublicSeedPost) : [];
  } catch (error) {
    console.warn("[Blog GET] Seed fallback load failed:", error instanceof Error ? error.message : "unknown");
    return [];
  }
}
const blog_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { slug } = query;
  const fallbackPosts = loadSeedPosts();
  const normalizedSlug = typeof slug === "string" ? slug.trim() : void 0;
  const slugVariants = buildSlugVariants(normalizedSlug);
  try {
    try {
      await getMongoose();
      if (normalizedSlug) {
        let post = await BlogPostModel.findOne({ slug: normalizedSlug }).lean();
        if (!post && slugVariants.length) {
          post = await BlogPostModel.findOne({ slug: { $in: slugVariants } }).lean();
        }
        if (post) {
          return {
            ok: true,
            post,
            source: "mongodb",
            canonicalSlug: toCanonicalSlug(post == null ? void 0 : post.slug)
          };
        }
      }
      const posts = await BlogPostModel.find().sort({ date: -1 }).lean();
      if (!normalizedSlug && posts.length) {
        return { ok: true, posts, source: "mongodb" };
      }
    } catch (error) {
      console.warn("[Blog GET] MongoDB read failed, falling back:", error instanceof Error ? error.message : "unknown");
    }
    try {
      if (normalizedSlug) {
        const candidateSlugs = slugVariants.length ? slugVariants : [normalizedSlug];
        for (const candidate of candidateSlugs) {
          const datocmsPost = await fetchDatoCmsBlogPosts({ slug: candidate });
          if (datocmsPost) {
            return {
              ok: true,
              post: datocmsPost,
              source: "datocms",
              canonicalSlug: toCanonicalSlug(datocmsPost == null ? void 0 : datocmsPost.slug)
            };
          }
        }
      } else {
        const datocmsPosts = await fetchDatoCmsBlogPosts();
        if (Array.isArray(datocmsPosts) && datocmsPosts.length) {
          return { ok: true, posts: datocmsPosts, source: "datocms" };
        }
      }
    } catch (error) {
      console.warn("[Blog GET] DatoCMS read failed, falling back:", error instanceof Error ? error.message : "unknown");
    }
    if (normalizedSlug) {
      const fallbackPost = fallbackPosts.find((post) => {
        const postSlug = String((post == null ? void 0 : post.slug) || "");
        return slugVariants.includes(postSlug) || slugVariants.includes(postSlug.trim());
      });
      if (!fallbackPost) {
        return { ok: false, error: "Post not found" };
      }
      return {
        ok: true,
        post: fallbackPost,
        source: "seed-fallback",
        canonicalSlug: toCanonicalSlug(fallbackPost == null ? void 0 : fallbackPost.slug)
      };
    }
    if (fallbackPosts.length) {
      const sortedFallback = [...fallbackPosts].sort((a, b) => {
        const ad = new Date(String((a == null ? void 0 : a.date) || (a == null ? void 0 : a.createdAt) || 0)).getTime();
        const bd = new Date(String((b == null ? void 0 : b.date) || (b == null ? void 0 : b.createdAt) || 0)).getTime();
        return bd - ad;
      });
      return { ok: true, posts: sortedFallback, source: "seed-fallback" };
    }
    return { ok: true, posts: [], source: "empty" };
  } catch (err) {
    console.error("[Blog GET] Error:", err);
    return { ok: false, error: (err == null ? void 0 : err.message) || "Failed to fetch posts" };
  }
});

export { blog_get as default };
//# sourceMappingURL=blog.get.mjs.map

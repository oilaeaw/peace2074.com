import { d as defineEventHandler, r as readBody, g as getMongoose } from '../../nitro/nitro.mjs';
import { g as generateEmbedding } from '../../_/embeddings.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const search_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { query, limit = 5, tags } = body;
    if (!(query == null ? void 0 : query.trim())) {
      return { ok: false, error: "Missing query" };
    }
    const conn = await getMongoose();
    const queryEmbedding = await generateEmbedding(query.trim());
    const pipeline = [
      {
        $vectorSearch: {
          index: "blog_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: Math.min(limit * 10, 150),
          limit,
          ...(tags == null ? void 0 : tags.length) ? { filter: { tags: { $in: tags } } } : {}
        }
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          slug: 1,
          title: 1,
          excerpt: 1,
          tags: 1,
          date: 1,
          author: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ];
    const results = await conn.connection.db.collection("BlogPost").aggregate(pipeline).toArray();
    return {
      ok: true,
      results
    };
  } catch (err) {
    console.error("[Blog Search] Error:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Search failed" };
  }
});

export { search_post as default };
//# sourceMappingURL=search.post.mjs.map

const DATOCMS_CMA_BASE_URL = "https://site-api.datocms.com";
const DATOCMS_API_VERSION = "3";
function getDatoCmsToken() {
  const token = String(process.env.DATOCMS_API_TOKEN || "").trim();
  if (!token || token.startsWith("http://") || token.startsWith("https://")) {
    return null;
  }
  return token;
}
function getDatoCmsBlogModelApiKey() {
  return String(process.env.DATOCMS_BLOG_ITEM_TYPE_API_KEY || "blog_post").trim();
}
function getHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "X-Api-Version": DATOCMS_API_VERSION
  };
}
function normalizeDate(raw) {
  const value = String(raw || "").trim();
  if (!value) {
    return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}
function mapItemToBlogPost(item) {
  const attrs = (item == null ? void 0 : item.attributes) || {};
  const slug = String(attrs.slug || attrs.api_key || (item == null ? void 0 : item.id) || "").trim();
  const title = String(attrs.title || attrs.name || slug || "Untitled").trim();
  const excerpt = String(attrs.excerpt || attrs.summary || "").trim();
  const content = String(attrs.content || attrs.body || attrs.markdown || attrs.rich_text || "").trim();
  const tags = Array.isArray(attrs.tags) ? attrs.tags.map((tag) => String(tag)).filter(Boolean) : typeof attrs.tags === "string" ? attrs.tags.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const date = normalizeDate(attrs.date || attrs.published_at || attrs.created_at);
  const author = String(attrs.author || attrs.author_name || "peace2074").trim();
  return {
    id: String((item == null ? void 0 : item.id) || slug || title),
    slug,
    title,
    excerpt,
    content,
    tags,
    date,
    author
  };
}
function toDatoCmsAttributes(input) {
  const attributes = {};
  if (input.slug !== void 0) attributes.slug = String(input.slug).trim();
  if (input.title !== void 0) attributes.title = String(input.title).trim();
  if (input.excerpt !== void 0) attributes.excerpt = String(input.excerpt || "").trim();
  if (input.content !== void 0) attributes.content = String(input.content || "");
  if (input.tags !== void 0) attributes.tags = Array.isArray(input.tags) ? input.tags : [];
  if (input.date !== void 0) attributes.date = normalizeDate(input.date);
  if (input.author !== void 0) attributes.author = String(input.author || "peace2074").trim();
  return attributes;
}
async function fetchItemTypeId(apiToken, itemTypeApiKey) {
  var _a, _b;
  const params = new URLSearchParams();
  params.set("filter[fields][api_key][eq]", itemTypeApiKey);
  params.set("page[limit]", "1");
  const response = await fetch(`${DATOCMS_CMA_BASE_URL}/item-types?${params.toString()}`, {
    method: "GET",
    headers: getHeaders(apiToken)
  });
  if (!response.ok) {
    throw new Error(`Failed to resolve DatoCMS model: HTTP ${response.status}`);
  }
  const payload = await response.json();
  const itemTypeId = (_b = (_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a[0]) == null ? void 0 : _b.id;
  if (!itemTypeId) {
    throw new Error(`DatoCMS model '${itemTypeApiKey}' not found`);
  }
  return itemTypeId;
}
async function fetchRawDatoCmsItemBySlug(apiToken, itemTypeId, slug) {
  const params = new URLSearchParams();
  params.set("filter[type][eq]", itemTypeId);
  params.set("filter[fields][slug][eq]", slug);
  params.set("page[limit]", "1");
  const response = await fetch(`${DATOCMS_CMA_BASE_URL}/items?${params.toString()}`, {
    method: "GET",
    headers: getHeaders(apiToken)
  });
  if (!response.ok) {
    throw new Error(`Failed to query DatoCMS post by slug: HTTP ${response.status}`);
  }
  const payload = await response.json();
  const item = Array.isArray(payload == null ? void 0 : payload.data) ? payload.data[0] : void 0;
  return item || null;
}
async function fetchDatoCmsBlogPosts(options = {}) {
  const token = getDatoCmsToken();
  if (!token) {
    return null;
  }
  const modelApiKey = getDatoCmsBlogModelApiKey();
  const itemTypeId = await fetchItemTypeId(token, modelApiKey);
  const params = new URLSearchParams();
  params.set("filter[type][eq]", itemTypeId);
  params.set("page[limit]", options.slug ? "1" : "100");
  params.set("order_by", "_updated_at_DESC");
  if (options.slug) {
    params.set("filter[fields][slug][eq]", options.slug);
  }
  const response = await fetch(`${DATOCMS_CMA_BASE_URL}/items?${params.toString()}`, {
    method: "GET",
    headers: getHeaders(token)
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch DatoCMS posts: HTTP ${response.status}`);
  }
  const payload = await response.json();
  const mapped = Array.isArray(payload == null ? void 0 : payload.data) ? payload.data.map(mapItemToBlogPost) : [];
  if (options.slug) {
    return mapped.find((p) => p.slug === options.slug) || null;
  }
  return mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
async function createDatoCmsBlogPost(input) {
  const token = getDatoCmsToken();
  if (!token) {
    return null;
  }
  const modelApiKey = getDatoCmsBlogModelApiKey();
  const itemTypeId = await fetchItemTypeId(token, modelApiKey);
  const attributes = toDatoCmsAttributes({
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    tags: input.tags,
    date: input.date,
    author: input.author
  });
  const body = {
    data: {
      type: "item",
      attributes,
      relationships: {
        item_type: {
          data: {
            type: "item_type",
            id: itemTypeId
          }
        }
      }
    }
  };
  const response = await fetch(`${DATOCMS_CMA_BASE_URL}/items`, {
    method: "POST",
    headers: {
      ...getHeaders(token),
      "Content-Type": "application/vnd.api+json"
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`Failed to create DatoCMS post: HTTP ${response.status}`);
  }
  const payload = await response.json();
  const created = payload == null ? void 0 : payload.data;
  if (!created) {
    throw new Error("DatoCMS create returned empty payload");
  }
  return mapItemToBlogPost(created);
}
async function updateDatoCmsBlogPostBySlug(slug, update) {
  const token = getDatoCmsToken();
  if (!token) {
    return null;
  }
  const modelApiKey = getDatoCmsBlogModelApiKey();
  const itemTypeId = await fetchItemTypeId(token, modelApiKey);
  const existing = await fetchRawDatoCmsItemBySlug(token, itemTypeId, slug);
  if (!(existing == null ? void 0 : existing.id)) {
    throw new Error("Post not found");
  }
  const attributes = toDatoCmsAttributes(update);
  const response = await fetch(`${DATOCMS_CMA_BASE_URL}/items/${existing.id}`, {
    method: "PUT",
    headers: {
      ...getHeaders(token),
      "Content-Type": "application/vnd.api+json"
    },
    body: JSON.stringify({
      data: {
        id: existing.id,
        type: "item",
        attributes
      }
    })
  });
  if (!response.ok) {
    throw new Error(`Failed to update DatoCMS post: HTTP ${response.status}`);
  }
  const payload = await response.json();
  const updated = payload == null ? void 0 : payload.data;
  if (!updated) {
    throw new Error("DatoCMS update returned empty payload");
  }
  return mapItemToBlogPost(updated);
}
async function deleteDatoCmsBlogPostBySlug(slug) {
  const token = getDatoCmsToken();
  if (!token) {
    return null;
  }
  const modelApiKey = getDatoCmsBlogModelApiKey();
  const itemTypeId = await fetchItemTypeId(token, modelApiKey);
  const existing = await fetchRawDatoCmsItemBySlug(token, itemTypeId, slug);
  if (!(existing == null ? void 0 : existing.id)) {
    throw new Error("Post not found");
  }
  const response = await fetch(`${DATOCMS_CMA_BASE_URL}/items/${existing.id}`, {
    method: "DELETE",
    headers: getHeaders(token)
  });
  if (!response.ok) {
    throw new Error(`Failed to delete DatoCMS post: HTTP ${response.status}`);
  }
  return { ok: true };
}

export { createDatoCmsBlogPost as c, deleteDatoCmsBlogPostBySlug as d, fetchDatoCmsBlogPosts as f, updateDatoCmsBlogPostBySlug as u };
//# sourceMappingURL=datocms.mjs.map

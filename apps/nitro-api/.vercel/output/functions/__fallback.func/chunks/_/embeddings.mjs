const COHERE_EMBEDDING_MODEL = "embed-multilingual-v3.0";
async function generateEmbedding(text) {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error("COHERE_API_KEY is not set");
  const response = await fetch("https://api.cohere.com/v2/embed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: COHERE_EMBEDDING_MODEL,
      texts: [text],
      input_type: "search_document",
      embedding_types: ["float"]
    })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cohere embeddings error: ${response.status} ${err}`);
  }
  const data = await response.json();
  return data.embeddings.float[0];
}
function blogPostEmbeddingText(post) {
  var _a;
  return [post.title, (_a = post.excerpt) != null ? _a : "", post.tags.join(" "), post.content.slice(0, 2e3)].filter(Boolean).join("\n");
}

export { blogPostEmbeddingText as b, generateEmbedding as g };
//# sourceMappingURL=embeddings.mjs.map

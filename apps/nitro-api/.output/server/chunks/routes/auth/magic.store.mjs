const pendingLinks = /* @__PURE__ */ new Map();
function cleanExpiredLinks() {
  const now = Date.now();
  for (const [token, entry] of pendingLinks.entries()) {
    if (entry.exp <= now) pendingLinks.delete(token);
  }
}

export { cleanExpiredLinks, pendingLinks };
//# sourceMappingURL=magic.store.mjs.map

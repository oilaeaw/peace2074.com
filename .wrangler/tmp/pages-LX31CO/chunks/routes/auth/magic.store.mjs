const e=new Map;function cleanExpiredLinks(){const n=Date.now();for(const[o,t]of e.entries())t.exp<=n&&e.delete(o)}export{cleanExpiredLinks,e as pendingLinks};
//# sourceMappingURL=magic.store.mjs.map

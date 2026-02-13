import { defineStore } from "pinia";

type BookmarkItem = { _id?: string; bookmark: string };

export const useBookmarksStore = defineStore("bookmarks", {
    state: () => ({
        bookmarks: [] as (string | BookmarkItem)[],
    }),
    actions: {
        init() {
            try {
                const raw = localStorage.getItem("bookmarks");
                this.bookmarks = raw ? JSON.parse(raw) : [];
            } catch { }
        },
        persist() {
            try {
                localStorage.setItem("bookmarks", JSON.stringify(this.bookmarks));
            } catch { }
        },
        createBookmark(bm: string) {
            if (!bm) return;
            const id = `id_${bm.replace(/^id_/, "")}`;
            if (!this.bookmarks.find((b) => (typeof b === "string" ? b : b.bookmark) === id)) {
                this.bookmarks.push(id);
                this.persist();
            }
        },
        deleteBookmark(bm: string) {
            const id = bm.replace(/^id_/, "id_");
            this.bookmarks = this.bookmarks.filter((b) =>
                typeof b === "string" ? b !== id : b.bookmark !== id
            );
            this.persist();
        },
    },
});

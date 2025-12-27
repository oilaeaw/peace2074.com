import { computed, ref } from "vue";
import i18n from "@/i18n";
import chaptersEn from "@/shared/data/chapters/en.json";
import chaptersRu from "@/shared/data/chapters/ru.json";

export type SearchResult = {
    id: string | number;
    title: string;
    subtitle?: string;
    path: string;
    type: "page" | "sura" | "ayah" | "verse";
};

const chaptersByLocale: Record<string, typeof chaptersEn> = {
    en: chaptersEn,
    ru: chaptersRu,
};

const basePages = [
    {
        id: "home",
        path: "/",
        titleKey: "pages.home.title",
        subtitleKey: "pages.home.hero.lead",
    },
    {
        id: "quran",
        path: "/quran",
        titleKey: "pages.quran.pageTitle",
        subtitleKey: "pages.quran.detail",
    },
    {
        id: "tasbeeh",
        path: "/tasbeeh",
        titleKey: "pages.tasbeeh",
        subtitleKey: "pages.tasbeeh",
    },
    {
        id: "contact",
        path: "/contact",
        titleKey: "appShell.nav.contact",
        subtitleKey: "contact.help",
    },
];

function normalizeLocale(locale?: string) {
    if (!locale) return "en";
    const short = locale.split("-")[0];
    if (chaptersByLocale[short]) return short;
    return "en";
}

function buildItems(locale: string): SearchResult[] {
    const loc = normalizeLocale(locale);
    const t = i18n.global.t;

    const pages: SearchResult[] = basePages.map((p) => ({
        id: `page-${p.id}`,
        title: t(p.titleKey) as string,
        subtitle: t(p.subtitleKey) as string,
        path: p.path,
        type: "page",
    }));

    const chapters = chaptersByLocale[loc] ?? chaptersByLocale.en;
    const suras: SearchResult[] = chapters.map((c) => ({
        id: c.id,
        title: `${c.id}. ${c.transliteration || c.translation || c.name}`,
        subtitle: c.translation || c.name,
        path: `/quran/${c.id}`,
        type: "sura",
    }));

    return [...pages, ...suras];
}

export function useSiteSearch(localeRef: { value: string }) {
    const cache = new Map<string, SearchResult[]>();
    const results = ref<SearchResult[]>([]);
    let controller: AbortController | null = null;

    const items = computed(() => {
        const loc = normalizeLocale(localeRef.value);
        if (!cache.has(loc)) {
            cache.set(loc, buildItems(loc));
        }
        return cache.get(loc) || [];
    });

    function localSearch(q: string): SearchResult[] {
        const query = q.trim().toLowerCase();
        if (!query) return [];
        return (items.value || [])
            .filter((item) => {
                const hay = `${item.title} ${item.subtitle || ""}`.toLowerCase();
                return hay.includes(query);
            })
            .slice(0, 10);
    }

    async function remoteSearch(q: string) {
        if (typeof fetch === "undefined") return;
        if (!q.trim()) return;
        controller?.abort();
        controller = new AbortController();
        try {
            const lang = normalizeLocale(localeRef.value);
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=20&lang=${lang}`, {
                signal: controller.signal,
            });
            if (!res.ok) return;
            const data = await res.json();
            const remote: SearchResult[] = Array.isArray(data?.results) ? data.results : [];
            const combined = dedupe([...localSearch(q), ...remote]);
            results.value = combined;
        } catch (e: any) {
            if (e?.name === "AbortError") return;
        }
    }

    function dedupe(list: SearchResult[]): SearchResult[] {
        const seen = new Set<string>();
        const out: SearchResult[] = [];
        for (const item of list) {
            const key = `${item.type}-${item.id}`;
            if (seen.has(key)) continue;
            seen.add(key);
            out.push(item);
            if (out.length >= 20) break;
        }
        return out;
    }

    function search(query: string): SearchResult[] {
        const local = localSearch(query || "");
        results.value = local;
        // Fire-and-forget remote enrichment
        void remoteSearch(query || "");
        return results.value;
    }

    return {
        results,
        search,
    };
}

export default useSiteSearch;

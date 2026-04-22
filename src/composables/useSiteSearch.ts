import { computed, ref } from "vue";
import i18n from "@/i18n";
import chaptersEn from "@/shared/data/chapters/en.json";
import chaptersEs from "@/shared/data/chapters/es.json";
import chaptersRu from "@/shared/data/chapters/ru.json";
import chaptersTr from "@/shared/data/chapters/tr.json";
import chaptersDe from "@/shared/data/chapters/de.json";
import chaptersHe from "@/shared/data/chapters/he.json";

export type SearchResult = {
    id: string | number;
    title: string;
    subtitle?: string;
    path: string;
    type: "page" | "sura" | "ayah" | "verse";
};

const chaptersByLocale: Record<string, typeof chaptersEn> = {
    en: chaptersEn,
    es: chaptersEs,
    ru: chaptersRu,
    tr: chaptersTr,
    de: chaptersDe,
    he: chaptersHe,
    ar: chaptersEn, // Arabic sura names are in the 'name' field of all chapter files
    it: chaptersEn, // Italian fallback to English
};

const basePages = [
    {
        id: "home",
        path: "/",
        titleKey: "pages.home.title",
        subtitleKey: "pages.home.hero.lead",
    },
    {
        id: "about",
        path: "/about",
        titleKey: "pages.about.title",
        subtitleKey: "pages.about.hero.lead",
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

// Quick access popular verses (searchable)
const quickAccessVerses = [
    {
        id: "2_255",
        suraId: 2,
        verse: 255,
        titleKey: "pages.quran.quickAccess.kursi",
        searchTerms: ["kursi", "throne", "ayat al-kursi", "الكرسي"],
    },
    {
        id: "1_1",
        suraId: 1,
        verse: 1,
        titleKey: "pages.quran.quickAccess.fatiha",
        searchTerms: ["fatiha", "opening", "al-fatiha", "الفاتحة"],
    },
    {
        id: "36_1",
        suraId: 36,
        verse: 1,
        titleKey: "pages.quran.quickAccess.yasin",
        searchTerms: ["yasin", "ya-sin", "yaseen", "يس"],
    },
    {
        id: "67_1",
        suraId: 67,
        verse: 1,
        titleKey: "pages.quran.quickAccess.mulk",
        searchTerms: ["mulk", "sovereignty", "al-mulk", "الملك"],
    },
    {
        id: "112_1",
        suraId: 112,
        verse: 1,
        titleKey: "pages.quran.quickAccess.ikhlas",
        searchTerms: ["ikhlas", "sincerity", "al-ikhlas", "الإخلاص"],
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
        title: `${c.id}. ${loc === 'ar' ? c.name : (c.transliteration || c.translation || c.name)}`,
        subtitle: loc === 'ar' ? c.transliteration || c.translation : (c.translation || c.name),
        path: `/quran/${c.id}`,
        type: "sura",
        // Always include the original Arabic name so queries in any language can match
        searchTerms: [c.name],
    } as SearchResult & { searchTerms: string[] }));

    // Add quick access verses to search
    const verses: SearchResult[] = quickAccessVerses.map((v) => ({
        id: v.id,
        title: t(v.titleKey) as string,
        subtitle: `${v.suraId}:${v.verse}`,
        path: `/quran/${v.suraId}#${v.id}`,
        type: "verse",
        // Store search terms for better matching
        searchTerms: v.searchTerms,
    } as SearchResult & { searchTerms: string[] }));

    return [...pages, ...verses, ...suras];
}

export function useSiteSearch(localeRef: { value: string }) {
    const cache = new Map<string, SearchResult[]>();
    const results = ref<SearchResult[]>([]);
    const loading = ref(false);
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
                const haystack = `${item.title} ${item.subtitle || ""}`.toLowerCase();
                // Check if item has additional search terms
                const extraTerms = (item as any).searchTerms
                    ? (item as any).searchTerms.join(" ").toLowerCase()
                    : "";
                const fullHaystack = `${haystack} ${extraTerms}`;
                return fullHaystack.includes(query);
            })
            .slice(0, 10);
    }

    async function remoteSearch(q: string) {
        if (typeof fetch === "undefined") return;
        if (!q.trim()) return;
        controller?.abort();
        controller = new AbortController();
        loading.value = true;
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
        } finally {
            loading.value = false;
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
        loading,
        search,
    };
}

export default useSiteSearch;

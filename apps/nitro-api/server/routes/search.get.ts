import { defineEventHandler, getQuery } from "h3";
import { useStorage } from "#imports";

const chapterFiles: Record<string, string> = {
    en: "en.json",
    ru: "ru.json",
    ar: "ar.json",
    de: "en.json",
    he: "en.json",
};

const chapterCache = new Map<string, any[]>();
let quranCache: Record<string, any[]> | null = null;

function normalizeText(str: string) {
    const noHarakat = str
        // Remove Arabic diacritics / tatweel
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
        // Normalize Arabic hamza forms
        .replace(/[\u0622\u0623\u0624\u0625\u0626]/g, "ا")
        // Keep letters/numbers/spaces; drop most punctuation
        .replace(/[^\p{L}\p{N}\s]/gu, " ");
    return noHarakat.toLowerCase().trim();
}

function normalizeLang(lang?: string) {
    if (!lang) return "en";
    const short = String(lang).toLowerCase().split("-")[0];
    if (chapterFiles[short]) return short;
    return "en";
}

async function ensureQuran() {
    if (quranCache) return;
    const storage = useStorage("assets:quran");
    quranCache = await storage.getItem<Record<string, any[]>>("quran.json") || {};
}

async function ensureChapters(lang: string) {
    const loc = normalizeLang(lang);
    if (chapterCache.has(loc)) return;

    const storage = useStorage("assets:quran");
    const file = chapterFiles[loc] || chapterFiles.en;

    try {
        const data = await storage.getItem<any[]>(`chapters/${file}`) || [];
        chapterCache.set(loc, data);
    } catch (e) {
        // Fallback to English if load fails
        if (!chapterCache.has("en")) {
            const fallback = await storage.getItem<any[]>("chapters/en.json") || [];
            chapterCache.set("en", fallback);
        }
        if (loc !== "en") {
            chapterCache.set(loc, chapterCache.get("en") || []);
        }
    }
}

export default defineEventHandler(async (event) => {
    const { q = "", limit = "20", lang = "en" } = getQuery(event);
    const rawQuery = String(q || "");
    const query = rawQuery.trim().toLowerCase();
    const normQuery = normalizeText(rawQuery);
    const max = Math.min(50, Math.max(1, Number(limit) || 20));

    if (!query) return { results: [] };

    const loc = normalizeLang(String(lang));
    await Promise.all([ensureChapters(loc), ensureQuran()]);

    const chapters = chapterCache.get(loc) || chapterCache.get("en") || [];
    const quran = quranCache || {};

    const results: any[] = [];

    // Match surah names/translations
    for (const c of chapters) {
        const name = String(c.name || "");
        const transliteration = String(c.transliteration || "");
        const translation = String(c.translation || "");
        const hay = `${name} ${transliteration} ${translation}`.toLowerCase();
        const hayNorm = normalizeText(`${name} ${transliteration} ${translation}`);
        if (hay.includes(query) || (normQuery && hayNorm.includes(normQuery))) {
            results.push({
                type: "sura",
                id: c.id,
                title: `${c.id}. ${transliteration || translation || name}`.trim(),
                subtitle: translation || name,
                path: `/quran/${c.id}`,
            });
        }
        if (results.length >= max) break;
    }

    // Match verses (light scan; stop at limit)
    outer: for (const [suraId, verses] of Object.entries(quran)) {
        for (const verse of verses || []) {
            const text = String(verse.text || "");
            const hay = text.toLowerCase();
            const hayNorm = normalizeText(text);
            if (hay.includes(query) || (normQuery && hayNorm.includes(normQuery))) {
                const id = `${suraId}:${verse.verse || ""}`;
                results.push({
                    type: "verse",
                    id,
                    title: `Ayah ${id}`,
                    subtitle: text.slice(0, 140),
                    path: `/quran/${suraId}#verse-${verse.verse || ""}`,
                });
                if (results.length >= max) break outer;
            }
        }
    }

    return { results: results.slice(0, max) };
});

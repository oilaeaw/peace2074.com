import { defineEventHandler, getQuery } from "h3";
import chaptersEn from '../../../../src/shared/data/chapters/en.json';
import chaptersRu from '../../../../src/shared/data/chapters/ru.json';
import chaptersDe from '../../../../src/shared/data/chapters/de.json';
import chaptersHe from '../../../../src/shared/data/chapters/he.json';
import chaptersEs from '../../../../src/shared/data/chapters/es.json';
import chaptersTr from '../../../../src/shared/data/chapters/tr.json';
import { getDb } from '../utils/realdb';
import { loadQuranData } from '../utils/quran-data';

const chaptersMap: Record<string, any[]> = {
    en: chaptersEn as any[], ru: chaptersRu as any[], de: chaptersDe as any[],
    he: chaptersHe as any[], es: chaptersEs as any[], tr: chaptersTr as any[],
    ar: chaptersEn as any[], it: chaptersEn as any[],
};

function normalizeText(str: string) {
    return str
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
        .replace(/[\u0622\u0623\u0624\u0625\u0626]/g, "ا")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .toLowerCase().trim();
}

function normalizeLang(lang?: string) {
    if (!lang) return "en";
    const short = String(lang).toLowerCase().split("-")[0];
    return chaptersMap[short] ? short : "en";
}

export default defineEventHandler(async (event) => {
    const { q = "", limit = "20", lang = "en" } = getQuery(event);
    const rawQuery = String(q || "");
    const query = rawQuery.trim().toLowerCase();
    const normQuery = normalizeText(rawQuery);
    const max = Math.min(50, Math.max(1, Number(limit) || 20));

    if (!query) return { results: [] };

    const loc = normalizeLang(String(lang));
    const chapters = chaptersMap[loc] || chaptersMap.en;
    const results: any[] = [];

    // Match surah names
    for (const c of chapters) {
        const name = String(c.name || "");
        const transliteration = String(c.transliteration || "");
        const translation = String(c.translation || "");
        const hay = `${name} ${transliteration} ${translation}`.toLowerCase();
        const hayNorm = normalizeText(`${name} ${transliteration} ${translation}`);
        if (hay.includes(query) || (normQuery && hayNorm.includes(normQuery))) {
            results.push({
                type: "sura", id: c.id,
                title: `${c.id}. ${transliteration || translation || name}`.trim(),
                subtitle: translation || name,
                path: `/quran/${c.id}`,
            });
        }
        if (results.length >= max) break;
    }

    // Match verses
    try {
        const quran = await loadQuranData(event);
        outer: for (const [suraId, verses] of Object.entries(quran)) {
            for (const verse of (verses as any[]) || []) {
                const text = String(verse.text || "");
                const hay = text.toLowerCase();
                const hayNorm = normalizeText(text);
                if (hay.includes(query) || (normQuery && hayNorm.includes(normQuery))) {
                    const id = `${suraId}:${verse.verse || ""}`;
                    results.push({
                        type: "verse", id,
                        title: `Ayah ${id}`,
                        subtitle: text.slice(0, 140),
                        path: `/quran/${suraId}#${suraId}_${verse.verse || ""}`,
                    });
                    if (results.length >= max) break outer;
                }
            }
        }
    } catch { /* verse search is best-effort */ }

    // Search blog posts
    try {
        const db = await getDb();
        const blogPosts = db.collection('blogPosts');
        const all = await blogPosts.findAll() as any[];
        const lq = rawQuery.toLowerCase();
        const matched = all.filter((p) =>
            String(p.title || '').toLowerCase().includes(lq) ||
            String(p.excerpt || '').toLowerCase().includes(lq)
        ).slice(0, 5);

        for (const post of matched) {
            results.push({
                type: 'page',
                id: `blog-${post.slug}`,
                title: post.title,
                subtitle: post.excerpt || (post.tags || []).join(', '),
                path: `/blog/${post.slug}`,
            });
            if (results.length >= max) break;
        }
    } catch { /* blog search is best-effort */ }

    return { results: results.slice(0, max) };
});

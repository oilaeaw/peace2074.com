<!-- eslint-disable unused-imports/no-unused-vars -->
<script lang="ts" setup>
definePageMeta({
  // Set `auth` to `false` to make this page public.
  // Remove this block to protect the page.
  auth: false,
});

import { useQuasar } from "quasar";
import { isClient } from '@vueuse/core'
import { useQ2P } from '~/store/q2p.pinia'
import { useBookmarksStore } from "~/store/bookmarks.pinia";

const { t } = useI18n();
const appName = computed(() => t("general.SiteTitle"));
const route = useRoute();
const lok = ref(0); // Initialize with default value

// Extract the sura number from route params - handle both array and single value
function getLokFromRoute() {
  const param = (route.params as any)?.lok;
  console.warn(
    "Route param lok:",
    param,
    "Type:",
    typeof param,
    "IsArray:",
    Array.isArray(param)
  );
  if (Array.isArray(param)) {
    // If it's an array, take the first element
    const result = Number(param[0]) || 1;
    console.warn("Extracted from array:", result);
    return result;
  }
  const result = Number(param) || 1;
  console.warn("Extracted directly:", result);
  return result;
}
const q2p = useQ2P()
const $q = useQuasar()
const Quran = computed(() => q2p.Book);
const sura = computed(() => q2p.currentSura);
const PageTite = computed(
  () => `${appName.value} - ${sura.value?.id || ""}:${sura.value?.name || ""}`
);
const router = useRouter();
const bookmarksStore = useBookmarksStore();
const showBookmarks = ref(true);
const targetInput = ref("");
const selectedBookmark = ref("");

function normalizeBookmarkId(bm: any) {
  const bookmarkStr = typeof bm === "string" ? bm : bm?.bookmark || "";
  if (!bookmarkStr) return "";
  return bookmarkStr.startsWith("id_") ? bookmarkStr : `id_${bookmarkStr}`;
}

function isBookmarkSelected(bm: any) {
  return normalizeBookmarkId(bm) === selectedBookmark.value;
}

function deleteBookmarkItem(bm: any) {
  // Pass the bookmark string for deletion
  const bookmarkStr = typeof bm === "string" ? bm : bm?.bookmark || "";
  if (bookmarkStr) {
    bookmarksStore.deleteBookmark(bookmarkStr);
    if (isBookmarkSelected(bm)) selectedBookmark.value = "";
  }
}

function formatBookmarkLabel(bm: any) {
  // bm can be a string or a bookmark object - get the bookmark string
  const bookmarkStr = typeof bm === "string" ? bm : bm?.bookmark || "";
  if (!bookmarkStr) return bookmarkStr;
  const normalized = bookmarkStr.startsWith("id_") ? bookmarkStr.slice(3) : bookmarkStr;
  const parts = normalized.split("_");
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  return bookmarkStr;
}

 
const thumbStyle = ref({});
 
function onScroll() {
  /* noop for now */
}

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Normalize Arabic/Latin whitespace and remove accidental extra gaps
function normalizeAyaText(input: string) {
  if (!input) return "";
  // collapse any whitespace (tabs/newlines/multiple spaces) into single space
  // then trim. Keep narrow no-break space usage to avoid breaking aya medallions,
  // but ensure no leading/trailing spaces remain.
  // Keep normalization simple (collapse whitespace) and avoid aggressive
  // unicode character removal — the CSS-only approach handles spacing.
  return String(input).replace(/\s+/g, " ").trim();
}

function _bookmarkKey(sId: number | string, verse: number | string) {
  return `${sId}_${verse}`;
}

const suraParagraphHtml = computed(() => {
  const s = sura.value;
  if (!s || !s.ayat) return "";

  // regex to capture a trailing sequence of ASCII or Arabic-Indic digits at end of the aya text
  const trailingDigitsRe = /([0-9\u0660-\u0669\u06F0-\u06F9]+)\s*$/u;

  return (
    s.ayat
      .map((a: any) => {
        const raw = String(a.text || "");
        const match = raw.match(trailingDigitsRe);
        const numberFromText = match ? match[1] : null;
        const textOnly = numberFromText ? raw.replace(trailingDigitsRe, "").trim() : raw;

        // normalize internal whitespace
        const normalizedText = normalizeAyaText(textOnly);
        const text = escapeHtml(normalizedText);
        const verse = escapeHtml(String(numberFromText ?? a.verse));
        const id = _bookmarkKey(s.id, a.verse);

        // create a safe id for SVG gradient (avoid invalid chars)
        const gid = `g_${(id || "").toString().replace(/[^\w-]/g, "")}`;

        // Render the aya text and include an inline SVG medallion to guarantee
        // gold coloring and preserve visible numbers even if global CSS is
        // aggressively styled. Keep bookmark-action attrs for handlers.
        return (
          `<span class="aya-inline" id="${id}" data-verse="${verse}">` +
          `<span class="arabic-text">${text}</span>` +
          `<span class="verse-wrap">` +
          `<span class="verse-num bookmark-action" role="button" tabindex="0" aria-label="Bookmark aya" data-bm="${id}">` +
          `<svg class="verse-medallion" width="1em" height="1em" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
          `<defs><radialGradient id="${gid}" cx="0.35" cy="0.35" r="1"><stop offset="0%" stop-color="var(--verse-medallion-light, #fff7e6)"/><stop offset="50%" stop-color="var(--verse-medallion-mid, #f3dfb8)"/><stop offset="100%" stop-color="var(--verse-medallion-dark, #e6c97a)"/></radialGradient></defs>` +
          `<circle cx="14" cy="14" r="12" fill="url(#${gid})" stroke="var(--verse-medallion-stroke, #caa14b)" stroke-width="1"/>` +
          `<text x="14" y="19" text-anchor="middle" font-family="Amiri, serif" font-size="10" fill="currentColor">${verse}</text>` +
          `</svg>` +
          `</span>` +
          `</span>` +
          `</span>`
        );
      })
      // join ayas with a single normal space (now normalized) to avoid surplus gaps
      .join(" ")
  );
});

function updateCurrentPath() {
  /* noop: path gets updated by router */
}

// Watch for route changes and update lok value
watchEffect(() => {
  const newLok = getLokFromRoute();
  console.warn("watchEffect: newLok =", newLok, "current lok =", lok.value);
  if (newLok !== lok.value) {
    console.warn("Setting new lok value:", newLok);
    lok.value = newLok;
    q2p.setIndex(newLok);
  }
});

useHead(() => ({
  title: PageTite.value,
  meta: [
    { name: 'description', content: appName.value },
    { property: 'og:title', content: PageTite.value },
    { property: 'og:description', content: appName.value },
  ],
}))

function goToBakara() {
  q2p.setIndex(2);
  router.push("/quran/2");
}
function goToNextSura() {
  router.push(`/quran/${lok.value + 1}`);
}

onMounted(() => {
  // Set initial lok value from route
  lok.value = getLokFromRoute();

  try {
    q2p.init(lok.value);
  } catch (error) {
    const err = error as any
    $q.notify({ message: err?.message || 'Failed to init', type: "negative" });
  }
  if (isClient) window.addEventListener("hashchange", updateCurrentPath);
  // initialize bookmarks (will load from server if logged-in or from local guest storage)
  try {
    bookmarksStore.init();
  } catch {}

  // Delegate click events for lightweight bookmark buttons inside ayas
  if (isClient) {
    const handler = (ev: Event) => {
      const btn = (ev.target as HTMLElement).closest(
        ".bookmark-action"
      ) as HTMLElement | null;
      if (!btn) return;
      ev.preventDefault();
      ev.stopPropagation();
      const bm = btn.getAttribute("data-bm") || "";
      if (bm) _saveBookmark(bm);
    };
    document.addEventListener("click", handler);
    // keyboard handler to support Enter/Space activation on focused medallion
    const keyHandler = (ev: KeyboardEvent) => {
      // only consider Enter or Space
      if (ev.key !== "Enter" && ev.key !== " " && ev.key !== "Spacebar") return;
      const target = ev.target as HTMLElement;
      const btn = target.closest(".bookmark-action") as HTMLElement | null;
      if (!btn) return;
      ev.preventDefault();
      ev.stopPropagation();
      const bm = btn.getAttribute("data-bm") || "";
      if (bm) _saveBookmark(bm);
    };
    document.addEventListener("keydown", keyHandler);
    // save handlers to remove later
    (onMounted as any)._bookmarkHandler = handler;
    (onMounted as any)._bookmarkKeyHandler = keyHandler;
  }
});

onUnmounted(() => {
  if (isClient) window.removeEventListener("hashchange", updateCurrentPath);
  // remove delegated bookmark handler
  try {
    const h = (onMounted as any)._bookmarkHandler;
    if (h && isClient) document.removeEventListener("click", h);
    const kh = (onMounted as any)._bookmarkKeyHandler;
    if (kh && isClient) document.removeEventListener("keydown", kh);
  } catch {}
});

function _saveBookmark(bm: string) {
  if (!bm) return;
  bookmarksStore.createBookmark(bm);
  $q.notify({ message: "Bookmark saved!", type: "positive" });
}

function parseTarget(input: string) {
  if (!input) return null;
  const m = String(input)
    .trim()
    .match(/^\s*(\d+)[\s:/]+(\d+)\s*$/);
  if (!m) return null;
  // return the parsed sura and verse numbers
  return [m[1], m[2]];
}

async function goToAya() {
  const parsed = parseTarget(targetInput.value);
  if (!parsed) {
    $q.notify({
      message: "Invalid target, use <sura>:<verse> (e.g. 2:255)",
      type: "negative",
    });
    return;
  }
  const [s, v] = parsed;
  if (!s || !v) {
    $q.notify({ message: "Invalid sura or verse", type: "negative" });
    return;
  }
  // If already on the requested sura, just navigate to the aya element id
  if (Number(s) === Number(lok.value)) {
    navigateToHash(`${s}_${v}`);
    return;
  }

  // Otherwise route to the requested sura and include the hash. The page's onMounted will attempt to scroll to the hash,
  // but we also attempt a delayed scroll as a fallback in case the DOM wasn't ready.
  try {
    await router.push({ path: `/quran/${s}`, hash: `#${s}_${v}` });
    setTimeout(() => navigateToHash(`${s}_${v}`), 250);
  } catch (err: any) {
    $q.notify({ message: err?.message || "Navigation failed", type: "negative" });
  }
}

 
function handleAyaClick(e: Event) {
  const target = e.target as HTMLElement;
  const aya = target.closest(".aya-inline") as HTMLElement | null;
  if (!aya) return;
  const id =
    aya.getAttribute("id") || aya.querySelector(".verse-medallion")?.textContent || "";
  if (id) navigateToHash(id);
}

 
function handleAyaDblClick(e: Event) {
  const target = e.target as HTMLElement;
  const aya = target.closest(".aya-inline") as HTMLElement | null;
  if (!aya) return;
  const id =
    aya.getAttribute("id") || aya.querySelector(".verse-medallion")?.textContent || "";
  if (id) _saveBookmark(id);
}

function navigateToHash(hash: string) {
  if (!hash || !isClient) return;

  // Normalize the hash - remove # if present, ensure it doesn't have id_ prefix
  let normalized = hash.startsWith("#") ? hash.slice(1) : hash;
  if (normalized.startsWith("id_")) normalized = normalized.slice(3);

  const element = document.getElementById(normalized);

  // mark selected bookmark so list entry can be highlighted
  try {
    selectedBookmark.value = `id_${normalized}`;
  } catch {}

  if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
  // briefly highlight the target aya so the user can spot it
  try {
    // clear previous highlights
    document
      .querySelectorAll(".aya-highlight")
      .forEach((el) => el.classList.remove("aya-highlight"));
  } catch {}
  try {
  element?.classList.add("aya-highlight");
    // remove highlight after 2s
    setTimeout(() => {
      try {
        element?.classList.remove("aya-highlight");
      } catch {}
    }, 2000);
  } catch {}
}

function onAyaClick(e: Event) {
  const target = e.target as HTMLElement;
  const aya = target.closest(".aya-inline") as HTMLElement | null;
  if (!aya) return;
  const id =
    aya.getAttribute("id") || aya.querySelector(".verse-medallion")?.textContent || "";
  if (id) navigateToHash(id);
}

function onAyaDblClick(e: Event) {
  const target = e.target as HTMLElement;
  const aya = target.closest(".aya-inline") as HTMLElement | null;
  if (!aya) return;
  const id =
    aya.getAttribute("id") || aya.querySelector(".verse-medallion")?.textContent || "";
  if (id) _saveBookmark(id);
}
</script>

<template>
  <KeepAlive>
    <client>
      <q-page padding class="rtl islamic-design">
        <q-btn
          flat
          icon="arrow_back"
          color="primary"
          class="back-btn"
          @click="router.push('/quran')"
        >
          {{ t("back") }}
        </q-btn>

        <div class="sura-controls">
          <q-space />
          <q-btn flat icon="bookmark" label="Bookmarks">
            <q-menu auto-close>
              <q-list class="border-green" style="min-width: 220px">
              <q-chip
                v-for="bm in bookmarksStore.bookmarks"
                :key="typeof bm === 'string' ? bm : bm._id"
                clickable
                @click="navigateToHash(typeof bm === 'string' ? bm : bm.bookmark)"
              >
                <q-item-section>{{ formatBookmarkLabel(bm) }}</q-item-section>
                <q-item-section side>
                  <q-btn
                    dense
                    flat
                    icon="delete"
                    @click.stop.prevent="
                      bookmarksStore.deleteBookmark(
                        typeof bm === 'string' ? bm : bm.bookmark
                      )
                    "
                  />
                </q-item-section>
              </q-chip>
              </q-list>
            </q-menu>
          </q-btn>
          <!-- quick jump to specific aya (format: sura:verse) -->
          <div style="display: flex; align-items: center; gap: 0.5rem">
            <q-input
              v-model="targetInput"
              dense
              outlined
              placeholder="sura:verse (e.g. 2:255)"
              style="max-width: 220px"
            />
            <q-btn dense color="primary" flat label="Go" @click="goToAya" />
          </div>
        </div>

        <!-- Visible bookmarks panel (toggleable) -->
        <div v-if="showBookmarks" class="bookmarks-panel">
          <q-card flat bordered class="q-pa-sm">
            <div
              class="bookmark-header"
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 0.5rem;
              "
            >
              <div class="text-subtitle2" style="margin-left: 0.5rem">
                {{ t("bookmarks") || "Bookmarks" }}
              </div>
            </div>
            <q-separator />
            <div class="q-mt-sm">
              <q-list>
                <q-item
                  v-for="bm in bookmarksStore.bookmarks"
                  :key="typeof bm === 'string' ? bm : bm._id"
                  clickable
                  :class="{ 'bookmark-selected': isBookmarkSelected(bm) }"
                  @click="() => navigateToHash(typeof bm === 'string' ? bm : bm.bookmark)"
                >
                  <q-item-section>{{ formatBookmarkLabel(bm) }}</q-item-section>
                  <q-item-section side>
                    <q-btn
                      dense
                      flat
                      icon="delete"
                      @click.stop.prevent="() => deleteBookmarkItem(bm)"
                    />
                  </q-item-section>
                </q-item>
                <q-item v-if="!bookmarksStore.bookmarks.length">
                  <q-item-section>
                    {{ t("no_bookmarks") || "No bookmarks" }}
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card>
        </div>

        <q-slide-transition>
          <q-card class="text-md islamic-card">
            <q-card v-if="sura" class="q-mt-xs islamic-card">
              <q-card-section>
                <div class="sura-plate">
                  <div class="sura-name">{{ sura.e_name }} - {{ sura.name }}</div>
                  <div class="sura-meta">
                    <span>{{ t("pages.quran.sura.id") }}: {{ sura.id }}</span>
                    <span>•</span>
                    <span
                      >{{ t("pages.quran.sura.totverses") }}:
                      {{ sura.total_verses }}</span
                    >
                    <span>•</span>
                    <span>{{ t("pages.quran.sura.location") }}: {{ sura.type }}</span>
                  </div>
                  <div v-if="sura && sura.id" class="bismillah-line">
                    <span class="bismillah">بِسْمِ</span>
                    <span class="allah">اللّٰهِ</span>
                    <span class="bismillah">الرَّحْمـَنِ الرَّحِيمِ</span>
                  </div>
                </div>
              </q-card-section>

              <q-scroll-observable visible class="col verse-scroll">
                <q-card-section>
                  <div class="verse">
                    <div
                      class="ayah-paragraph"
                      aria-live="polite"
                      @click="onAyaClick"
                      @dblclick="onAyaDblClick"
                      v-html="suraParagraphHtml"
                    />
                  </div>
                </q-card-section>
              </q-scroll-observable>
            </q-card>
          </q-card>
        </q-slide-transition>
      </q-page>
    </client>
  </KeepAlive>
</template>

<style scoped lang="scss">
.islamic-design {
  background: var(--background-pattern);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  min-height: 100vh;
  color: var(--text-color);
}

.sura-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.back-btn {
  margin-bottom: 1rem;
  font-size: 1.05rem;
  z-index: 2;
}

.sura-plate {
  text-align: center;
  padding: 0.6rem 1rem 1rem 1rem;
}
.sura-name {
  font-family: "Scheherazade", "Amiri", serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--title-color);
  margin-bottom: 0.2rem;
}
.sura-meta {
  font-size: 0.95rem;
  color: var(--subtitle-color);
  margin-bottom: 0.6rem;
}
.bismillah-line {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  justify-content: center;
  margin-top: 0.4rem;
}
.bismillah,
.allah {
  font-family: "Scheherazade", "Amiri", serif;
  font-size: 1.5rem;
  color: var(--title-color);
}
.allah {
  color: #b30000;
  font-weight: 800;
  font-size: 1.8rem;
}

.verse {
  display: block;
  line-height: 2.4rem;
  text-align: right;
  direction: rtl;
  font-family: "Scheherazade", "Amiri", serif;
  font-size: 1.2rem;
  padding: 0.8rem 1rem;
  text-align: justify;
}
.ayah-paragraph {
  direction: rtl;
  unicode-bidi: isolate;
  /* Use right alignment instead of full justification to avoid large
     inter-word gaps when inline medallions are present. */
  text-align: right;
  line-height: 2.8rem;
  font-size: 3rem;
  font-family: "Noto Naskh Arabic", "Amiri", "Scheherazade", serif;
  margin: 0;
  padding: 0;
  hyphens: none;
  word-break: normal;
  -webkit-font-feature-settings: "rlig" 1, "calt" 1;
  text-rendering: optimizeLegibility;
}

.aya-inline {
  display: inline;
  vertical-align: baseline;
  /* remove internal padding so medallion sits flush with text */
  padding: 0;
  white-space: normal;
}

/* The verse-number medallion acts as the bookmark-action now. Keep focus styles
   and pointer cursor for accessibility. */
.verse-num.bookmark-action {
  cursor: pointer;
}
.verse-num.bookmark-action:focus {
  outline: 2px solid rgba(66, 133, 244, 0.35);
  border-radius: 50%;
}

.arabic-text {
  display: inline;
  max-width: none;
  text-align: right;
  line-height: 2.8rem;
  font-size: inherit;
}

.verse-medallion {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-inline-start: 0.4rem;
  vertical-align: baseline;
  line-height: 0;
  pointer-events: none;
}
.verse-medallion circle {
  stroke: #caa14b;
}
.verse-medallion text {
  font-family: "Amiri", serif;
  font-size: 8px;
}
.verse-medallion svg {
  /* previously set to block which forced line breaks; keep SVG inline */
  display: inline-block;
  width: 18px;
  height: 18px;
  vertical-align: middle;
}

/* Force inline flow for all children inside the paragraph. This overrides
   any accidental block-level markup coming from the source and ensures
   the whole sura renders as a single flowing paragraph with inline
   medallions. */
.ayah-paragraph,
.ayah-paragraph * {
  display: inline !important;
  margin: 0 !important;
  padding: 0 !important;
  vertical-align: baseline !important;
}

/* temporary highlight style applied when jumping to an aya */
.aya-highlight {
  display: inline-block !important;
  background-color: rgba(255, 235, 59, 0.85) !important; /* stronger yellow */
  transition: background-color 0.4s ease-in-out, box-shadow 0.2s ease-in-out;
  border-radius: 6px;
  padding: 0 0.18rem !important;
  box-shadow: 0 0 0 2px rgba(255, 235, 59, 0.15) inset;
}

/* highlight selected item in bookmarks list */
.bookmark-selected {
  background-color: rgba(255, 235, 59, 0.4) !important;
}

/* Make sure medallion remains tight and doesn't create gaps */
.ayah-paragraph .verse-medallion {
  display: inline-block !important;
  width: 18px !important;
  height: 18px !important;
  margin-inline-start: 0.12rem !important;
}

/* Use a generated pseudo-element for verse numbers so they remain inline */
/* style explicit verse number elements that are now rendered as
   <span class="verse-num">N</span> inside each .aya-inline */
.aya-inline {
  /* verse medallion sizing: smaller so numbers are less dominant */
  --verse-size: 0.75em;
  --verse-medallion-light: #fff7e6;
  --verse-medallion-mid: #f3dfb8;
  --verse-medallion-dark: #e6c97a;
  --verse-medallion-stroke: #caa14b;
  --verse-medallion-text: #2b1606;
}

.aya-inline .verse-num {
  display: inline-flex;
  align-items: center;
  gap: 0.06rem;
  /* smaller margin keeps medallion close to the preceding word */
  margin-inline-start: 0.14rem;
  vertical-align: text-bottom;
  line-height: 1;
  box-sizing: border-box;
  padding: 0;
  font-feature-settings: "tnum" 1;
}

/* numeric medallion */
/* The medallion is drawn with ::after so it doesn't affect justification */
.verse-wrap {
  display: inline-flex;
  align-items: center;
}
.verse-wrap > .verse-num {
  display: inline-block;
  /* allow natural sizing so ::after or SVG content can layout properly */
  width: auto !important;
  height: auto !important;
  position: relative;
}
.verse-wrap > .verse-num::after {
  content: attr(data-num);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  left: 0;
  top: 0;
  /* size relative to surrounding text via --verse-size */
  min-width: var(--verse-size);
  height: var(--verse-size);
  padding: 0 0.45em;
  border-radius: 50%;
  /* Force gold medallion colors so theme overrides don't turn it monochrome */
  background: linear-gradient(
    180deg,
    var(--verse-medallion-light, #fffaf0) 0%,
    var(--verse-medallion-mid, #f7e5b8) 40%,
    var(--verse-medallion-dark, #e0b84a) 100%
  ) !important;
  border: 1px solid var(--verse-medallion-stroke, rgba(150, 100, 22, 0.9)) !important;
  color: var(--verse-medallion-text, #2b1606) !important;
  font-family: "Amiri", serif;
  /* slightly smaller numeric text so it fits neatly inside reduced medallion */
  font-size: 0.8em;
  line-height: 1;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05) inset, 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* High-specificity override to cancel any module/global rules that
   may have injected an SVG background or applied color-inverting filters. */
.ayah-paragraph .aya-inline .verse-wrap > .verse-num.bookmark-action,
.ayah-paragraph .aya-inline .verse-wrap > .verse-num.bookmark-action::after {
  background-image: none !important;
  -webkit-filter: none !important;
  filter: none !important;
  mix-blend-mode: normal !important;
}

/* Ensure our ::after gold gradient and color win against other rules. */
.ayah-paragraph .aya-inline .verse-wrap > .verse-num.bookmark-action::after {
  background: linear-gradient(180deg, #fffaf0 0%, #f7e5b8 40%, #e0b84a 100%) !important;
  border: 1px solid rgba(150, 100, 22, 0.9) !important;
  color: #2b1606 !important;
  -webkit-text-fill-color: #2b1606 !important;
}

/* remove default outline but keep an accessible focus ring */
.verse-wrap > .verse-num.bookmark-action:focus::after {
  outline: none;
  box-shadow: 0 0 0 4px rgba(202, 161, 75, 0.14) !important, 0 2px 6px rgba(0, 0, 0, 0.06) !important;
  border-radius: 16px;
}

/* hover/active affordance */
.verse-wrap > .verse-num.bookmark-action:hover::after {
  transform: translateY(-1px);
}

/* ensure medallion remains tight */
.ayah-paragraph .verse-medallion {
  display: inline-block !important;
  /* use the same verse-size so inline SVG scales with surrounding text */
  width: var(--verse-size) !important;
  height: var(--verse-size) !important;
  margin-inline-start: 0.12rem !important;
  vertical-align: text-bottom;
  color: var(
    --verse-medallion-text,
    #2b1606
  ) !important; /* text uses currentColor inside SVG */
}

/* Ensure the verse-num used for bookmark-action is inline-flex so it can center
   its pseudo-element or child SVG correctly and not collapse due to global rules */
.ayah-paragraph .aya-inline .verse-wrap > .verse-num.bookmark-action {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  vertical-align: text-bottom !important;
  width: auto !important;
  height: auto !important;
  padding: 0 !important;
}
.verse-scroll {
  min-height: 60vh;
  max-height: calc(100vh - 12rem);
  overflow: auto;
}

.islamic-card {
  max-width: 820px;
  margin-left: auto;
  margin-right: auto;
  padding: 1rem 1.2rem;
  background: #fff;
  border: 12px solid transparent;
  box-shadow: inset 0 0 0 6px #d6b76e, 0 10px 30px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
}
.islamic-card::before {
  content: "";
  display: block;
  width: 100%;
  height: 48px;
  background-image: url("~/assets/images/decor-top.svg");
  margin-top: -12px;
}
.islamic-card::after {
  content: "";
  display: block;
  width: 100%;
  height: 48px;
  background-image: url("~/assets/images/decor-bottom.svg");
  margin-bottom: -12px;
}

:root {
  --background-pattern: url("~/assets/patterns/islamic-pattern-light.svg");
  --text-color: #155724;
  --title-color: #155724;
  --subtitle-color: #6c757d;
  --card-bg: #f9f9f9;
  /* medallion colors */
  --medal-bg-1: #fffaf0;
  --medal-bg-2: #f7e5b8;
  --medal-bg-3: #e0b84a;
  --medal-border: rgba(150, 100, 22, 0.9);
  --medal-color: #2b1606;
}
@media (prefers-color-scheme: dark) {
  :root {
    --background-pattern: url("~/assets/patterns/islamic-pattern-dark.svg");
    --text-color: #e0e0e0;
    --title-color: #e0e0e0;
    --subtitle-color: #b0b0b0;
    --card-bg: #333;
    /* dark-mode medallion adjustments: keep medallion light so the
       numeric text can be dark and readable even in dark theme */
    --medal-bg-1: #fffaf0;
    --medal-bg-2: #f7e5b8;
    --medal-bg-3: #e0b84a;
    --medal-border: rgba(150, 100, 22, 0.9);
    --medal-color: #2b1606;
  }
}
</style>

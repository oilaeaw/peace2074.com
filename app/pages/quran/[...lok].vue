<!-- eslint-disable unused-imports/no-unused-vars -->
<script lang="ts" setup>
import { useQuasar } from "quasar";

const $q = useQuasar();
const q2p = useQ2P();
const { t } = useI18n();
const appName = computed(() => t("general.SiteTitle"));
const route = useRoute();
const lok = ref(Number(route.params.lok) || 1);
const Quran = computed(() => q2p.GetQ);
const sura = computed(() => q2p.GetSura);
const PageTite = computed(
  () => `${appName.value} - ${sura.value?.id || ""}:${sura.value?.name || ""}`
);
const router = useRouter();
const bookmarksStore = q2p;
const showBookmarks = ref(true);

function formatBookmarkLabel(bm: string) {
  // bm is expected to be 'id_<sura>_<verse>' — show as 'sura:verse' for readability
  if (!bm) return bm;
  const normalized = bm.startsWith("id_") ? bm.slice(3) : bm;
  const parts = normalized.split("_");
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  return bm;
}

// eslint-disable-next-line unused-imports/no-unused-vars
const thumbStyle = ref({});
// eslint-disable-next-line unused-imports/no-unused-vars
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

        const text = escapeHtml(textOnly);
        const verse = escapeHtml(String(numberFromText ?? a.verse));
        const id = _bookmarkKey(s.id, a.verse);

        // render the aya text and append an explicit inline verse number element
        return `<span class="aya-inline" id="id_${id}" data-verse="${verse}"><span class="arabic-text">${text}</span><span class="verse-num" aria-hidden="true">${verse}</span></span>`;
      })
      // join ayas with a narrow no-break space so letters don't run together across spans
      .join("\u202F")
  );
});

function updateCurrentPath() {
  /* noop: path gets updated by router */
}

watchEffect(() => {
  if (+route.params.lok) {
    lok.value = Number(route.params.lok);
    q2p.setIndex(lok.value);
  }
});

useHead({
  title: PageTite,
  appDescription: appName,
  ogTitle: PageTite,
  ogDescription: appName,
});

function goToBakara() {
  q2p.setIndex(2);
  router.push("/quran/2");
}
function goToNextSura() {
  router.push(`/quran/${lok.value + 1}`);
}

onMounted(() => {
  try {
    $$q.init();
  } catch (error) {
    $q.notify({ message: "Failed to load bookmarks", type: "negative" });
  }
  if (isClient) window.addEventListener("hashchange", updateCurrentPath);
});

onUnmounted(() => {
  if (isClient) window.removeEventListener("hashchange", updateCurrentPath);
});

function _saveBookmark(bm: string) {
  if (!bm) return;
  bookmarksStore.createBookmark(bm);
  $q.notify({ message: "Bookmark saved!", type: "positive" });
}

// eslint-disable-next-line unused-imports/no-unused-vars
function handleAyaClick(e: Event) {
  const target = e.target as HTMLElement;
  const aya = target.closest(".aya-inline") as HTMLElement | null;
  if (!aya) return;
  const id =
    aya.getAttribute("id") || aya.querySelector(".verse-medallion")?.textContent || "";
  if (id) navigateToHash(id);
}

// eslint-disable-next-line unused-imports/no-unused-vars
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

  let normalized = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!normalized.startsWith("id_")) normalized = `id_${normalized}`;
  const element = document.getElementById(normalized);
  if (element) element.scrollIntoView({ behavior: "smooth" });
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

watchEffect(() => {
  if (+route.params.lok) {
    lok.value = Number(route.params.lok);
    q2p.setIndex(lok.value);
  }
});
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
          <q-menu auto-close>
            <template #anchor>
              <q-btn flat icon="bookmark" label="Bookmarks" />
            </template>
            <q-list class="border-greee" style="min-width: 220px">
              <q-chip
                v-for="bm in bookmarksStore.bookmarks"
                :key="bm"
                clickable
                @click="navigateToHash(bm)"
              >
                <q-item-section>{{ formatBookmarkLabel(bm) }}</q-item-section>
                <q-item-section side>
                  <q-btn
                    dense
                    flat
                    icon="delete"
                    @click.stop.prevent="bookmarksStore.deleteBookmark(bm)"
                  />
                </q-item-section>
              </q-chip>
              <q-item v-if="!bookmarksStore.bookmarks.length">
                <q-item-section>{{ t("no_bookmarks") || "No bookmarks" }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
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
  font-size: 2.2rem;
  padding: 0.8rem 1rem;
  text-align: justify;
}
.ayah-paragraph {
  direction: rtl;
  unicode-bidi: isolate;
  text-align: justify;
  text-justify: inter-word;
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
  padding: 0 0.04rem;
  white-space: normal;
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
.aya-inline .verse-num {
  display: inline-block;
  width: 22px;
  height: 22px;
  margin-inline-start: 0.36rem;
  border-radius: 50%;
  /* decorative inline SVG as background (gold medallion) - percent-encoded */
  background-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cdefs%3E%3CradialGradient%20id%3D%22g%22%20cx%3D%220.35%22%20cy%3D%220.35%22%20r%3D%221%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23fff7e6%22/%3E%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%23f3dfb8%22/%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23e6c97a%22/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20fill%3D%22url(%23g)%22%20stroke%3D%22%23caa14b%22%20stroke-width%3D%221.2%22/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #2b1a00;
  font-family: "Amiri", serif;
  font-size: 10px;
  line-height: 1;
  vertical-align: text-bottom;
  box-sizing: border-box;
  padding: 0;
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
  background-image: url("~assets/images/decor-top.svg");
  margin-top: -12px;
}
.islamic-card::after {
  content: "";
  display: block;
  width: 100%;
  height: 48px;
  background-image: url("~assets/images/decor-bottom.svg");
  margin-bottom: -12px;
}

:root {
  --background-pattern: url("~assets/patterns/islamic-pattern-light.svg");
  --text-color: #155724;
  --title-color: #155724;
  --subtitle-color: #6c757d;
  --card-bg: #f9f9f9;
}
@media (prefers-color-scheme: dark) {
  :root {
    --background-pattern: url("~assets/patterns/islamic-pattern-dark.svg");
    --text-color: #e0e0e0;
    --title-color: #e0e0e0;
    --subtitle-color: #b0b0b0;
    --card-bg: #333;
  }
}
</style>

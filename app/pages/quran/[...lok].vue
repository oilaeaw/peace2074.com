<!-- eslint-disable unused-imports/no-unused-vars -->
<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { useBookmarksStore } from '~/store/bookmarks.pinia'

const $q = useQuasar()
const q2p = useQ2P()
const { t } = useI18n()
const appName = computed(() => t('general.SiteTitle'))
const route = useRoute()
const lok = ref(0) // Initialize with default value

// Extract the sura number from route params - handle both array and single value
function getLokFromRoute() {
  const param = route.params.lok
  console.warn(
    'Route param lok:',
    param,
    'Type:',
    typeof param,
    'IsArray:',
    Array.isArray(param),
  )
  if (Array.isArray(param)) {
    // If it's an array, take the first element
    const result = Number(param[0]) || 1
    console.warn('Extracted from array:', result)
    return result
  }
  const result = Number(param) || 1
  console.warn('Extracted directly:', result)
  return result
}
const Quran = computed(() => q2p.GetQ)
const sura = computed(() => q2p.GetSura)
const PageTite = computed(
  () => `${appName.value} - ${sura.value?.id || ''}:${sura.value?.name || ''}`,
)
const router = useRouter()
const bookmarksStore = useBookmarksStore()
const showBookmarks = ref(true)
const targetInput = ref('')
const selectedBookmark = ref('')

function normalizeBookmarkId(bm: any) {
  const bookmarkStr = typeof bm === 'string' ? bm : bm?.bookmark || ''
  if (!bookmarkStr)
    return ''
  return bookmarkStr.startsWith('id_') ? bookmarkStr : `id_${bookmarkStr}`
}

function isBookmarkSelected(bm: any) {
  return normalizeBookmarkId(bm) === selectedBookmark.value
}

function deleteBookmarkItem(bm: any) {
  // Pass the bookmark string for deletion
  const bookmarkStr = typeof bm === 'string' ? bm : bm?.bookmark || ''
  if (bookmarkStr) {
    bookmarksStore.deleteBookmark(bookmarkStr)
    if (isBookmarkSelected(bm))
      selectedBookmark.value = ''
  }
}

function formatBookmarkLabel(bm: any) {
  // bm can be a string or a bookmark object - get the bookmark string
  const bookmarkStr = typeof bm === 'string' ? bm : bm?.bookmark || ''
  if (!bookmarkStr)
    return bookmarkStr
  const normalized = bookmarkStr.startsWith('id_') ? bookmarkStr.slice(3) : bookmarkStr
  const parts = normalized.split('_')
  if (parts.length >= 2)
    return `${parts[0]}:${parts[1]}`
  return bookmarkStr
}

// eslint-disable-next-line unused-imports/no-unused-vars
const thumbStyle = ref({})
// eslint-disable-next-line unused-imports/no-unused-vars
function onScroll() {
  /* noop for now */
}

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function _bookmarkKey(sId: number | string, verse: number | string) {
  return `${sId}_${verse}`
}

const suraParagraphHtml = computed(() => {
  const s = sura.value
  if (!s || !s.ayat)
    return ''

  // regex to capture a trailing sequence of ASCII or Arabic-Indic digits at end of the aya text
  const trailingDigitsRe = /([0-9\u0660-\u0669\u06F0-\u06F9]+)\s*$/u

  return (
    s.ayat
      .map((a: any) => {
        const raw = String(a.text || '')
        const match = raw.match(trailingDigitsRe)
        const numberFromText = match ? match[1] : null
        const textOnly = numberFromText ? raw.replace(trailingDigitsRe, '').trim() : raw

        const text = escapeHtml(textOnly)
        const verse = escapeHtml(String(numberFromText ?? a.verse))
        const id = _bookmarkKey(s.id, a.verse)

        // render the aya text and append an explicit inline verse number element
        return `<span class="aya-inline" id="${id}" data-verse="${verse}"><span class="arabic-text">${text}</span><span class="verse-num" aria-hidden="true">${verse}</span></span>`
      })
      // join ayas with a narrow no-break space so letters don't run together across spans
      .join('\u202F')
  )
})

function updateCurrentPath() {
  /* noop: path gets updated by router */
}

// Watch for route changes and update lok value
watchEffect(() => {
  const newLok = getLokFromRoute()
  console.warn('watchEffect: newLok =', newLok, 'current lok =', lok.value)
  if (newLok !== lok.value) {
    console.warn('Setting new lok value:', newLok)
    lok.value = newLok
    q2p.setIndex(newLok)
  }
})

useHead({
  title: PageTite,
  appDescription: appName,
  ogTitle: PageTite,
  ogDescription: appName,
})

function goToBakara() {
  q2p.setIndex(2)
  router.push('/quran/2')
}
function goToNextSura() {
  router.push(`/quran/${lok.value + 1}`)
}

onMounted(() => {
  // Set initial lok value from route
  lok.value = getLokFromRoute()

  try {
    q2p.init(lok.value)
  }
  catch (error) {
    $q.notify({ message: error.message, type: 'negative' })
  }
  if (isClient)
    window.addEventListener('hashchange', updateCurrentPath)
  // initialize bookmarks (will load from server if logged-in or from local guest storage)
  try {
    bookmarksStore.init()
  }
  catch {}
})

onUnmounted(() => {
  if (isClient)
    window.removeEventListener('hashchange', updateCurrentPath)
})

function _saveBookmark(bm: string) {
  if (!bm)
    return
  bookmarksStore.createBookmark(bm)
  $q.notify({ message: 'Bookmark saved!', type: 'positive' })
}

function parseTarget(input: string) {
  if (!input)
    return null
  const m = String(input)
    .trim()
    .match(/^\s*(\d+)[\s:/]+(\d+)\s*$/)
  if (!m)
    return null
  // return the parsed sura and verse numbers
  return [m[1], m[2]]
}

async function goToAya() {
  const parsed = parseTarget(targetInput.value)
  if (!parsed) {
    $q.notify({
      message: 'Invalid target, use <sura>:<verse> (e.g. 2:255)',
      type: 'negative',
    })
    return
  }
  const [s, v] = parsed
  if (!s || !v) {
    $q.notify({ message: 'Invalid sura or verse', type: 'negative' })
    return
  }
  // If already on the requested sura, just navigate to the aya element id
  if (Number(s) === Number(lok.value)) {
    navigateToHash(`${s}_${v}`)
    return
  }

  // Otherwise route to the requested sura and include the hash. The page's onMounted will attempt to scroll to the hash,
  // but we also attempt a delayed scroll as a fallback in case the DOM wasn't ready.
  try {
    await router.push({ path: `/quran/${s}`, hash: `#${s}_${v}` })
    setTimeout(() => navigateToHash(`${s}_${v}`), 250)
  }
  catch (err: any) {
    $q.notify({ message: err?.message || 'Navigation failed', type: 'negative' })
  }
}

// eslint-disable-next-line unused-imports/no-unused-vars
function handleAyaClick(e: Event) {
  const target = e.target as HTMLElement
  const aya = target.closest('.aya-inline') as HTMLElement | null
  if (!aya)
    return
  const id
    = aya.getAttribute('id') || aya.querySelector('.verse-medallion')?.textContent || ''
  if (id)
    navigateToHash(id)
}

// eslint-disable-next-line unused-imports/no-unused-vars
function handleAyaDblClick(e: Event) {
  const target = e.target as HTMLElement
  const aya = target.closest('.aya-inline') as HTMLElement | null
  if (!aya)
    return
  const id
    = aya.getAttribute('id') || aya.querySelector('.verse-medallion')?.textContent || ''
  if (id)
    _saveBookmark(id)
}

function navigateToHash(hash: string) {
  if (!hash || !isClient)
    return

  // Normalize the hash - remove # if present, ensure it doesn't have id_ prefix
  let normalized = hash.startsWith('#') ? hash.slice(1) : hash
  if (normalized.startsWith('id_'))
    normalized = normalized.slice(3)

  const element = document.getElementById(normalized)

  // mark selected bookmark so list entry can be highlighted
  try {
    selectedBookmark.value = `id_${normalized}`
  }
  catch {}

  if (element)
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  // briefly highlight the target aya so the user can spot it
  try {
    // clear previous highlights
    document
      .querySelectorAll('.aya-highlight')
      .forEach(el => el.classList.remove('aya-highlight'))
  }
  catch {}
  try {
    element.classList.add('aya-highlight')
    // remove highlight after 2s
    setTimeout(() => {
      try {
        element.classList.remove('aya-highlight')
      }
      catch {}
    }, 2000)
  }
  catch {}
}

function onAyaClick(e: Event) {
  const target = e.target as HTMLElement
  const aya = target.closest('.aya-inline') as HTMLElement | null
  if (!aya)
    return
  const id
    = aya.getAttribute('id') || aya.querySelector('.verse-medallion')?.textContent || ''
  if (id)
    navigateToHash(id)
}

function onAyaDblClick(e: Event) {
  const target = e.target as HTMLElement
  const aya = target.closest('.aya-inline') as HTMLElement | null
  if (!aya)
    return
  const id
    = aya.getAttribute('id') || aya.querySelector('.verse-medallion')?.textContent || ''
  if (id)
    _saveBookmark(id)
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
          <q-menu auto-close>
            <template #anchor>
              <q-btn flat icon="bookmark" label="Bookmarks" />
            </template>
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
                        typeof bm === 'string' ? bm : bm.bookmark,
                      )
                    "
                  />
                </q-item-section>
              </q-chip>
            </q-list>
          </q-menu>
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
                  <div class="sura-name">
                    {{ sura.e_name }} - {{ sura.name }}
                  </div>
                  <div class="sura-meta">
                    <span>{{ t("pages.quran.sura.id") }}: {{ sura.id }}</span>
                    <span>•</span>
                    <span>{{ t("pages.quran.sura.totverses") }}:
                      {{ sura.total_verses }}</span>
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
  font-family: 'Noto Naskh Arabic', 'Scheherazade', 'Amiri', serif;
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--title-color);
  margin-bottom: 0.2rem;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
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
  font-family: 'Noto Naskh Arabic', 'Amiri', 'Scheherazade', serif;
  font-size: 1.6rem;
  color: var(--title-color);
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
}
.allah {
  color: #b30000;
  font-weight: 800;
  font-size: 1.8rem;
}

.verse {
  display: block;
  line-height: 2.6rem;
  text-align: right;
  direction: rtl;
  font-family: 'Noto Naskh Arabic', 'Amiri', 'Scheherazade', serif;
  font-size: 2.4rem;
  padding: 0.8rem 1rem;
  text-align: justify;
  text-rendering: optimizeLegibility;
}
.ayah-paragraph {
  direction: rtl;
  unicode-bidi: isolate;
  text-align: justify;
  text-justify: inter-word;
  line-height: 3.1rem;
  font-size: 3.2rem;
  font-family: 'Noto Naskh Arabic', 'Amiri', 'Scheherazade', serif;
  margin: 0;
  padding: 0;
  hyphens: none;
  word-break: normal;
  -webkit-font-feature-settings: normal;
  font-feature-settings: normal;
  font-variant-ligatures: contextual;
  font-kerning: normal;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.aya-inline {
  display: inline;
  vertical-align: baseline;
  padding: 0 0.06rem;
  white-space: normal;
  letter-spacing: 0.01em; /* slight breathing room */
}

.arabic-text {
  display: inline;
  max-width: none;
  text-align: right;
  line-height: inherit;
  font-size: inherit;
  color: var(--text-color);
  text-shadow: 0 0.6px 0 rgba(0, 0, 0, 0.02);
}

.verse-medallion {
  display: inline-block;
  width: 22px;
  height: 22px;
  margin-inline-start: 0.36rem;
  vertical-align: baseline;
  line-height: 0;
  pointer-events: none;
}
.verse-medallion circle {
  stroke: #caa14b;
}
.verse-medallion text {
  font-family: 'Amiri', serif;
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
  /* keep most items inline, but allow medallions and verse numbers to be inline-block */
  display: inline !important;
  margin: 0 !important;
  padding: 0 !important;
  vertical-align: baseline !important;
}

/* temporary highlight style applied when jumping to an aya */
.aya-highlight {
  display: inline-block !important;
  background-color: rgba(255, 235, 59, 0.85) !important;
  transition:
    background-color 0.4s ease-in-out,
    box-shadow 0.2s ease-in-out;
  border-radius: 6px;
  padding: 0 0.22rem !important;
  box-shadow: 0 0 0 2px rgba(255, 235, 59, 0.12) inset;
}

/* highlight selected item in bookmarks list */
.bookmark-selected {
  background-color: rgba(255, 235, 59, 0.4) !important;
}

/* Make sure medallion remains tight and doesn't create gaps */
.ayah-paragraph .verse-medallion {
  display: inline-block !important;
  width: 20px !important;
  height: 20px !important;
  margin-inline-start: 0.12rem !important;
}

/* Use a generated pseudo-element for verse numbers so they remain inline */
/* style explicit verse number elements that are now rendered as
   <span class="verse-num">N</span> inside each .aya-inline */
.aya-inline .verse-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-inline-start: 0.36rem;
  border-radius: 50%;
  background-image: url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cdefs%3E%3CradialGradient%20id%3D%22g%22%20cx%3D%220.35%22%20cy%3D%220.35%22%20r%3D%221%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23fff7e6%22/%3E%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%23f3dfb8%22/%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23e6c97a%22/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20fill%3D%22url(%23g)%22%20stroke%3D%22%23caa14b%22%20stroke-width%3D%221.2%22/%3E%3C/svg%3E');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  color: #2b1a00;
  font-family: 'Amiri', serif;
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
  -webkit-overflow-scrolling: touch;
}

.islamic-card {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  padding: 1.2rem 1.6rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 250, 246, 0.98));
  border: 12px solid transparent;
  box-shadow:
    inset 0 0 0 6px #d6b76e,
    0 18px 40px rgba(0, 0, 0, 0.08);
  border-radius: 10px;
}
.islamic-card::before {
  content: '';
  display: block;
  width: 100%;
  height: 48px;
  background-image: url('~assets/images/decor-top.svg');
  margin-top: -12px;
}
.islamic-card::after {
  content: '';
  display: block;
  width: 100%;
  height: 48px;
  background-image: url('~assets/images/decor-bottom.svg');
  margin-bottom: -12px;
}

:root {
  --background-pattern: url('~assets/patterns/islamic-pattern-light.svg');
  --text-color: #173a2e;
  --title-color: #14492e;
  --subtitle-color: #6c757d;
  --card-bg: #fbfbf8;
}
@media (prefers-color-scheme: dark) {
  :root {
    --background-pattern: url('~assets/patterns/islamic-pattern-dark.svg');
    --text-color: #e0e0e0;
    --title-color: #e0e0e0;
    --subtitle-color: #b0b0b0;
    --card-bg: #333;
  }
}

/* Page-level sizing variables to keep font sizes even and consistent */
.islamic-design {
  --quran-base-size: 18px; /* adjust this to scale the whole page */
  font-size: var(--quran-base-size);
}

/* Make the main reading card fluid and use available horizontal space */
.islamic-card {
  max-width: none; /* allow the card to expand */
  width: calc(100% - 3rem);
  margin-left: 1.5rem;
  margin-right: 1.5rem;
  padding: 1.6rem 2rem;
}

@media (min-width: 1400px) {
  .islamic-card {
    width: calc(100% - 6rem);
    margin-left: 3rem;
    margin-right: 3rem;
    padding: 2rem 3rem;
  }
}

/* Normalize Arabic font sizing to be consistent across elements */
.ayah-paragraph,
.arabic-text,
.verse,
.sura-name,
.bismillah {
  /* use rem so changes to --quran-base-size scale everything */
  font-size: 1.8rem; /* relative to page font-size */
}
.ayah-paragraph {
  line-height: 1.72; /* relative to font-size for consistent rhythm */
}

/* Bookmarks: rounded, encapsulating appearance for chips and list items */
.bookmarks-panel .q-chip,
.sura-controls .q-chip {
  border-radius: 999px;
  padding: 0.22rem 0.7rem;
  background: rgba(20, 73, 46, 0.06);
  color: var(--title-color);
  box-shadow: none;
  margin: 0.18rem 0.12rem;
}

.bookmarks-panel q-item,
.bookmarks-panel .q-item {
  border-radius: 12px;
  padding: 0.35rem 0.6rem;
}

.bookmarks-panel .bookmark-selected,
.bookmarks-panel q-item.bookmark-selected {
  background: linear-gradient(90deg, rgba(202, 161, 75, 0.12), rgba(202, 161, 75, 0.06));
  box-shadow: 0 2px 8px rgba(20, 73, 46, 0.06);
  border-radius: 12px;
}

/* Ensure chips in the top menu also appear rounded and encapsulating */
.sura-controls q-chip,
.sura-controls .q-chip {
  border-radius: 999px;
}

/* Make verse medallions a little subtler on wide screens */
@media (min-width: 1024px) {
  .aya-inline .verse-num {
    width: 24px;
    height: 24px;
    font-size: 11px;
    margin-inline-start: 0.42rem;
  }
}

/* Small screens: slightly reduce paragraph font to fit comfortably */
@media (max-width: 480px) {
  .ayah-paragraph,
  .arabic-text,
  .verse {
    font-size: 1.35rem;
    line-height: 1.6;
  }
  .islamic-card {
    width: calc(100% - 1rem);
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    padding: 1rem;
  }
}
</style>

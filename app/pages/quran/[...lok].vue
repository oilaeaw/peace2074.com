<script lang="ts" setup>
const $q = useQuasar()
const q2p = useQ2P()
const bookStore = useBookmarksStore()
const { t } = useI18n()
const appName = computed(() => t('general.SiteTitle'))
const route = useRoute()
// const router = useRouter({
//   scrollBehavior(to, from) {
//     if (from !== to && to.hash)
//       return { el: to.hash }
//   },
// })
const currentPath = ref(route.hash)
const lok = ref(Number(route.params.lok) || 1)
q2p.setIndex(lok.value)
const Quran = computed(() => q2p.GetQ)
const sura = computed(() => q2p.GetSura)
const bookmarks = computed(() => bookStore.bookmarks)
const PageTite = computed(() => `${appName.value} - ${sura.value.id}:${sura.value.name}`)

function navigateToHash(hash: string) {
  if (!hash)
    return
  if (isClient) {
    const validHash = `#id_${hash.replace(/^#/, '')}`
    const element = document.getElementById(validHash)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    else {
      console.warn(`Element with hash ${validHash} not found.`)
    }
  }
}

function updateCurrentPath() {
  currentPath.value = route.hash
}

watchEffect(() => {
  if (+route.params.lok) {
    lok.value = Number(route.params.lok)
    q2p.setIndex(+route.params.lok)
  }
})

useHead({
  title: PageTite,
  appDescription: appName,
  ogTitle: PageTite,
  ogDescription: appName,
})

onMounted(() => {
  if (isClient) {
    window.addEventListener('hashchange', updateCurrentPath)
    if (!Quran.value || !Quran.value.length) {
      console.error('Holybook data is not loaded. Please check the data source.')
    }
  }
  bookStore.fetchBookmarks()
})

onUnmounted(() => {
  if (isClient) {
    window.removeEventListener('hashchange', updateCurrentPath)
  }
})

function saveBookmark(bm: string) {
  if (bm) {
    useBookmarksStore().createBookmark(bm)
    updateCurrentPath()
    $q.notify({ message: 'Bookmark saved!', type: 'positive' })
  }
}

function deleteBookmark(bm: string) {
  bookStore.deleteBookmark(bm)
  $q.notify({ message: 'Bookmark removed!', type: 'negative' })
}
</script>

<template>
  <KeepAlive>
    <client>
      <q-page padding class="rtl islamic-design">
        <div class="q-gutter-md" column>
          <q-card class="text-md islamic-card">
            <q-card-section class="sura-info">
              <h1 class="islamic-title">
                {{ t("pages.quran.sura.name") }}: {{ sura.name }}
              </h1>
              <h5 class="islamic-subtitle">
                {{ t("pages.quran.sura.id") }}: {{ sura.id }}
              </h5>
              <p class="islamic-text">
                {{ t("pages.quran.sura.totverses") }}: {{ sura.total_verses }}
              </p>
              <p class="islamic-text">
                {{ t("pages.quran.sura.location") }}: {{ sura.type }}
              </p>
            </q-card-section>

            <q-card-section>
              <h3 class="islamic-section-title">
                {{ t("pages.quran.sura.bookmark") }}
              </h3>
              <div class="bookmarks">
                <div v-for="b in bookmarks" :key="b" class="bookmark-item">
                  <a :href="b" class="islamic-link" @click.prevent="navigateToHash(b)">{{ b }}</a>
                  <q-btn flat dense icon="delete" color="negative" @click="deleteBookmark(b)" />
                </div>
              </div>
            </q-card-section>

            <q-card v-if="sura" class="q-mt-xs islamic-card">
              <q-card-section>
                <h3 class="islamic-section-title">
                  {{ t("pages.quran.sura.name") }}
                </h3>
              </q-card-section>
              <q-scroll-observable
                visible
                :thumb-style="thumbStyle"
                style="height: 200px"
                class="col"
                @scroll="onScroll"
              >
                <q-card-section>
                  <div class="verse capitalize">
                    <section
                      v-for="aya in sura.ayat"
                      :id="`${sura.id}_${aya.verse}`"
                      :key="aya.verse"
                      class="islamic-verse"
                      @dblclick="saveBookmark(`${sura.id}_${aya.verse}`)"
                      @click.prevent="navigateToHash(`${sura.id}_${aya.verse}`)"
                    >
                      <span class="islamic-ayat">
                        {{ aya.text }}
                        <q-chip class="islamic-chip bg-green-5">
                          {{ aya.verse }}
                        </q-chip>
                      </span>
                    </section>
                  </div>
                </q-card-section>
              </q-scroll-observable>
            </q-card>
          </q-card>
        </div>
      </q-page>
    </client>
  </KeepAlive>
</template>

<style lang="scss" scoped>
.q-page {
  height: var(--vh);
  width: var(--vw);
  display: flex;
  flex-direction: column;
}

.islamic-design {
  background: var(--background-pattern);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: var(--vh);
  width: var(--vw);
  color: var(--text-color);
}

.islamic-title {
  font-family: 'Amiri', serif;
  font-size: 2.5rem;
  color: var(--title-color);
  text-align: center;
  margin-bottom: 1rem;
}

.islamic-subtitle {
  font-family: 'Amiri', serif;
  font-size: 1.5rem;
  color: var(--subtitle-color);
  text-align: center;
  margin-bottom: 1rem;
}

.islamic-text {
  font-family: 'Amiri', serif;
  font-size: 1.2rem;
  color: var(--text-color);
  text-align: center;
  margin-bottom: 0.5rem;
}

.islamic-section-title {
  font-family: 'Amiri', serif;
  font-size: 1.8rem;
  color: var(--title-color);
  text-align: center;
  margin-bottom: 1rem;
}

.islamic-link {
  font-family: 'Amiri', serif;
  color: var(--link-color);
  text-decoration: none;
  border: 1px solid var(--link-border-color);
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  display: inline-block;
  margin: 0.2rem;
}

.islamic-link:hover {
  background-color: var(--link-hover-bg);
  color: var(--link-hover-color);
}

.islamic-card {
  border: 1px solid var(--card-border);
  border-radius: 10px;
  padding: 1rem;
}

.islamic-verse {
  font-family: 'Amiri', serif;
  font-size: 1.5rem;
  color: var(--text-color);
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--verse-border);
}

.islamic-ayat {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.islamic-chip {
  font-family: 'Amiri', serif;
  font-size: 1rem;
  color: var(--chip-text-color);
  background-color: var(--chip-bg);
}

/* Light Mode Variables */
:root {
  --background-pattern: url('/assets/patterns/islamic-pattern-light.svg');
  --text-color: #155724;
  --title-color: #155724;
  --subtitle-color: #6c757d;
  --link-color: #155724;
  --link-border-color: #155724;
  --link-hover-bg: #155724;
  --link-hover-color: #fff;
  --card-bg: #f9f9f9;
  --card-border: #155724;
  --verse-border: #ddd;
  --chip-text-color: #fff;
  --chip-bg: #28a745;
}

/* Dark Mode Variables */
@media (prefers-color-scheme: dark) {
  :root {
    --background-pattern: url('/assets/patterns/islamic-pattern-dark.svg');
    --text-color: #e0e0e0;
    --title-color: #e0e0e0;
    --subtitle-color: #b0b0b0;
    --link-color: #e0e0e0;
    --link-border-color: #e0e0e0;
    --link-hover-bg: #e0e0e0;
    --link-hover-color: #000;
    --card-bg: #333;
    --card-border: #444;
    --verse-border: #555;
    --chip-text-color: #000;
    --chip-bg: #e0e0e0;
  }
}
</style>

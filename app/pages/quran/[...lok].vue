<script lang="ts" setup>
const $q = useQuasar()
const q2p = useQ2P()
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
const Quran = computed(() => q2p.GetQ)
const sura = computed(() => q2p.GetSura)
const PageTite = computed(() => `${appName.value} - ${sura.value.id}:${sura.value.name}`)
const router = useRouter()
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
    q2p.setIndex(lok.value) // Use the local lok ref for cohesion
  }
})

useHead({
  title: PageTite,
  appDescription: appName,
  ogTitle: PageTite,
  ogDescription: appName,
})

function goToBakara() {
  router.push('/quran/2')
}

function goToNextSura() {
  if (lok.value < Quran.value.length) {
    router.push(`/quran/${lok.value + 1}`)
  }
}

onMounted(() => {
  if (isClient) {
    window.addEventListener('hashchange', updateCurrentPath)
    if (!Quran.value || !Quran.value.length) {
      console.error('Holybook data is not loaded. Please check the data source.')
    }
    // Keyboard navigation: left/right arrow keys
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        goToNextSura()
      }
      else if (e.key === 'ArrowRight') {
        goToBakara()
      }
    })
  }
})

onUnmounted(() => {
  if (isClient) {
    window.removeEventListener('hashchange', updateCurrentPath)
    // Remove keyboard navigation listener
    window.removeEventListener('keydown', () => {})
  }
})

function saveBookmark(bm: string) {
  if (bm) {
    useBookmarksStore().createBookmark(bm)
    updateCurrentPath()
    $q.notify({ message: 'Bookmark saved!', type: 'positive' })
  }
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
          {{ t('back') }}
        </q-btn>
        <q-slide-transition>
          <q-card v-touch:swipe.left="goToNextSura" v-touch:swipe.right="goToBakara" class="text-md islamic-card">
            <q-card v-if="sura" class="q-mt-xs islamic-card">
              <q-card-section>
                <h1 class="islamic-title sura-hover-details center-sura-title">
                  {{ sura.e_name }} - {{ sura.name }}
                  <span class="sura-details-popup">
                    <span>{{ t('pages.quran.sura.id') }}: {{ sura.id }}</span><br>
                    <span>{{ t('pages.quran.sura.totverses') }}: {{ sura.total_verses }}</span><br>
                    <span>{{ t('pages.quran.sura.location') }}: {{ sura.type }}</span>
                  </span>
                </h1>
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
        </q-slide-transition>
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
  width: 100%;
  margin-left: auto;
  margin-right: auto;
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

.back-btn {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  align-self: flex-start;
  z-index: 2;
}

.center-sura-title {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  text-align: center;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.sura-hover-details {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.sura-details-popup {
  display: none;
  position: absolute;
  right: 50%;
  top: 110%;
  background: var(--card-bg, #fff);
  color: var(--text-color, #155724);
  border: 1px solid var(--card-border, #155724);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0.7rem 1.2rem;
  font-size: 1.1rem;
  z-index: 10;
  min-width: 180px;
  text-align: right;
  white-space: pre-line;
}

.sura-hover-details:hover .sura-details-popup {
  display: block;
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

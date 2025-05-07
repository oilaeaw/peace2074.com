<script lang="ts" setup>
import { useHead, useI18n } from '#imports'
import { AlFateha } from '../../constants/'

const $q = useQuasar()
// const note = useNote()
const q2p = useQ2P()
const { t } = useI18n()
const appName = computed(() => t('general.SiteTitle'))
let ignoreSource
const route = useRoute()
const router = useRouter({
  scrollBehavior(to: any, from: string) {
    if (from !== to && to.hash)
      return { el: to.hash }
  },
})
const currentPath = ref(route.hash)

router.beforeEach((to, from, next) => {
  if (isClient && to.hash)
    document.querySelector(to.hash)?.scrollIntoView()
  next()
})
const position = ref()
const lok = ref(Number(route.params.lok) || 1)
q2p.setIndex(lok.value)
const Quran = computed(() => q2p.GetQ)
const sura = computed(() => q2p.GetSura)
const bookmarks = ref([])
const PageTite = computed(() => `${appName.value} - ${sura.value.id}:${sura.value.name}`)
const options = computed(() =>
  Quran.value.map(Single => ({
    name: `${Single.id}-${Single.name}`,
    value: Single.id,
  })),
)
function onScroll(source, position) {
  if (position) {
    position.value = position
  }
  if (ignoreSource === source) {
    ignoreSource = null
  }
}
function findHashtags() {
  const regexp = /\B#\w{2,}\b/g
  const result = route.hash.match(regexp)
  if (result) {
    bookmarks.value.push(result)
  }
  else {
    return false
  }
}
watchEffect(() => {
  if (+route.params.lok) {
    lok.value = Number(route.params.lok)
    q2p.setIndex(+route.params.lok)
  }
  else {
    if (+route.params.lok)
      q2p.setIndex(+route.params.lok)
  }
})
const anchor: Ref<HTMLElement | null> = ref(null)
const sectionRefEl = ref<HTMLElement | null>(null)

function saveBookmark(bm: string) {
  if (bm) {
    anchor.value = ref(bm)
    bookmarks.value.push(anchor)
    updateCurrentPath()
    $q.notify({ message: 'saved!', type: 'positive' })
  }
}
function updateCurrentPath() {
  currentPath.value = route.hash
}

const currentView = computed(() => {
  return router.routes[currentPath.value.slice(1) || '/'] || NotFound
})
function highlightWords(text: strig[]) {
  return text
  // if (text === ' ')
  //   return
  // if (text.length < 4)
  //   return text
  // // const splits = text.split(' ')
  // return text.map(wrd => wrd.replace(/ٱللَّهُ/g, `<span class="inline-block bg-golded-8">${text}</span>`))
}
position.value = currentView
function navigateToHash(hash: string) {
  if (!hash)
    return
  if (isClient) {
    const validHash = `#id_${hash.replace(/^#/, '')}` // Prefix hash with 'id-' to make it valid
    const element = document.getElementById(validHash)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    else {
      console.warn(`Element with hash ${validHash} not found.`)
    }
  }
}

function scrollTo(v: string) {
  const view = ref()
  if (isClient)
    view.value = document.getElementById(`id_${v}`) // Prefix ID with 'id-' to make it valid
  if (view.value)
    view.value?.scrollIntoView({ behavior: 'smooth' })
}

watch(lok, (current: number) => {
  q2p.setIndex(current)
  router.replace({ params: { lok: current } })
})

useHead({
  title: PageTite,
  appDescription: appName,
  ogTitle: PageTite,
  ogDescription: appName,
})

const hideScroll = ref(false)

onMounted(() => {
  if (isClient) {
    window.addEventListener('hashchange', updateCurrentPath)
    findHashtags()
    if (!Quran.value || !Quran.value.length) {
      console.error('Holybook data is not loaded. Please check the data source.')
    }
  }
})

onUnmounted(() => {
  if (isClient) {
    window.removeEventListener('hashchange', updateCurrentPath)
  }
})
</script>

<template>
  <KeepAlive>
    <client>
      <q-page padding class="rtl">
        <div class="q-gutter-md" column>
          <q-card class="text-md">
            <q-card-section>
              <q-btn
                v-if="hideScroll"
                color="yellow-7"
                mini
                rounded
                icon="info"
                label="Hide"
                @click.prevent="hideScroll = false"
              />
              <q-btn
                v-else
                color="yellow-7"
                mini
                rounded
                icon="info"
                label="Show"
                @click.prevent="hideScroll = true"
              />
            </q-card-section>
            <q-card-section v-if="hideScroll" class="pcs block">
              <VueScrollPicker v-model="lok" :options="options" />
              <q-input
                v-if="hideScroll"
                v-model="lok"
                mini
                fab
                type="number"
                :max="114"
                :min="1"
                label="Sura"
              />
            </q-card-section>
            <q-card-section v-if="sura" class="rtl flex">
              <h1 class="text-h3">
                <span class="text-h6">{{ t("pages.quran.sura.name") }}</span>
                {{ sura.name }}
              </h1>
              <h5 class="text-h5">
                <span class="text-h6">{{ t("pages.quran.sura.id") }}</span>: {{ sura.id }}
              </h5>
              <div>
                <h4 class="text-h6 align-left">
                  {{ t("pages.quran.sura.totverses") }}: {{ sura.total_verses }}
                </h4>
                <h4 class="align-left text-h6">
                  {{ t("pages.quran.sura.location") }}: {{ sura.type }}
                </h4>
              </div>
            </q-card-section>

            <q-card-section>
              {{ t("pages.quran.sura.bookmark") }}

              <div class="column">
                <a
                  v-for="b in bookmarks"
                  :key="b.value"
                  :href="b.value"
                  class="cursor-pointer"
                  @click="navigateToHash(b.value)"
                >{{ b.value }}</a>
              </div>
            </q-card-section>

            <q-card v-if="sura" class="q-mt-xs">
              <q-card-section>
                <h3>{{ AlFateha }}</h3>
              </q-card-section>
              <q-scroll-observable
                visible
                :thumb-style="thumbStyle"
                style="height: 200px"
                class="col"
                @scroll="onScroll"
              >
                <q-card-section>
                  <div ref="sectionRefEl" class="just fit verse inline capitalize">
                    <section
                      v-for="aya in sura.ayat"
                      :id="`${sura.id}_${aya.verse}`"
                      :key="aya.verse"
                      :ref="`#id_${aya.verse}`"
                      class="contents text-black"
                      :href="`#id_${aya.verse}`"
                    >
                      <div
                        class="contents"
                        @dblclick.prevent="saveBookmark(`${sura.id}_${aya.verse}`)"
                        @click.prevent="navigateTo(`${sura.id}_${aya.verse}`)"
                        v-html="highlightWords(aya.text)"
                      />
                      <q-chip class="bg-green-5">
                        {{ aya.verse }}
                      </q-chip>
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
.just {
  text-align: justify;
  letter-spacing: 1px;
  font-size: larger;
}

.capitalize::first-letter {
  text-transform: uppercase;
}

.rtl {
  direction: rtl;
}

.ltr {
  direction: ltr;
}

.pcs {
  overflow-x: scroll;
  overflow-y: hidden;
}

.flex {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: nowrap;
}

.verse {
  font-size: 2rem;
}

.align-left {
  text-align: left;
}

.align-right {
  text-align: right;
}
</style>

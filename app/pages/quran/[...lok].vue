<script lang="ts" async setup>
import { useHead, useI18n } from '#imports'

const { $holybook } = useNuxtApp()

export interface AYAT {
  chapter: number
  verse: number
  text: string[]
}
export interface ONE_INTERFACE {
  [k: string]: number | string | AYAT[]
  id: number
  name: string
  e_name: string
  type: string
  total: number
  ayat: AYAT[]
}
const { t } = useI18n()
const appName = t('general.SiteTitle')
const route = useRoute()
const lok: Ref<number> = ref(1)
const bookmarks: Ref<string[]> = ref([])
const router = useRouter({
  scrollBehavior(to: any, _from: string) {
    if (to.hash) {
      return { el: to.hash }
    }
  },
})
const Quran: ONE_INTERFACE[] = $holybook

const sura: Ref<ONE_INTERFACE> = computed(() => Quran[lok.value - 1])
const PageTite: Ref<strig> = computed(() => `${appName}-${sura.value.id}:${sura.value.name}`)
const options = Object.values(Quran).map((Single: ONE_INTERFACE) =>
  ({
    name: `${Single.id}-${Single.name}`,
    value: Single.id,
  }))
watchEffect(() => {
  lok.value = route.params.lok
})
function saveBookmark(bm: number) {
  bookmarks.value.push(bm)
}
function navToHash(hash: string) {
  router.go(hash)
}
watch(
  lok,
  (current: number) => {
    router.replace({ params: { lok: current } })
  },
)
useHead({
  title: PageTite,
  appDescription: appName,
  ogTitle: PageTite,
  ogDescription: appDescription,
})
</script>

<template>
  <KeepAlive>
    <q-page padding class="rtl">
      <div class="q-gutter-md" column>
        <q-card class="text-md">
          <q-card-section class="pcs block">
            <VueScrollPicker v-model="lok" :options="options" />
            <q-input
              v-model="lok"
              fab
              mini
              type="number"
              :max="114"
              :min="1"
              label="Sura"
            />
          </q-card-section>

          <q-card-section class="rtl flex">
            <div>
              <h1 class="text-h3">
                <span class="text-h6">{{ t("pages.quran.sura.name") }}</span>{{ sura.name }}
              </h1>
              <h5 class="text-h5">
                <span class="text-h6">{{ t("pages.quran.sura.id") }}</span>:{{ sura.id }}
              </h5>
            </div>
            <div>
              <h4 class="align-left text-h6">
                {{ t("pages.quran.sura.totverses") }}:{{ sura.total_verses }}
              </h4>
              <h4 class="align-left text-h6">
                {{ t("pages.quran.sura.location") }}:{{ sura.type }}
              </h4>
            </div>
          </q-card-section>
          <q-card-section>
            {{ t("pages.quran.sura.bookmark") }}
            <div class="column">
              <a v-for="b in bookmarks" :key="b" :href="b" @click.prevent="navToHash(b)">{{ b }}</a>
            </div>
          </q-card-section>
        </q-card>
        <q-card class="q-mt-xs">
          <q-card-section>
            <h3>{{ AlFateha }}</h3>
          </q-card-section>
          <q-card-section>
            <div class="just fit verse block capitalize">
              <i v-for="aya in sura.ayat" :key="aya.verse" class="q-mx-sm" :href="`#${aya.verse}`">{{ aya.text }}
                <q-chip class="bg-green text-white">{{ aya.verse }}</q-chip>
                <q-btn
                  dense
                  fab-mini
                  color="yellow"
                  size="4"
                  icon="bookmark"
                  @click="saveBookmark(`#${aya.verse}`)"
                />
              </i>
              <q-space />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-page>
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

// .verse::after {
//     content: '♦';
// }

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

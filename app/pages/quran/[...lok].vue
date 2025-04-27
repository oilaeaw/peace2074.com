<script lang="ts" setup>
// import type { AyaI } from '~~/shared/types'
import { useHead, useI18n } from '#imports'
import { AlFateha } from '../../constants/'

const q2p = useQ2P()

const { t } = useI18n()
const appName = t('general.SiteTitle')

const route = useRoute()
const router = useRouter({
  scrollBehavior(to: any, _from: string) {
    if (to.hash)
      return { el: to.hash }
  },
})

const lok = ref(Number(route.params.lok) || 1)
const Quran = computed(() => q2p.GetQ)
const sura = computed(() => q2p.GetSura)
const bookmarks = ref<string[]>([])

const PageTite = computed(() => `${appName} - ${sura.value.id}:${sura.value.name}`)

const options = computed(() =>
  Quran.value.map(Single => ({
    name: `${Single.id}-${Single.name}`,
    value: Single.id,
  })),
)

watchEffect(() => {
  if (route.params.lok) {
    lok.value = Number(route.params.lok)
    q2p.setIndex(route.params.lok)
  }
})

function saveBookmark(bm: string) {
  if (!Array.isArray(bookmarks.value)) {
    bookmarks.value = []
  }
  bookmarks.value.push(bm)
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
  if (!Quran.value || !Quran.value.length) {
    console.error('Holybook data is not loaded. Please check the data source.')
  }
})
</script>

<template>
  <KeepAlive>
    <q-page padding class="rtl">
      <div class="q-gutter-md" column>
        <q-card class="text-md">
          <q-card-section v-if="hideScroll" class="pcs block">
            <q-btn color="yellow-7" mini rounded icon="info" label="hide" @click.prevent="hideScroll = false" />

            <VueScrollPicker v-model="lok" :options="options" />
            <q-input
              v-model="lok"
              mini
              fab
              type="number"
              :max="114"
              :min="1"
              label="Sura"
            />
          </q-card-section>

          <q-btn v-else color="yellow-7" mini rounded icon="info" label="show" @click.prevent="hideScroll = true" />

          <q-card-section v-if="sura" class="rtl flex">
            <div>
              <h1 class="text-h3">
                <span class="text-h6">{{ t("pages.quran.sura.name") }}</span> {{ sura.name }}
              </h1>
              <h5 class="text-h5">
                <span class="text-h6">{{ t("pages.quran.sura.id") }}</span>: {{ sura.id }}
              </h5>
            </div>
            <div>
              <h4 class="align-left text-h6">
                {{ t("pages.quran.sura.totverses") }}: {{ sura.total }}
              </h4>
              <h4 class="align-left text-h6">
                {{ t("pages.quran.sura.location") }}: {{ sura.type }}
              </h4>
            </div>
          </q-card-section>

          <q-card-section>
            {{ t("pages.quran.sura.bookmark") }}
            <div class="column">
              <a v-for="b in bookmarks" :key="b" :href="b">{{ b }}</a>
            </div>
          </q-card-section>

          <q-card v-if="sura" class="q-mt-xs">
            <q-card-section>
              <h3>{{ AlFateha }}</h3>
            </q-card-section>
            <q-card-section>
              <div class="just fit verse block capitalize">
                <i
                  v-for="aya in sura.ayat"
                  :key="aya.verse"
                  class="q-mx-sm"
                  :href="`#${aya.verse}`"
                >
                  {{ aya.text }}
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

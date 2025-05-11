<script lang="ts" setup>
import { useHead, useI18n } from '#imports'
import { useQuasar } from 'quasar'
import { computed, ref, watchEffect } from 'vue'

const $q = useQuasar()
const q2p = useQ2P()
const { t } = useI18n()
const appName = computed(() => t('general.SiteTitle'))
const route = useRoute()
const router = useRouter({
  scrollBehavior(to, from) {
    if (from !== to && to.hash)
      return { el: to.hash }
  },
})
const currentPath = ref(route.hash)
const lok = ref(Number(route.params.lok) || 1)
q2p.setIndex(lok.value)
const Quran = computed(() => q2p.GetQ)
const sura = computed(() => q2p.GetSura)
const bookmarks = ref([])
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

function saveBookmark(bm: string) {
  if (bm) {
    bookmarks.value.push(bm)
    updateCurrentPath()
    $q.notify({ message: 'saved!', type: 'positive' })
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
                <a
                  v-for="b in bookmarks"
                  :key="b"
                  :href="b"
                  class="islamic-link"
                  @click="navigateToHash(b)"
                >{{ b }}</a>
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
                  <div ref="sectionRefEl" class="verse capitalize">
                    <section
                      v-for="aya in sura.ayat"
                      :id="`${sura.id}_${aya.verse}`"
                      :key="aya.verse"
                      class="islamic-verse"
                      @dblclick.prevent="saveBookmark(`${sura.id}_${aya.verse}`)"
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
.islamic-design {
  background: url('/assets/patterns/islamic-pattern.svg') repeat;
  background-size: cover;
  color: #155724;
}

.islamic-title {
  font-family: 'Amiri', serif;
  font-size: 2.5rem;
  color: #155724;
  text-align: center;
  margin-bottom: 1rem;
}

.islamic-subtitle {
  font-family: 'Amiri', serif;
  font-size: 1.5rem;
  color: #6c757d;
  text-align: center;
  margin-bottom: 1rem;
}

.islamic-text {
  font-family: 'Amiri', serif;
  font-size: 1.2rem;
  color: #155724;
  text-align: center;
  margin-bottom: 0.5rem;
}

.islamic-section-title {
  font-family: 'Amiri', serif;
  font-size: 1.8rem;
  color: #155724;
  text-align: center;
  margin-bottom: 1rem;
}

.islamic-link {
  font-family: 'Amiri', serif;
  color: #155724;
  text-decoration: none;
  border: 1px solid #155724;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  display: inline-block;
  margin: 0.2rem;
}

.islamic-link:hover {
  background-color: #155724;
  color: #fff;
}

.islamic-card {
  background-color: #f9f9f9;
  border: 1px solid #155724;
  border-radius: 10px;
  padding: 1rem;
}

.islamic-verse {
  font-family: 'Amiri', serif;
  font-size: 1.5rem;
  color: #155724;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
}

.islamic-ayat {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.islamic-chip {
  font-family: 'Amiri', serif;
  font-size: 1rem;
  color: #fff;
}
</style>

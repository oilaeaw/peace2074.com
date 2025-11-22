<script lang="ts" setup>
import { ref, computed } from 'vue'
const { t } = useI18n()
import { useMiracleVisualizer, type MiracleOptions } from '~/composables/useMiracleVisualizer'
import { useQ2P } from '~/store/q2p.pinia'

definePageMeta({
  title: 'pages.miracles.pageTitle',
  description: 'meta.miracles',
})

const store = useQ2P()
await store.init()

const options = ref<MiracleOptions>({
  scope: 'book',
  suraIndex: 1,
  verseIndex: 1,
  cellSize: 6,
  gap: 0,
  maxWidth: 1000,
  sampleLimit: 400_000,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

// build a normalized legend map: letter -> color
const legendMap = computed(() => {
  const map = new Map<string, string>()
  const arr = (store as any).LLegend || []
  const stripTashkeel = (s: string) => s ? s.replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, '') : s
  arr.forEach((it: any) => {
    const key = stripTashkeel(String(it.letter)).trim()
    if (!key) return
    map.set(key, it.color || '#000')
  })

  // common normalisations
  if (map.has('ا')) {
    map.set('أ', map.get('ا') as string)
    map.set('إ', map.get('ا') as string)
    map.set('آ', map.get('ا') as string)
  }
  if (map.has('ى')) map.set('ي', map.get('ى') as string)
  if (map.has('ئ')) map.set('ء', map.get('ئ') as string)

  return map
})

function extractTextsFromBook(book: any): string[] {
  const texts: string[] = []
  if (!book || !Array.isArray(book)) return texts
  book.forEach((sura: any) => {
    const ayat = sura?.ayat || sura
    if (!Array.isArray(ayat)) return
    ayat.forEach((v: any) => {
      if (!v) return
      if (typeof v === 'string') texts.push(v)
      else if (typeof v === 'object') {
        if (typeof v.text === 'string') texts.push(v.text)
        else if (Array.isArray(v.text)) texts.push(v.text.join(' '))
        else if (Array.isArray(v.text)) texts.push(v.text.join(' ')) // Handle array of strings
        else if (typeof v.translation === 'string') texts.push(v.translation) // Prioritize translation if text is absent
        else {
          // fallback: look for a string in values
          // Broader fallback: look for the first string value in the object
          for (const val of Object.values(v)) {
            if (typeof val === 'string') { texts.push(val); break }
            if (Array.isArray(val)) { texts.push(val.join(' ')); break }
          }
        }
      }
    })
  })
  return texts
}

const scopeText = computed(() => {
  const book = (store.Book || []) as any[]
  if (options.value.scope === 'book') {
    const texts = extractTextsFromBook(book)
    return texts.join('\n')
  }

  const sIdx = Math.max(1, Math.min(options.value.suraIndex, book.length))
  const sura = book[sIdx - 1]
  if (!sura) return ''

  if (options.value.scope === 'sura') {
    return extractTextsFromBook([sura]).join('\n')
  }

  // verse
  const ayat = sura?.ayat || sura
  if (!Array.isArray(ayat)) return ''
  const v = ayat[Math.max(0, Math.min(options.value.verseIndex - 1, ayat.length - 1))]
  if (!v) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'object') {
    if (typeof v.text === 'string') return v.text
    if (Array.isArray(v.text)) return v.text.join(' ')
    for (const val of Object.values(v)) if (typeof val === 'string') return val
  }
})

const { isDrawing, forceRedraw, downloadPNG } = useMiracleVisualizer(canvasRef, options, legendMap, scopeText)

const scopeOptions = computed(() => ([
  { label: t('pages.miracles.visualizer.scopeWholeBook'), value: 'book' },
  { label: t('pages.miracles.visualizer.scopeSingleSura'), value: 'sura' },
  { label: t('pages.miracles.visualizer.scopeSingleVerse'), value: 'verse' },
]))
</script>

<template>
  <ClientOnly>
    <div class="q-pa-md">
      <MiraclesSwitcher />
      <h3 class="text-h4 q-my-lg">{{ t('pages.miracles.visualizer.heading') }}</h3>
      <div class="row q-gutter-md items-center">
        <QSelect
          v-model="options.scope"
          :options="scopeOptions"
          :label="t('pages.miracles.visualizer.scope')"
          dense
          outlined
          emit-value
          map-options
          style="min-width: 150px"
        />

        <QInput v-model.number="options.suraIndex" type="number" :label="t('pages.miracles.visualizer.sura')" min="1" dense outlined style="width: 100px" />

        <QInput v-model.number="options.verseIndex" type="number" :label="t('pages.miracles.visualizer.verse')" min="1" dense outlined style="width: 100px" />

        <QInput v-model.number="options.cellSize" type="number" :label="t('pages.miracles.visualizer.cellSize')" min="2" max="64" dense outlined style="width: 100px" />

        <QInput v-model.number="options.gap" type="number" :label="t('pages.miracles.visualizer.gap')" min="0" max="8" dense outlined style="width: 100px" />

        <QInput v-model.number="options.maxWidth" type="number" :label="t('pages.miracles.visualizer.maxWidth')" min="200" max="3000" dense outlined style="width: 120px" />

        <q-btn :loading="isDrawing" color="primary" :label="t('pages.miracles.visualizer.draw')" @click="forceRedraw" />
        <q-btn color="secondary" :label="t('pages.miracles.visualizer.downloadPng')" @click="downloadPNG" />
      </div>

      <div class="q-mt-lg relative-position">
        <q-inner-loading :showing="isDrawing">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
        <canvas ref="canvasRef" style="border:1px solid #ddd;max-width:100%"></canvas>
      </div>

      <div style="margin-top:12px;font-size:13px;color:#666">
        {{ t('pages.miracles.visualizer.legendSummary', { count: (store as any).LLegend.length }) }}
      </div>
    </div>
  </ClientOnly>
</template>

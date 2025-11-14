<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick } from '#imports'
import { definePageMeta } from '#imports'

definePageMeta({
  title: 'Miracles — visualiser',
  description: 'Visualise Arabic letters using the q2p legend colours.',
})

const store = useQ2P()
// ensure store has Book data available
store.init()

const scope = ref<'book' | 'sura' | 'verse'>('book')
const suraIndex = ref<number>(1)
const verseIndex = ref<number>(1)
const cellSize = ref<number>(6)
const gap = ref<number>(0)
const maxWidth = ref<number>(1000)
const sampleLimit = ref<number>(400_000) // max cells before sampling

const canvasRef = ref<HTMLCanvasElement | null>(null)

// build a normalized legend map: letter -> color
const legendMap = computed(() => {
  const map = new Map<string, string>()
  const arr = store.Legend || []
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

function stripTashkeel(s = '') {
  return s.replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, '')
}

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
        else {
          // fallback: look for a string in values
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

function getScopeText(): string {
  const book = (store.GetQ || []) as any[]
  if (scope.value === 'book') {
    const t = extractTextsFromBook(book)
    return t.join('\n')
  }

  const sIdx = Math.max(1, Math.min(suraIndex.value, book.length))
  const sura = book[sIdx - 1]
  if (!sura) return ''

  if (scope.value === 'sura') {
    return extractTextsFromBook([sura]).join('\n')
  }

  // verse
  const ayat = sura?.ayat || sura
  if (!Array.isArray(ayat)) return ''
  const v = ayat[Math.max(0, Math.min(verseIndex.value - 1, ayat.length - 1))]
  if (!v) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'object') {
    if (typeof v.text === 'string') return v.text
    if (Array.isArray(v.text)) return v.text.join(' ')
    for (const val of Object.values(v)) if (typeof val === 'string') return val
  }
  return ''
}

function prepareChars(text: string): string[] {
  // split by character, strip tashkeel
  const cleaned = stripTashkeel(text || '')
  return Array.from(cleaned)
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const raw = getScopeText()
  const chars = prepareChars(raw)
  const total = chars.length

  // sampling if too many
  const maxCells = sampleLimit.value
  let step = 1
  if (total > maxCells) step = Math.ceil(total / maxCells)

  const usable = Math.ceil((total + step - 1) / step)
  const cols = Math.max(1, Math.floor(maxWidth.value / (cellSize.value + gap.value)))
  const rows = Math.ceil(usable / cols)

  const w = cols * (cellSize.value + gap.value)
  const h = rows * (cellSize.value + gap.value)

  canvas.width = w
  canvas.height = h
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)

  let index = 0
  for (let i = 0; i < total; i += step) {
    const ch: string = chars[i] || ''
    const color = legendMap.value.get(ch) || legendMap.value.get((ch || '').trim())
    if (color) {
      const cx = (index % cols) * (cellSize.value + gap.value)
      const cy = Math.floor(index / cols) * (cellSize.value + gap.value)
      ctx.fillStyle = color
      ctx.fillRect(cx, cy, cellSize.value, cellSize.value)
    }
    index++
  }
}

function downloadPNG() {
  const canvas = canvasRef.value
  if (!canvas) return
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = `q2p-visual-${scope.value}.png`
  a.click()
}

onMounted(() => {
  // initial draw
  nextTick(draw)
})

watch([scope, suraIndex, verseIndex, cellSize, gap, maxWidth, () => store.Legend], () => {
  nextTick(draw)
}, { deep: true })
</script>

<template>
  <ClientOnly>
    <div class="q-pa-md">
      <MiraclesSwitcher />
      <h3>Quran letter visualiser</h3>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <label>Scope
          <select v-model="scope">
            <option value="book">Whole book</option>
            <option value="sura">Single sura</option>
            <option value="verse">Single verse</option>
          </select>
        </label>

        <label> Sura
          <input type="number" v-model.number="suraIndex" min="1" style="width:80px" />
        </label>

        <label> Verse
          <input type="number" v-model.number="verseIndex" min="1" style="width:80px" />
        </label>

        <label> Cell size
          <input type="number" v-model.number="cellSize" min="2" max="64" style="width:80px" />
        </label>

        <label> Gap
          <input type="number" v-model.number="gap" min="0" max="8" style="width:60px" />
        </label>

        <label> Max width
          <input type="number" v-model.number="maxWidth" min="200" max="3000" style="width:100px" />
        </label>

        <button @click.prevent="draw">Draw</button>
        <button @click.prevent="downloadPNG">Download PNG</button>
      </div>

      <div style="margin-top:12px">
        <canvas ref="canvasRef" style="border:1px solid #ddd;max-width:100%"></canvas>
      </div>

      <div style="margin-top:12px;font-size:13px;color:#666">
        Legend shows {{ store.Legend.length }} letters. Canvas samples letters when the text is large to avoid huge images.
      </div>
    </div>
  </ClientOnly>
</template>

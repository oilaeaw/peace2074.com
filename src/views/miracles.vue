<script lang="ts" setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import useQ2P from '@/composables/useQ2P'
import type { QDBI } from '@shared/types'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const rotationDeg = ref<0 | 90 | 180 | 270>(0)
const ROTATIONS: Array<0 | 90 | 180 | 270> = [0, 90, 180, 270]
const contrastPreset = ref<'classic' | 'dark' | 'high' | 'sepia'>('classic')
const invertContrast = ref(false)
const store = useQ2P()
store.init(0)

const palette = computed(() => {
  const presets = {
    classic: { bg: '#ffffff', fg: '#111111', marker: '#0d47a1' },
    dark: { bg: '#0f172a', fg: '#f8fafc', marker: '#22d3ee' },
    high: { bg: '#000000', fg: '#ffffff', marker: '#ffeb3b' },
    sepia: { bg: '#f5e9d2', fg: '#2f2418', marker: '#8b5e34' },
  } as const

  const selected = presets[contrastPreset.value]
  if (!invertContrast.value) return selected
  return { bg: selected.fg, fg: selected.bg, marker: selected.marker }
})

function stepRotation(direction: 1 | -1) {
  const currentIndex = ROTATIONS.indexOf(rotationDeg.value)
  const nextIndex = (currentIndex + direction + ROTATIONS.length) % ROTATIONS.length
  rotationDeg.value = ROTATIONS[nextIndex]
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key.toLowerCase() !== 'r') return
  event.preventDefault()
  stepRotation(event.shiftKey ? -1 : 1)
}

function countAyatRecursive(node: unknown): number {
  if (!node) return 0

  if (Array.isArray(node)) {
    const isFlatAyatArray = node.every(
      (item: any) => item && typeof item === 'object' && ('verse' in item || 'text' in item),
    )
    if (isFlatAyatArray) return node.length
    return node.reduce((sum, item) => sum + countAyatRecursive(item), 0)
  }

  if (typeof node === 'object') {
    const anyNode = node as Record<string, unknown>
    let total = 0
    for (const key of ['ayat', 'Ayat', 'aya', 'Aya']) total += countAyatRecursive(anyNode[key])
    if (total > 0) return total
    if ('verse' in anyNode || 'text' in anyNode) return 1
  }

  return 0
}

function getSuraAyahCount(sura: any): number {
  if (typeof sura?.total_verses === 'number' && sura.total_verses > 0) return sura.total_verses
  const direct = countAyatRecursive(sura?.ayat ?? sura?.Ayat ?? sura?.aya ?? sura?.Aya)
  if (direct > 0) return direct
  return countAyatRecursive(sura)
}

const book = computed<QDBI[]>(() => {
  const quranList = (store as any)?.GetQ?.value
  return Array.isArray(quranList) ? (quranList as QDBI[]) : []
})

const ayahCounts = computed<number[]>(() => {
  return Array.from({ length: 114 }, (_, idx) => {
    const sura = book.value[idx]
    return getSuraAyahCount(sura)
  })
})

function drawMatrix() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const counts = ayahCounts.value
  const columns = 114
  const rows = Math.max(286, ...counts, 1)

  const dotRadius = 1.9
  const cellW = 6
  const cellH = 4
  const leftPad = 44
  const topPad = 28
  const rightPad = 16
  const bottomPad = 18

  const width = leftPad + rightPad + columns * cellW
  const height = topPad + bottomPad + rows * cellH
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1

  const source = document.createElement('canvas')
  source.width = Math.floor(width * dpr)
  source.height = Math.floor(height * dpr)
  const sourceCtx = source.getContext('2d')
  if (!sourceCtx) return

  sourceCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  sourceCtx.clearRect(0, 0, width, height)

  sourceCtx.fillStyle = palette.value.fg

  // columns = sura(1..114), rows = ayah index(1..max)
  for (let c = 0; c < columns; c++) {
    const totalAyah = counts[c] || 0
    if (totalAyah <= 0) continue

    const x = leftPad + c * cellW + cellW / 2
    for (let r = 0; r < totalAyah; r++) {
      const y = topPad + (rows - 1 - r) * cellH + cellH / 2
      sourceCtx.beginPath()
      sourceCtx.arc(x, y, dotRadius, 0, Math.PI * 2)
      sourceCtx.fill()
    }
  }

  // Tiny markers so orientation is obvious: 1:1 and 2:286
  sourceCtx.fillStyle = palette.value.marker
  const x11 = leftPad + 0 * cellW + cellW / 2
  const y11 = topPad + (rows - 1 - 0) * cellH + cellH / 2
  sourceCtx.beginPath(); sourceCtx.arc(x11, y11, 2.6, 0, Math.PI * 2); sourceCtx.fill()

  const x2286 = leftPad + 1 * cellW + cellW / 2
  const y2286 = topPad + (rows - 1 - (286 - 1)) * cellH + cellH / 2
  sourceCtx.beginPath(); sourceCtx.arc(x2286, y2286, 2.6, 0, Math.PI * 2); sourceCtx.fill()

  const targetW = rotationDeg.value % 180 === 0 ? width : height
  const targetH = rotationDeg.value % 180 === 0 ? height : width

  canvas.style.width = `${targetW}px`
  canvas.style.height = `${targetH}px`
  canvas.width = Math.floor(targetW * dpr)
  canvas.height = Math.floor(targetH * dpr)

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, targetW, targetH)
  ctx.fillStyle = palette.value.bg
  ctx.fillRect(0, 0, targetW, targetH)

  ctx.translate(targetW / 2, targetH / 2)
  ctx.rotate((rotationDeg.value * Math.PI) / 180)
  ctx.drawImage(source, -width / 2, -height / 2, width, height)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

onMounted(async () => {
  await nextTick()
  setTimeout(drawMatrix, 60)
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
})

watch(ayahCounts, () => drawMatrix(), { deep: true })
watch(rotationDeg, () => drawMatrix())
watch(palette, () => drawMatrix(), { deep: true })
</script>

<template>
  <div class="miracles-page" :style="{ background: palette.bg, color: palette.fg }">
    <div class="controls">
      <label for="rotation">Rotation</label>
      <select id="rotation" v-model.number="rotationDeg">
        <option :value="0">0°</option>
        <option :value="90">90°</option>
        <option :value="180">180°</option>
        <option :value="270">270°</option>
      </select>

      <label for="contrast">Contrast</label>
      <select id="contrast" v-model="contrastPreset">
        <option value="classic">Classic</option>
        <option value="dark">Dark</option>
        <option value="high">High</option>
        <option value="sepia">Sepia</option>
      </select>

      <label class="inline-checkbox">
        <input v-model="invertContrast" type="checkbox" />
        Invert
      </label>
    </div>
    <canvas ref="canvasRef" class="matrix-canvas" aria-label="Miracles dot matrix" />
  </div>
</template>

<style scoped>
.miracles-page {
  direction: ltr;
  padding: 10px;
  background: #fff;
  overflow: auto;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.matrix-canvas {
  display: block;
  background: transparent;
}

.inline-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>

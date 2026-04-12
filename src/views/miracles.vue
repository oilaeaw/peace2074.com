<template>
  <q-page class="flex flex-center column q-gutter-md">
    <div class="text-h4">{{ $t('pages.miracles.drawingPadTitle') }}</div>
    <div class="text-subtitle1">
      {{ $t('pages.miracles.drawingPadSubtitle') }}
    </div>

    <div class="drawing-container">
      <canvas
        ref="canvas"
        :width="canvasWidth"
        :height="canvasHeight"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        style="border: 1px solid #ccc; cursor: crosshair"
      ></canvas>
    </div>

    <div class="q-gutter-sm">
      <q-btn
        @click="clearCanvas"
        color="negative"
        :label="$t('pages.miracles.clear')"
      />
      <q-btn
        @click="saveDrawing"
        color="positive"
        :label="$t('pages.miracles.saveDrawing')"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const canvas = ref<HTMLCanvasElement>()
const ctx = ref<CanvasRenderingContext2D>()
const isDrawing = ref(false)
const canvasWidth = 800
const canvasHeight = 600

onMounted(() => {
  if (canvas.value) {
    ctx.value = canvas.value.getContext('2d')!
    ctx.value.lineWidth = 2
    ctx.value.lineCap = 'round'
    ctx.value.strokeStyle = '#000'
  }
})

const startDrawing = (e: MouseEvent) => {
  isDrawing.value = true
  if (ctx.value) {
    ctx.value.beginPath()
    ctx.value.moveTo(e.offsetX, e.offsetY)
  }
}

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !ctx.value) return
  ctx.value.lineTo(e.offsetX, e.offsetY)
  ctx.value.stroke()
}

const stopDrawing = () => {
  isDrawing.value = false
}

const clearCanvas = () => {
  if (ctx.value) {
    ctx.value.clearRect(0, 0, canvasWidth, canvasHeight)
  }
}

const saveDrawing = () => {
  if (canvas.value) {
    const link = document.createElement('a')
    link.download = 'quran-pattern.png'
    link.href = canvas.value.toDataURL()
    link.click()
  }
}
</script>

<style scoped>
.drawing-container {
  display: flex;
  justify-content: center;
}
</style>

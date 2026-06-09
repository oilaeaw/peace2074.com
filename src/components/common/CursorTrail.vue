<template>
  <canvas ref="canvas" class="cursor-canvas" aria-hidden="true" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animFrame: number
let particles: Particle[] = []

const TEXT = 'رحمة الله عليكي يا امي'
const WORDS = [
  // Arabic
  'رحمة', 'الله', 'عليكي', 'يا', 'امي',
  // English
  'May', 'Allah', 'have', 'mercy', 'on', 'you,', 'my', 'mother',
  // ♡
  '♡', '🤍',
]
const COLORS = [
  '#b9f2ff', '#e0f7fa', '#ffffff',
  '#80deea', '#4dd0e1', '#aef0fb',
  '#c8f5ff', '#e8fcff',
]

interface Particle {
  x: number
  y: number
  word: string
  size: number
  color: string
  alpha: number
  vy: number
  vx: number
  rotation: number
  rotationSpeed: number
  life: number
  maxLife: number
  shimmer: number
  shimmerDir: number
}

function resize() {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
}

function spawnParticles(x: number, y: number) {
  const count = 2 + Math.floor(Math.random() * 2)
  for (let i = 0; i < count; i++) {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)]!
    const maxLife = 90 + Math.random() * 60
    particles.push({
      x: x + (Math.random() - 0.5) * 30,
      y: y + (Math.random() - 0.5) * 10,
      word,
      size: 11 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      alpha: 0.9 + Math.random() * 0.1,
      vy: 0.8 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.6,
      rotation: (Math.random() - 0.5) * 0.3,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      life: 0,
      maxLife,
      shimmer: Math.random(),
      shimmerDir: Math.random() > 0.5 ? 1 : -1,
    })
  }
}

function draw() {
  if (!ctx || !canvas.value) return
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  particles = particles.filter(p => p.life < p.maxLife)

  for (const p of particles) {
    p.life++
    p.y += p.vy
    p.x += p.vx
    p.vy += 0.04            // gravity
    p.rotation += p.rotationSpeed

    // shimmer — oscillate brightness
    p.shimmer += 0.06 * p.shimmerDir
    if (p.shimmer > 1 || p.shimmer < 0) p.shimmerDir *= -1

    const progress = p.life / p.maxLife
    // fade in quickly, then fade out
    const alpha = progress < 0.1
      ? (progress / 0.1) * p.alpha
      : p.alpha * (1 - ((progress - 0.1) / 0.9))

    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)

    // diamond glow
    const glow = 4 + p.shimmer * 8
    ctx.shadowColor = p.color
    ctx.shadowBlur = glow

    ctx.globalAlpha = alpha
    ctx.font = `${p.size}px "Noto Naskh Arabic", "Amiri", serif`
    ctx.direction = 'rtl'
    ctx.textAlign = 'center'
    ctx.fillStyle = p.color
    ctx.fillText(p.word, 0, 0)

    ctx.restore()
  }

  animFrame = requestAnimationFrame(draw)
}

function onMouseMove(e: MouseEvent) {
  spawnParticles(e.clientX, e.clientY)
}

onMounted(() => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMouseMove)
  draw()
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', onMouseMove)
  cancelAnimationFrame(animFrame)
})
</script>

<style scoped>
.cursor-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 99999;
}
</style>

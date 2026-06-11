<template>
  <canvas ref="canvas" class="cursor-canvas" aria-hidden="true" />
  <div ref="label" class="cursor-label" aria-hidden="true">{{ blessing }}</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// Reactive blessing text and word list — updates when locale changes
const blessing = computed(() => t('cursorTrail.blessing'))
const blessingWords = computed<string[]>(() => t('cursorTrail.words', [], { returnObjects: true }) as string[])

const canvas = ref<HTMLCanvasElement | null>(null)
const label = ref<HTMLDivElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animFrame: number | null = null
let animating = false
let lastSpawn = 0
const THROTTLE_MS = 30
const MAX_PARTICLES = 80

const COLORS = [
  '#b9f2ff', '#e0f7fa', '#ffffff',
  '#80deea', '#4dd0e1', '#aef0fb',
  '#c8f5ff', '#ffd700', '#ffe066',
  '#fff9c4', '#f8bbd9', '#e1bee7',
]

type ParticleType = 'diamond' | 'text'

interface Particle {
  type: ParticleType
  x: number
  y: number
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
  word?: string
}

let particles: Particle[] = []

function resize() {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
}

function drawDiamond(c: CanvasRenderingContext2D, size: number) {
  c.beginPath()
  c.moveTo(0, -size)
  c.lineTo(size * 0.6, 0)
  c.lineTo(0, size)
  c.lineTo(-size * 0.6, 0)
  c.closePath()
}

function pickWord(): string {
  const words = blessingWords.value
  if (!words?.length) return '♡'
  return words[Math.floor(Math.random() * words.length)]!
}

function spawnParticles(x: number, y: number) {
  if (particles.length >= MAX_PARTICLES) return
  const count = 2 + Math.floor(Math.random() * 3)
  for (let i = 0; i < count; i++) {
    const maxLife = 90 + Math.random() * 70
    const isDiamond = Math.random() < 0.3
    particles.push({
      type: isDiamond ? 'diamond' : 'text',
      x: x + (Math.random() - 0.5) * 28,
      y: y + (Math.random() - 0.5) * 12,
      size: isDiamond ? (5 + Math.random() * 10) : (11 + Math.random() * 7),
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      alpha: 0.82 + Math.random() * 0.18,
      vy: 0.9 + Math.random() * 2.0,
      vx: (Math.random() - 0.5) * 0.8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.07,
      life: 0,
      maxLife,
      shimmer: Math.random(),
      shimmerDir: Math.random() > 0.5 ? 1 : -1,
      word: isDiamond ? undefined : pickWord(),
    })
  }
}

function draw() {
  if (!ctx || !canvas.value) return
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  particles = particles.filter(p => p.life < p.maxLife)

  if (particles.length === 0) {
    animating = false
    animFrame = null
    return
  }

  for (const p of particles) {
    p.life++
    p.y += p.vy
    p.x += p.vx
    p.vy += 0.06
    p.rotation += p.rotationSpeed

    p.shimmer += 0.05 * p.shimmerDir
    if (p.shimmer > 1 || p.shimmer < 0) p.shimmerDir *= -1

    const progress = p.life / p.maxLife
    const alpha = progress < 0.1
      ? (progress / 0.1) * p.alpha
      : p.alpha * (1 - ((progress - 0.1) / 0.9))

    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.shadowColor = p.color
    ctx.shadowBlur = 5 + p.shimmer * 12
    ctx.globalAlpha = alpha

    if (p.type === 'diamond') {
      ctx.rotate(p.rotation)
      ctx.fillStyle = p.color
      drawDiamond(ctx, p.size)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.globalAlpha = alpha * 0.4
      ctx.fillStyle = '#ffffff'
      drawDiamond(ctx, p.size * 0.38)
      ctx.fill()
    } else {
      ctx.font = `${p.size}px "Noto Naskh Arabic", "Georgia", "Amiri", serif`
      ctx.textAlign = 'center'
      ctx.direction = locale.value === 'ar' || locale.value === 'he' ? 'rtl' : 'ltr'
      ctx.fillStyle = p.color
      ctx.fillText(p.word ?? '♡', 0, 0)
    }

    ctx.restore()
  }

  animFrame = requestAnimationFrame(draw)
}

function onMouseMove(e: MouseEvent) {
  if (label.value) {
    label.value.style.left = `${e.clientX + 18}px`
    label.value.style.top = `${e.clientY - 14}px`
    label.value.style.opacity = '1'
  }

  const now = Date.now()
  if (now - lastSpawn < THROTTLE_MS) return
  lastSpawn = now

  spawnParticles(e.clientX, e.clientY)

  if (!animating) {
    animating = true
    animFrame = requestAnimationFrame(draw)
  }
}

// Clear particles when locale changes so old-language words disappear
watch(locale, () => { particles = [] })

onMounted(() => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMouseMove, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', onMouseMove)
  if (animFrame !== null) cancelAnimationFrame(animFrame)
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

.cursor-label {
  position: fixed;
  pointer-events: none;
  z-index: 100000;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 13px;
  font-style: italic;
  color: #ffffff;
  text-shadow:
    0 0 6px #4dd0e1,
    0 0 16px #4dd0e1,
    0 0 30px rgba(77, 208, 225, 0.4);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.25s ease;
  letter-spacing: 0.06em;
  user-select: none;
}
</style>

import { ref, onMounted, onUnmounted, watch, type Ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'

export interface MiracleOptions {
  scope: 'book' | 'sura' | 'verse'
  suraIndex: number
  verseIndex: number
  cellSize: number
  gap: number
  maxWidth: number
  sampleLimit: number
}

export function useMiracleVisualizer(
  canvasRef: Ref<HTMLCanvasElement | null>,
  options: Ref<MiracleOptions>,
  legend: Ref<Map<string, string>>,
  textData: Ref<string>,
) {
  const isDrawing = ref(false)
  const hoveredCell = ref<{ char: string; x: number; y: number } | null>(null)
  let worker: Worker | null = null
  let lastDrawData: {
    cells: { x: number; y: number; color: string; char: string }[]
    width: number
    height: number
  } | null = null

  // --- Drawing function that receives data from the worker ---
  function draw(data: {
    cells: { x: number; y: number; color: string; char: string }[]
    width: number
    height: number
  }) {
    lastDrawData = data // Cache the data for redraws
    const canvas = canvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = data.width
    canvas.height = data.height

    // Clear and draw background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, data.width, data.height)

    // Draw each cell
    for (const cell of data.cells) {
      ctx.fillStyle = cell.color
      ctx.fillRect(cell.x, cell.y, options.value.cellSize, options.value.cellSize)
    }

    // Draw tooltip if a cell is hovered
    if (hoveredCell.value) {
      const { x, y, char } = hoveredCell.value
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
      ctx.fillRect(x + 10, y + 10, 30, 30)
      ctx.fillStyle = 'white'
      ctx.font = '20px Amiri'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(char, x + 25, y + 25)

      // Highlight the hovered cell
      ctx.strokeStyle = 'yellow'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, options.value.cellSize, options.value.cellSize)
    }
  }

  // --- Worker setup and communication ---
  function setupWorker() {
    // Create a worker from an inline script blob
    const workerScript = `
      self.onmessage = (e) => {
        const { text, legend, options } = e.data;
        
        // Helper to strip tashkeel
        const stripTashkeel = (s) => s.replace(/[\\u0610-\\u061A\\u064B-\\u065F\\u06D6-\\u06ED]/g, '');
        const chars = Array.from(stripTashkeel(text || ''));
        const total = chars.length;

        // Sampling
        let step = 1;
        if (total > options.sampleLimit) {
          step = Math.ceil(total / options.sampleLimit);
        }

        const usable = Math.ceil((total + step - 1) / step);
        const cols = Math.max(1, Math.floor(options.maxWidth / (options.cellSize + options.gap)));
        const width = cols * (options.cellSize + options.gap);
        const rows = Math.ceil(usable / cols);
        const height = rows * (options.cellSize + options.gap);

        const cells = [];
        let index = 0;
        for (let i = 0; i < total; i += step) { // This loop was the source of the bug
          const ch = chars[i] || '';
          const color = legend.get(ch) || legend.get((ch || '').trim());
          if (color) {
            const x = (index % cols) * (options.cellSize + options.gap);
            const y = Math.floor(index / cols) * (options.cellSize + options.gap);
            cells.push({ x, y, color, char: ch });
          }
          index++;
        }
        self.postMessage({ cells, width, height });
      };
    `
    const blob = new Blob([workerScript], { type: 'application/javascript' })
    worker = new Worker(URL.createObjectURL(blob))

    worker.onmessage = (e) => {
      draw(e.data)
      isDrawing.value = false
    }

    worker.onerror = (e) => {
      console.error('Worker error:', e)
      isDrawing.value = false
    }
  }

  const debouncedUpdate = useDebounceFn(() => {
    if (!worker || !textData.value) return
    isDrawing.value = true
    worker.postMessage({
      text: textData.value,
      legend: legend.value,
      options: options.value,
    })
  }, 300) // Debounce to avoid excessive updates while user is typing

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return

    setupWorker()
    watch([options, textData], debouncedUpdate, { deep: true, immediate: true })

    // --- Mouse Interaction ---
    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      if (!lastDrawData) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const { cellSize, gap } = options.value
      const fullCellSize = cellSize + gap

      for (const cell of lastDrawData.cells) {
        if (x >= cell.x && x <= cell.x + cellSize && y >= cell.y && y <= cell.y + cellSize) {
          hoveredCell.value = { char: cell.char, x: cell.x, y: cell.y }
          draw(lastDrawData) // Redraw to show tooltip
          return
        }
      }

      // If no cell is hovered, clear the tooltip and redraw
      if (hoveredCell.value) {
        hoveredCell.value = null
        draw(lastDrawData)
      }
    })

    canvas.addEventListener('mouseleave', () => {
      hoveredCell.value = null
      if (lastDrawData) draw(lastDrawData)
    })
  })

  onUnmounted(() => {
    worker?.terminate()
  })

  function downloadPNG() {
    const canvas = canvasRef.value
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `q2p-visual-${options.value.scope}.png`
    a.click()
  }

  return { isDrawing, forceRedraw: debouncedUpdate, downloadPNG, hoveredCell }
}
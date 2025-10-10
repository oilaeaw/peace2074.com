export function useCount() {
  // Start with a deterministic server-side value (0). Assign a random
  // initial value only on the client after mount to avoid SSR hydration
  // mismatches when the value is rendered into the HTML.
  const count = useState('count', () => 0)

  // Delay client-side randomization until after mount so the SSR output
  // matches exactly what was rendered on the server.
  if (import.meta.client) {
    const { onMounted } = from '#imports' as any
    onMounted(() => {
      // Only initialize once if still the server default
      if (count.value === 0) {
        count.value = Math.round(Math.random() * 20)
      }
    })
  }

  function inc() {
    count.value += 1
  }
  function dec() {
    count.value -= 1
  }

  return {
    count,
    inc,
    dec,
  }
}

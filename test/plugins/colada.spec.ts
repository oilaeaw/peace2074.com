import { describe, it, expect } from 'vitest'
// Import the raw plugin factory; we simulate defineNuxtPlugin wrapper.
// Minimal mock nuxtApp for plugin invocation scenarios
function makeNuxtApp(hasVueApp: boolean, hasPinia: boolean) {
  const provides: Record<string, any> = {}
  const nuxtApp: any = {
    provide: (key: string, value: any) => { provides[key] = value },
    vueApp: hasVueApp
      ? {
          config: { globalProperties: hasPinia ? { $pinia: { use: () => {} } } : {} },
        }
      : undefined,
  }
  return nuxtApp
}

describe('Colada client plugin safety', () => {
  it('does not throw when vueApp is missing', async () => {
    ;(globalThis as any).defineNuxtPlugin = (fn: any) => fn
    const { __coladaSetup } = await import('../../app/plugins/Colada.client')
    const nuxtApp = makeNuxtApp(false, false)
    expect(() => __coladaSetup(nuxtApp)).not.toThrow()
  })
  it('does not throw when vueApp exists but $pinia missing', async () => {
    ;(globalThis as any).defineNuxtPlugin = (fn: any) => fn
    const { __coladaSetup } = await import('../../app/plugins/Colada.client')
    const nuxtApp = makeNuxtApp(true, false)
    expect(() => __coladaSetup(nuxtApp)).not.toThrow()
  })
  it('attempts to use pinia when present', async () => {
    ;(globalThis as any).defineNuxtPlugin = (fn: any) => fn
    const { __coladaSetup } = await import('../../app/plugins/Colada.client')
    let used = 0
    const nuxtApp = makeNuxtApp(true, true)
    nuxtApp.vueApp.config.globalProperties.$pinia.use = () => { used++ }
    __coladaSetup(nuxtApp)
    await new Promise(resolve => setTimeout(resolve, 80))
    expect(used).toBeGreaterThan(0)
  })
})

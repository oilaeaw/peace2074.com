import { useNuxtApp } from '#app'
import type CoreClass from '@shared/utils/core'

export function useCore() {
  const nuxt = useNuxtApp()
  return nuxt.$core as typeof import('@shared/utils/core').default
}

export default useCore

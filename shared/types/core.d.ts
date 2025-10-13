import type core from '@shared/utils/core'

declare module '#app' {
  interface NuxtApp {
    $core: typeof core
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $core: typeof core
  }
}

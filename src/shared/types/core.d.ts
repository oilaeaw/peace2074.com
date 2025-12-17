import type core from '@shared/utils/core'

declare module 'vue' {
  interface ComponentCustomProperties {
    $core: typeof core
  }
}

import type { ComponentCustomProperties } from 'vue'

// Minimal Ability interface used in templates
interface TemplateAbility {
  can: (action?: any, subject?: any, field?: any) => boolean
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $ability: TemplateAbility
  }
}

declare global {
  // Allow injection via useNuxtApp().$ability if needed
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window {}
}

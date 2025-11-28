import { useColada } from '@pinia/colada'

export default defineNuxtPlugin(async ({ provide }) => {
  const cstore = useColadaStore()
  
  return {
    provide: {
      colada: cstore,
    },
  }
})

  
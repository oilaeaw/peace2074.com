export default defineNuxtPlugin(async ({ provide }) => {
  const cstore = useColadaStore()

  return {
    provide: {
      colada: cstore,
    },
  }
})

  
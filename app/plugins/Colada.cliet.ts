import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'

export default defineNuxtPlugin((_nuxtApp) => {
  if (import.meta.client) {
    createPinia().use(PiniaColada)
    // install after pinia
    const savedData = localStorage.getItem(StaticName)
    const q2p = useQ2P()
    // app.use(PiniaColada, {
    //   // optional options
    // })
    if (savedData) {
      q2p.setQuran(savedData)
    }
  }
})

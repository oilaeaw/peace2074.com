import VueScrollPicker from 'vue-scroll-picker' // export default is plugin
import 'vue-scroll-picker/style.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueScrollPicker)
})

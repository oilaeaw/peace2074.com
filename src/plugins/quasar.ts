import { App } from 'vue'
import { Quasar, Notify } from 'quasar'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'

export default function registerQuasar(app: App) {
    app.use(Quasar, {
        plugins: { Notify },
    })
}


import { App } from 'vue'
import { Quasar, Notify, Dialog } from 'quasar'
import iconSet from 'quasar/icon-set/material-icons'
import 'quasar/dist/quasar.css'
import '@/assets/material-icons.css'

export default function registerQuasar(app: App) {
    app.use(Quasar, {
        plugins: { Notify, Dialog },
        iconSet,
        config: {
            brand: {
                // Islamic-feeling theme: deep green primary, warm gold secondary
                primary: '#155724',   // used by color="primary"
                secondary: '#e0c46c', // used by color="secondary"
                accent: '#b68929',
            },
        },
    })
}


import { App } from 'vue'
import { Quasar, Notify } from 'quasar'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'

export default function registerQuasar(app: App) {
    app.use(Quasar, {
        plugins: { Notify },
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


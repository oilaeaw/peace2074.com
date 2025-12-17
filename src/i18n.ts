import { createI18n } from 'vue-i18n'
import messages, { en, ar, de, ru } from './locale'

const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: { en, ar, de, ru },
})

export default i18n

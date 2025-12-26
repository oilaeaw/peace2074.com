import { createI18n } from 'vue-i18n'
import messages, { en, ar, de, ru, he } from './locale'

const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: { en, ar, de, ru, he },
})

export default i18n

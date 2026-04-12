import { createI18n } from 'vue-i18n'
import messages, { en, ar, de, es, ru, he, it, tr } from './locale'

const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages: { en, ar, de, es, ru, he, it, tr },
})

export default i18n

import { createI18n } from 'vue-i18n'
import messages, { en, ar, de, es, fa, ru, he, it, tr, uz } from './locale'

const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages: { en, ar, de, es, fa, ru, he, it, tr, uz },
})

export default i18n

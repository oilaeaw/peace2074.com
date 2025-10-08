import ar_raw from './ar.json' assert { type: 'json' }
import de_raw from './de.json' assert { type: 'json' }
import en_raw from './en.json' assert { type: 'json' }
import ru_raw from './ru.json' assert { type: 'json' }

const en: typeof en_raw = en_raw
const ar: typeof ar_raw = ar_raw
const de: typeof de_raw = de_raw
const ru: typeof ru_raw = ru_raw

export { en }
export { ar }
export { de }
export { ru }

export default {
  ar,
  en,
  de,
  ru,
}

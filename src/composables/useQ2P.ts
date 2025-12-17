import { ref, computed } from 'vue'
import hdetails from '@/shared/data/chapters/en.json'
import hbook from '@/shared/data/quran.json'

type Aya = { verse: number; text: string; translation?: string }
type Sura = { id: number; name: string; e_name?: string; total_verses?: number; type?: string; ayat?: Aya[] }

const quranData = ref<Sura[]>([])
const currentIndex = ref<number>(1)
const currentLang = ref<string>('en')

export default function useQ2P() {
    async function init(index = 1, lang = 'en') {
        currentLang.value = lang
        try {
            // Prefer server API for normalized data. If index provided, fetch single sura; else fetch list.
            if (!Number.isNaN(Number(index)) && Number(index) > 0) {
                const res = await fetch(`/api/quran/${Number(index)}`)
                if (res.ok) {
                    const payload = await res.json()
                    const sura = (payload && payload.sura) || null
                    if (sura) {
                        // Ensure list contains sura for consistency
                        const existing = quranData.value.find(s => s.id === Number(index))
                        if (existing) Object.assign(existing, sura)
                        else quranData.value.push(sura)
                    }
                } else {
                    throw new Error(`API ${res.status}`)
                }
            } else {
                const res = await fetch('/api/quran')
                if (res.ok) quranData.value = await res.json()
                else throw new Error(`API ${res.status}`)
            }
        } catch (e) {
            // Fallback: keep existing data or empty
            console.warn('API load failed, falling back to local data', e)
            try {
                // Build a minimal sura list from shipped data
                const ready: any[] = []
                Object.keys(hdetails as any).forEach((key) => {
                    const id = Number(key)
                    const metaSample = ((hdetails as any)[key] || [])[0] as any
                    const qr = ((hbook as any)[key] || []) as Array<any>
                    ready.push({
                        id,
                        name: String(metaSample?.suraName || metaSample?.name || ''),
                        e_name: String(metaSample?.translation || metaSample?.suraName || ''),
                        type: String(metaSample?.type || ''),
                        total_verses: qr.length,
                        ayat: qr,
                    })
                })
                quranData.value = ready
            } catch (ex) {
                console.warn('Failed to load local fallback data', ex)
            }
        }
        setIndex(index)
    }

    function setIndex(i: number) {
        currentIndex.value = Math.max(1, Number(i) || 1)
    }

    const GetQ = computed(() => quranData.value)
    const GetSura = computed(() => quranData.value.find(s => s.id === currentIndex.value))

    return {
        init,
        setIndex,
        GetQ,
        GetSura,
        currentLang,
    }
}

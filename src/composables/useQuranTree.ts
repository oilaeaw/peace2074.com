import { ref, computed } from 'vue'
import {
    QuranVerseTree,
    getQuranVerseTree,
    initQuranVerseTree,
    createVerseId,
    type QuranVerse,
} from '@/shared/utils/quran-verse-tree'

/**
 * Composable for accessing Quran verses via Red-Black Tree
 * Provides O(log n) lookup for any verse by sura:aya
 */
export function useQuranTree() {
    const isLoaded = ref(false)
    const isLoading = ref(false)
    const error = ref<Error | null>(null)

    /**
     * Initialize the tree (lazy-loads data on first call)
     */
    async function init(): Promise<QuranVerseTree> {
        if (isLoaded.value) return getQuranVerseTree()

        isLoading.value = true
        error.value = null

        try {
            const tree = await initQuranVerseTree()
            isLoaded.value = true
            return tree
        } catch (e) {
            error.value = e instanceof Error ? e : new Error(String(e))
            throw error.value
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Get a specific verse by sura and aya number
     */
    async function getVerse(suraNumber: number, ayaNumber: number): Promise<QuranVerse | null> {
        await init()
        return getQuranVerseTree().findVerse(suraNumber, ayaNumber)
    }

    /**
     * Get all verses for a sura
     */
    async function getSura(suraNumber: number): Promise<QuranVerse[]> {
        await init()
        return getQuranVerseTree().getSura(suraNumber)
    }

    /**
     * Get verses in a range
     * @param startSura Start sura number
     * @param startAya Start aya number
     * @param endSura End sura number
     * @param endAya End aya number
     */
    async function getRange(
        startSura: number,
        startAya: number,
        endSura: number,
        endAya: number
    ): Promise<QuranVerse[]> {
        await init()
        const startId = createVerseId(startSura, startAya)
        const endId = createVerseId(endSura, endAya)
        return getQuranVerseTree().getRange(startId, endId)
    }

    /**
     * Get the total verse count
     */
    async function getVerseCount(): Promise<number> {
        await init()
        return getQuranVerseTree().getSize()
    }

    /**
     * Get first verse in the Quran
     */
    async function getFirstVerse(): Promise<QuranVerse | null> {
        await init()
        return getQuranVerseTree().getMin()
    }

    /**
     * Get last verse in the Quran
     */
    async function getLastVerse(): Promise<QuranVerse | null> {
        await init()
        return getQuranVerseTree().getMax()
    }

    /**
     * Direct tree access (after initialization)
     */
    const tree = computed(() => (isLoaded.value ? getQuranVerseTree() : null))

    return {
        // State
        isLoaded,
        isLoading,
        error,
        tree,

        // Methods
        init,
        getVerse,
        getSura,
        getRange,
        getVerseCount,
        getFirstVerse,
        getLastVerse,
    }
}

export type { QuranVerse }

import { defineStore } from 'pinia'
import { recordReaderStat, fetchReaderStats, fetchReaderAnalytics } from './services/index'
import { useAuthStore } from './auth.pinia'

export interface ReaderStat {
    id: string
    userId: string
    sura: number
    timestamp: string
}

export interface ReadingAnalytics {
    totalReadings: number
    uniqueSuras: number
    mostRead: Array<{ sura: number; count: number }>
    surahCounts: Record<number, number>
}

export const useReaderStatsStore = defineStore('readerStats', {
    state: () => ({
        stats: [] as ReaderStat[],
        analytics: null as ReadingAnalytics | null,
        loading: false,
        error: null as string | null,
    }),

    getters: {
        // Get all stats sorted by timestamp
        allStats: (state) => state.stats,

        // Get stats for a specific surah
        getStatsBySura: (state) => (sura: number) => {
            return state.stats.filter(s => s.sura === sura)
        },

        // Get today's reading stats
        todayStats: (state) => {
            const today = new Date().toISOString().split('T')[0]
            return state.stats.filter(s => s.timestamp.startsWith(today))
        },

        // Get unique surahs read
        surasRead: (state) => {
            return [...new Set(state.stats.map(s => s.sura))]
        },

        // Check if user has read a specific surah
        hasReadSura: (state) => (sura: number) => {
            return state.stats.some(s => s.sura === sura)
        },
    },

    actions: {
        /**
         * Record that the user read/viewed a surah
         */
        async recordReading(sura: number) {
            const auth = useAuthStore()
            const userId = auth.user?.id || auth.user?._id

            // Only record if authenticated
            if (!userId) {
                console.log('Not recording stat: user not authenticated')
                return { ok: false, error: 'Not authenticated' }
            }

            try {
                const result = await recordReaderStat(sura)

                if (result.ok && result.stat) {
                    // Add the new stat to local state
                    this.stats.unshift(result.stat)
                    return { ok: true }
                }

                return { ok: false, error: result.error || 'Failed to record' }
            } catch (e) {
                console.error('Failed to record reading:', e)
                return { ok: false, error: String(e) }
            }
        },

        /**
         * Fetch all reading stats for the current user
         */
        async fetchStats() {
            const auth = useAuthStore()
            const userId = auth.user?.id || auth.user?._id

            if (!userId) {
                this.stats = []
                return
            }

            this.loading = true
            this.error = null

            try {
                const result = await fetchReaderStats()

                if (result.ok && Array.isArray(result.stats)) {
                    this.stats = result.stats
                } else {
                    this.error = result.error || 'Failed to fetch stats'
                }
            } catch (e) {
                console.error('Failed to fetch stats:', e)
                this.error = String(e)
            } finally {
                this.loading = false
            }
        },

        /**
         * Fetch reading analytics
         */
        async fetchAnalytics() {
            const auth = useAuthStore()
            const userId = auth.user?.id || auth.user?._id

            if (!userId) {
                this.analytics = null
                return
            }

            this.loading = true
            this.error = null

            try {
                const result = await fetchReaderAnalytics()

                if (result.ok && result.analytics) {
                    this.analytics = result.analytics
                } else {
                    this.error = result.error || 'Failed to fetch analytics'
                }
            } catch (e) {
                console.error('Failed to fetch analytics:', e)
                this.error = String(e)
            } finally {
                this.loading = false
            }
        },

        /**
         * Clear all stats (e.g., on logout)
         */
        clearStats() {
            this.stats = []
            this.analytics = null
            this.error = null
        },
    },
})

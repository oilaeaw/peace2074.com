import { computed, ref } from 'vue'
import core from '@shared/utils/core'

export default function useCore() {
    const online = ref(true)
    const isDark = ref(false)
    const preferredDark = computed(() => isDark.value)

    return {
        get: core.get.bind(core),
        set: core.set.bind(core),
        remove: core.remove.bind(core),
        has: core.has.bind(core),
        getNested: core.getNested.bind(core),
        setNested: core.setNested.bind(core),
        online,
        isDark,
        preferredDark,
    }
}

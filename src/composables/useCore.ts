import { ref, computed } from 'vue'

export default function useCore() {
    const online = ref(true)
    const isDark = ref(false)
    const preferredDark = computed(() => isDark.value)

    return {
        online,
        isDark,
        preferredDark,
    }
}

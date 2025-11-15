import { defineAbility } from '@casl/ability'
import { abilitiesPlugin } from '@casl/vue'
import { defineAbilitiesFor } from '~/server/utils/abilities'

export default defineNuxtPlugin((nuxtApp) => {
  const { data: session } = useAuth()

  const ability = defineAbilitiesFor(session.value?.user as any)

  nuxtApp.vueApp.use(abilitiesPlugin, ability)

  // Update abilities whenever the session changes
  watch(session, () => ability.update(defineAbilitiesFor(session.value?.user as any).rules), { deep: true })
})
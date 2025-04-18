<script lang="ts" setup>
const quran = ref(null)
const names = ref<{ names: string }[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null) // Add error message state

onMounted(async () => {
  try {
    const { data } = await useFetch('/api/quran/', {
      headers: {
        Accept: 'application/json',
      },
    })

    if (data?.value) {
      quran.value = data.value
      names.value = quran.value.map((v: { name: string }) => ({ names: v.name }))
    }
    else {
      throw new Error('No data received from API')
    }
  }
  catch (error) {
    console.error('Error fetching Quran data:', error)
    errorMessage.value = 'Failed to load Quran data. Please try again later.'
  }
  finally {
    isLoading.value = false
  }
})

const router = useRouter()

function navToLok(lok: number) {
  const advanced = lok + 1
  router.replace(`/quran/${advanced}`)
}
</script>

<template>
  <div v-if="isLoading" class="q-mt-xl q-pt-lg text-center">
    <q-skeleton type="QInput" class="fit" />
  </div>
  <div v-else-if="errorMessage" class="q-mt-xl q-pt-lg text-center">
    <p>{{ errorMessage }}</p>
  </div>
  <ol v-else-if="quran" class="column q-mt-xl q-pt-lg text-center">
    <nuxt-link
      v-for="(item, index) in names"
      :key="item.names"
      class="q-mx-xs cursor-pointer text-center"
      @click="navToLok(index)"
    >
      {{ index + 1 }}-{{ item.names }}
    </nuxt-link>
  </ol>
  <div v-else class="q-mt-xl q-pt-lg text-center">
    <p>No data available</p>
  </div>
</template>

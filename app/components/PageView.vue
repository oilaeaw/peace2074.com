<script setup lang="ts">
// import { useTimeAgo } from '@vueuse/core'
// import moment from 'moment'

// const d = new Date()

const { data } = await useFetch('/api/pageview')
const time = useTimeAgo(() => data.value?.startAt ?? Date.now())
// const date = `__DATE__`
// const timeAgo = useTimeAgo(date)
// const BuildTime: string = moment(date).format('ddd MMM DD, YYYY [at] HH:mm')
</script>

<template>
  <div text-gray:80>
    <span text-gray font-500>{{ data?.pageview }}</span>
    page views since
    <span text-gray>{{ time }}</span>
  </div>
</template>

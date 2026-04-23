<template>
  <Frame>
    <Page>
      <ActionBar>
        <Label text="Peace2074" />
      </ActionBar>

      <GridLayout rows="auto,auto" verticalAlignment="center">
        <Label
          row="0"
          text="Peace2074"
          textAlignment="center"
          fontSize="28"
          color="#0A6B44"
        />
        <Label
          row="1"
          :text="message"
          textAlignment="center"
          fontSize="16"
          color="#4B5563"
        />
      </GridLayout>
    </Page>
  </Frame>
</template>

<script setup lang="ts">
import { computed } from 'nativescript-vue'

const message = computed(() => 'The Noble Quran')
</script>

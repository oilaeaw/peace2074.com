<template>
  <Frame>
    <Page actionBarHidden="true">
      <GridLayout>
        <WebView
          :key="webViewKey"
          :src="appUrl"
          @loadStarted="onLoadStarted"
          @loadFinished="onLoadFinished"
        />

        <GridLayout
          v-if="isLoading"
          rows="auto,auto"
          class="overlay"
          verticalAlignment="center"
          horizontalAlignment="center"
        >
          <ActivityIndicator
            row="0"
            busy="true"
            width="36"
            height="36"
            color="#0A6B44"
          />
          <Label
            row="1"
            text="Loading PEACE2074..."
            class="overlay-text"
            textAlignment="center"
          />
        </GridLayout>

        <GridLayout
          v-if="errorMessage"
          rows="auto,auto,auto"
          class="overlay"
          verticalAlignment="center"
          horizontalAlignment="center"
        >
          <Label
            row="0"
            text="Unable to load PEACE2074"
            class="overlay-title"
            textAlignment="center"
          />
          <Label
            row="1"
            :text="errorMessage"
            class="overlay-text"
            textWrap="true"
            textAlignment="center"
          />
          <Button row="2" text="Retry" class="retry-button" @tap="retryLoad" />
        </GridLayout>
      </GridLayout>
    </Page>
  </Frame>
</template>

<script setup lang="ts">
import { ref } from 'nativescript-vue'

type WebViewLoadEvent = {
  error?: string
  url?: string
}

const appUrl = 'https://peace2074.com'
const isLoading = ref(true)
const errorMessage = ref('')
const webViewKey = ref(0)

const onLoadStarted = () => {
  isLoading.value = true
  errorMessage.value = ''
}

const onLoadFinished = (event: WebViewLoadEvent) => {
  if (event.error) {
    errorMessage.value = event.error
    isLoading.value = false
    return
  }

  errorMessage.value = ''
  isLoading.value = false
}

const retryLoad = () => {
  errorMessage.value = ''
  isLoading.value = true
  webViewKey.value += 1
}
</script>

<style scoped>
.overlay {
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.96);
  padding: 24;
}

.overlay-title {
  font-size: 24;
  color: #0a6b44;
  margin-bottom: 12;
}

.overlay-text {
  font-size: 16;
  color: #4b5563;
  margin-top: 12;
  margin-bottom: 12;
}

.retry-button {
  margin-top: 16;
  padding: 12;
  background-color: #0a6b44;
  color: #ffffff;
  border-radius: 999;
}
</style>

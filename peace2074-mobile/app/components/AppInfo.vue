<template>
  <ScrollView>
    <StackLayout class="screen screen-info">
      <Label text="About this build" class="screen-eyebrow" />
      <Label text="A focused native start" class="screen-title" />
      <Label
        text="This page keeps the migration transparent without crowding the home screen."
        class="screen-copy"
        textWrap="true"
      />

      <StackLayout class="info-card">
        <Label text="Native right now" class="info-title" />
        <Label
          text="• Native home&#10;• Native Quran list&#10;• Native Quran reader"
          class="info-copy"
          textWrap="true"
        />
      </StackLayout>

      <StackLayout class="info-card">
        <Label text="Coming next" class="info-title" />
        <Label
          text="Bookmarks, progress sync, Holy Names, Tasbeeh, account flows, and more reading tools are next in line."
          class="info-copy"
          textWrap="true"
        />
      </StackLayout>

      <StackLayout class="info-card info-card-secondary">
        <Label
          text="Need everything today?"
          class="info-title info-title-secondary"
        />
        <Label
          text="The full app is still available for the features that have not moved into the native flow yet."
          class="info-copy info-copy-secondary"
          textWrap="true"
        />
        <Button
          text="Open full app"
          class="secondary-button"
          @tap="openFullApp"
        />
      </StackLayout>

      <Button
        text="Continue to native Quran"
        class="primary-button"
        @tap="openNativeQuran"
      />
    </StackLayout>
  </ScrollView>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'open-full-app'): void
  (e: 'open-native-quran'): void
}>()

function openFullApp() {
  emit('open-full-app')
}

function openNativeQuran() {
  emit('open-native-quran')
}
</script>

<style scoped>
.screen {
  padding: 24;
  background-color: #08111c;
}

.screen-eyebrow {
  font-size: 14;
  color: #7dd3a8;
  text-transform: uppercase;
  letter-spacing: 1.2;
}

.screen-title {
  margin-top: 8;
  font-size: 30;
  font-weight: 800;
  color: #ffffff;
}

.screen-copy {
  margin-top: 12;
  font-size: 16;
  color: #dbe7e3;
}

.info-card {
  margin-top: 18;
  padding: 22;
  border-radius: 26;
  background-color: rgba(255, 255, 255, 0.96);
}

.info-card-secondary {
  background-color: rgba(125, 211, 168, 0.14);
}

.info-title {
  font-size: 22;
  font-weight: 700;
  color: #0f172a;
}

.info-title-secondary {
  color: #ffffff;
}

.info-copy {
  margin-top: 10;
  font-size: 16;
  color: #334155;
}

.info-copy-secondary {
  color: #dbe7e3;
}

.primary-button {
  margin-top: 18;
  padding: 14;
  border-radius: 999;
  background-color: #0a6b44;
  color: #ffffff;
  font-size: 17;
  font-weight: 700;
}

.secondary-button {
  margin-top: 16;
  padding: 14;
  border-radius: 999;
  background-color: transparent;
  color: #7dd3a8;
  border-width: 1;
  border-color: #7dd3a8;
  font-size: 17;
  font-weight: 700;
}
</style>

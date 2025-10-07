<script lang="ts" setup>
const nuxtApp = useNuxtApp()
interface HolyNameI {
  name: string
  text: string
  transliteration?: string
  meaning?: string
}
const { $HolyNames } = nuxtApp
const holynames: HolyNameI[] = $HolyNames as HolyNameI[]

definePageMeta({
  layout: 'default',
  title: 'Holy Names',
})
</script>

<template>
  <QPage padding class="holynames-page fit rtl beautiful-bg column flex">
    <div class="bismillah">
      ﷽
    </div>
    <h1 class="page-title">
      {{ $t("The 99 Holy Names of Allah") }}
    </h1>
    <div class="subtitle">
      {{ $t("Asma’ Allah Al-Husna") }}
    </div>
    <div class="names-grid">
      <div v-for="one in holynames" :key="one.text" class="glory-card islamic-border">
        <span class="arabic-name">{{ one.name }}</span>
        <span class="latin-name">{{ one.text }}</span>
        <span v-if="one.transliteration" class="transliteration">{{
          one.transliteration
        }}</span>
        <span v-if="one.meaning" class="meaning">{{ one.meaning }}</span>
      </div>
    </div>
  </QPage>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Noto+Naskh+Arabic:wght@700&display=swap');

.beautiful-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #e8f0e8 100%);
  position: relative;
  padding-bottom: 40px;
  overflow-x: hidden;
}
.bismillah {
  font-family: 'Amiri', serif;
  /* Responsive font-size: grows with viewport but clamps to a reasonable max */
  font-size: clamp(2rem, 6vw, 8rem);
  color: #bfa14a;
  text-align: center;
  margin-top: 3rem;
  letter-spacing: 0.2em;
  text-shadow: 0 2px 8px #e0d7c6;
  display: block;
  clear: both;
}
.page-title {
  text-align: center;
  font-family: 'Noto Naskh Arabic', 'Amiri', serif;
  color: #176a3a;
  margin-bottom: 0.5rem;
  font-size: 2.2rem;
  font-weight: bold;
  letter-spacing: 0.05em;
}
.subtitle {
  text-align: center;
  font-family: 'Amiri', serif;
  color: #bfa14a;
  margin-bottom: 2rem;
  font-size: 1.3rem;
  letter-spacing: 0.1em;
}
.names-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  margin: 0 auto;
  max-width: 1100px;
  padding: 0 1rem;
  box-sizing: border-box;
}
.glory-card {
  background: #fffbe6;
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px 0 rgba(34, 139, 34, 0.08);
  padding: 1.2rem 0.5rem;
  text-align: center;
  border: 2px solid #e0d7c6;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  word-break: break-word;
  box-sizing: border-box;
}
.glory-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 8px 32px 0 rgba(34, 139, 34, 0.18);
  border-color: #bfa14a;
}
.islamic-border {
  border-image: url('data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="38" height="38" rx="8" stroke="%23bfa14a" stroke-width="2" stroke-dasharray="6 4"/></svg>')
    8 stretch;
}
.arabic-name {
  display: block;
  font-family: 'Noto Naskh Arabic', 'Amiri', serif;
  font-size: 2.2rem;
  color: #176a3a;
  margin-bottom: 0.5rem;
  font-weight: bold;
  letter-spacing: 0.1em;
}
.latin-name {
  display: block;
  font-size: 1.1rem;
  color: #7c6f57;
  font-family: 'Lato', sans-serif;
  margin-top: 0.2rem;
}
.transliteration {
  display: block;
  font-size: 1rem;
  color: #bfa14a;
  font-family: 'Lato', sans-serif;
  margin-top: 0.2rem;
}
.meaning {
  display: block;
  font-size: 0.95rem;
  color: #176a3a;
  font-family: 'Lato', sans-serif;
  margin-top: 0.2rem;
}
@media (max-width: 600px) {
  .names-grid {
    grid-template-columns: 1fr;
    gap: 1.2rem;
    padding: 0 0.3rem;
  }
  .glory-card {
    padding: 1rem 0.3rem;
    font-size: 1.1rem;
  }
  .arabic-name {
    font-size: 1.4rem;
  }
}
</style>

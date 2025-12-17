<route lang="json">
{
  "meta": { "layout": "home" }
}
</route>

<template>
  <q-page padding>
    <div class="hero">
      <img class="logo" src="/logo.svg" alt="PEACE2074" />
      <h1 class="title">Welcome to PEACE2074</h1>
      <p class="subtitle">Choose a section to get started</p>
      <div class="grid">
        <RouterLink to="/quran" class="tile">
          <div class="tile-inner">
            <span class="tile-title">Quran</span>
            <span class="tile-sub">Explore Surahs</span>
          </div>
        </RouterLink>
        <RouterLink to="/tasbeeh" class="tile">
          <div class="tile-inner">
            <span class="tile-title">Tasbeeh</span>
            <span class="tile-sub">Count and reflect</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.hero {
  display: grid;
  place-items: center;
  min-height: 50vh;
  text-align: center;
}
.logo { width: 96px; height: auto; margin-bottom: 0.6rem; }
.title {
  font-size: 2.2rem;
  margin: 0.2rem 0;
}
.subtitle {
  color: #6c757d;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 680px;
  margin-top: 1rem;
}
.tile {
  text-decoration: none;
  color: inherit;
}
.tile-inner {
  border: 1px solid #e2e2e2;
  border-radius: 12px;
  padding: 1rem;
}
.tile-title { font-weight: 600; }
.tile-sub { color: #6c757d; font-size: 0.9rem; }
</style>

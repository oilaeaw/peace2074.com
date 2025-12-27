<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-avatar square size="32px" class="q-mr-sm">
          <img src="/logo.svg" alt="PEACE2074" />
        </q-avatar>
        <q-toolbar-title>
          <RouterLink
            to="/"
            class="link"
            style="color: inherit; text-decoration: none; font-weight: 700"
          >
            PEACE2074
          </RouterLink>
        </q-toolbar-title>
        <q-space />
        <nav class="nav">
          <RouterLink to="/" class="link">
            <span>Home</span>
          </RouterLink>
          <RouterLink to="/quran" class="link">
            <span>Quran</span>
          </RouterLink>
          <div class="lang">
            <label for="lang" class="q-mr-xs">Lang:</label>
            <select id="lang" @change="onLangChange($event)" :value="locale">
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="de">Deutsch</option>
              <option value="ru">Русский</option>
            </select>
          </div>
        </nav>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <RouterView />
    </q-page-container>

    <q-footer class="text-center q-pa-sm">
      <div class="footer">
        <img class="decor" src="/assets/decor-bottom.svg" alt="decor" />
        <span>© 2025 PEACE2074</span>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { locale } = useI18n();
function onLangChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value;
  locale.value = val;
}
</script>

<style scoped>
.q-toolbar-title {
  font-weight: 700;
}
.nav {
  display: flex;
  gap: 8px;
  align-items: center;
}

.q-avatar__content {
  vertical-align: middle;
}
.link {
  text-decoration: none;
}
.lang select {
  padding: 4px 6px;
  border-radius: 6px;
}
.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.decor {
  height: 16px;
  opacity: 0.6;
}
</style>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-avatar square size="32px" class="q-mr-sm">
          <img src="/logo.svg" alt="PEACE2074" class="app-logo" />
        </q-avatar>
        <q-toolbar-title>
          <RouterLink
            to="/"
            class="link"
            style="color: inherit; text-decoration: none; font-weight: 700"
          >
            {{ t('general.SiteTitle') }}
          </RouterLink>
        </q-toolbar-title>
        <q-space />
        <nav class="nav">
          <RouterLink to="/" class="link">
            <span>{{ t('appShell.nav.home') }}</span>
          </RouterLink>
          <RouterLink to="/quran" class="link">
            <span>{{ t('appShell.nav.quran') }}</span>
          </RouterLink>
          <div class="lang">
            <label for="lang" class="q-mr-xs">{{ t('general.languages') }}:</label>
            <select id="lang" @change="onLangChange($event)" :value="locale">
              <option v-for="l in langs" :key="l.value" :value="l.value">{{ l.label }}</option>
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
import { computed } from "vue";
import { useI18n } from "vue-i18n";
const { locale, t } = useI18n({ useScope: "global" });

const languageCodes = ["en", "ar", "de", "ru", "he", "tr"] as const;
const langs = computed(() => {
  locale.value;
  return languageCodes.map((code) => ({
    value: code,
    label: t(`general.languageNames.${code}`),
  }));
});

function onLangChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value;
  locale.value = val;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('app-locale', val)
    } catch {}
  }
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

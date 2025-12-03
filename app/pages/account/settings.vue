<script setup lang="ts">
import { computed, watch } from "#imports";
import useCore from "~/composables/useCore";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

definePageMeta({ layout: "q-layout" });

const { t, locale, te } = useI18n();
const $q = useQuasar();

const dark = computed(() => $q.dark.isActive);
function toggleDark() {
  $q.dark.toggle();
}

function changeLang(lang: string) {
  locale.value = lang;
  try {
    void useCore().set("lang", lang);
  } catch {}
}

// Set head title and update it whenever locale changes
// Prefer `settings.title` if available, otherwise fall back to `settings` key
function pageTitle() {
  if (te("settings.title")) return t("settings.title");
  if (te("settings")) return t("settings");
  return "Settings";
}
useHead({ title: pageTitle() });
watch(locale, () => {
  useHead({ title: pageTitle() });
});
</script>

<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{
            te("settings.title")
              ? t("settings.title")
              : te("settings")
              ? t("settings")
              : "Settings"
          }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-toggle v-model="dark" label="Dark mode" @update:model-value="toggleDark" />
        <div class="q-mt-md">
          <q-btn flat label="English" @click="changeLang('en')" />
          <q-btn flat label="العربية" @click="changeLang('ar')" />
          <q-btn flat label="Deutsch" @click="changeLang('de')" />
          <q-btn flat label="Русский" @click="changeLang('ru')" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

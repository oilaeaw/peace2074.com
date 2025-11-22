<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const auth = useAuth()

const isAuthenticated = computed(() => auth.status.value === 'authenticated')
const username = computed(() => auth.data.value?.user?.name || auth.data.value?.user?.email || '')
</script>

<template>
  <div class="row items-center no-wrap">
    <div class="q-mr-md">
      {{
        isAuthenticated ? t("welcome_back", { name: username }) : t("welcome_guest")
      }}
    </div>

    <q-btn
      v-if="isAuthenticated"
      dense
      flat
      round
      icon="logout"
      class="q-mx-md"
      :title="t('navigation.Signout')"
      @click="() => auth.signOut()"
    />
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'q-layout', title: 'navigation.SettingsPageTitle', description: 'Your account dashboard' })
const auth = useAuthStore()
const { t } = useI18n()
</script>

<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ t("account.title") || "Account" }}
        </div>
        <div v-if="auth.isAuthenticated">
          {{
            t("account.welcome", {
              name: auth.user?.username || auth.user?.user?.username,
            })
          }}
        </div>
        <div v-else>
          Please login to see account details.
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn flat label="Settings" to="/account/settings" />
        <q-btn flat label="Profile" to="/auth/authenticate" />
      </q-card-actions>
    </q-card>
  </div>
</template>

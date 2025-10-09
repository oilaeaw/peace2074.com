<script setup lang="ts">
definePageMeta({ layout: 'q-layout', title: 'Profile' })
const auth = useAuthStore()
const { t } = useI18n()

const firstName = computed(
  () => auth.user?.user?.first_name || auth.user?.first_name || '',
)
const lastName = computed(() => auth.user?.user?.last_name || auth.user?.last_name || '')
const username = computed(() => auth.user?.username || auth.user?.user?.username || '')
const email = computed(() => auth.user?.email || auth.user?.user?.email || '')
const permissions = computed(() => auth.permissions || [])
</script>

<template>
  <div class="q-pa-md" style="max-width: 600px; margin: 0 auto">
    <q-card>
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-h6">
            {{ t("profile.title") || "Profile" }}
          </div>
          <div class="text-subtitle2">
            {{ t("profile.subtitle") || "Your account information" }}
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="q-gutter-y-md">
          <div>
            <strong>{{ t("profile.firstName") || "First name" }}:</strong> {{ firstName }}
          </div>
          <div>
            <strong>{{ t("profile.lastName") || "Last name" }}:</strong> {{ lastName }}
          </div>
          <div>
            <strong>{{ t("profile.username") || "Username" }}:</strong> {{ username }}
          </div>
          <div>
            <strong>{{ t("profile.email") || "Email" }}:</strong> {{ email }}
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">
          {{ t("profile.permissions") || "Permissions" }}
        </div>
        <div v-if="permissions && permissions.length">
          <q-chip
            v-for="(p, idx) in permissions"
            :key="idx"
            class="q-mr-sm q-mb-sm"
            dense
            outline
          >
            {{ p.action }} / {{ p.subject }}
          </q-chip>
        </div>
        <div v-else>
          <em>{{ t("profile.noPermissions") || "No special permissions" }}</em>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

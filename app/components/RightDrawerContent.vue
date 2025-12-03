<script lang="ts" setup>
const { t } = useI18n()
const { status } = useAuth()
const isAuthenticated = computed(() => status.value === 'authenticated')
</script>

<template>
  <q-list bordered class="q-pa-lg bg-green-9 text-white">
    <!-- Quick navigation -->
    <q-item v-ripple clickable :to="{ path: '/chat', query: { room: 'general' } }">
      <q-item-section>
        <q-icon name="forum" class="q-mr-sm" />
        <span>Chat Room</span>
      </q-item-section>
    </q-item>
    <q-item v-ripple clickable to="/chat">
      <q-item-section>
        <q-icon name="chat" class="q-mr-sm" />
        <span>Chat</span>
      </q-item-section>
    </q-item>
    <q-separator spaced color="white" />
    <q-item v-ripple clickable to="/terms">
      <q-item-section>
        <q-icon name="gavel" class="q-mr-sm" />
        <span>{{ t("terms_and_conditions") }}</span>
      </q-item-section>
    </q-item>
    <q-item v-ripple clickable to="/privacy">
      <q-item-section>
        <q-icon name="privacy_tip" class="q-mr-sm" />
        <span>{{ t("privacy_policy") }}</span>
      </q-item-section>
    </q-item>
    <q-item v-ripple clickable to="/contact">
      <q-item-section>
        <q-icon name="contact_mail" class="q-mr-sm" />
        <span>{{ t("button.Contact") }}</span>
      </q-item-section>
    </q-item>
    <template v-if="isAuthenticated">
      <q-item v-ripple clickable to="/auth/profile">
        <q-item-section>
          <q-icon name="person" class="q-mr-sm" />
          <span>{{ t("navigation.Profile") }}</span>
        </q-item-section>
      </q-item>
      <q-item v-ripple clickable to="/account/settings">
        <q-item-section>
          <q-icon name="settings" class="q-mr-sm" />
          <span>{{ t("settings.title") || "Settings" }}</span>
        </q-item-section>
      </q-item>
      <!-- Admin-only link -->
      <q-item v-if="$ability.can('manage', 'all')" v-ripple clickable to="/admin">
        <q-item-section>
          <q-icon name="admin_panel_settings" class="q-mr-sm" />
          <span>{{ t("navigation.AdminPage") }}</span>
        </q-item-section>
      </q-item>
    </template>
    <q-item v-else v-ripple clickable to="/auth/login">
      <q-item-section>
        <q-icon name="person" class="q-mr-sm" />
        <span>{{ t("auth") }}</span>
      </q-item-section>
    </q-item>
  </q-list>
</template>
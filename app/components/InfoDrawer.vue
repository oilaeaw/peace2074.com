<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <q-drawer side="right" :width="260">
    <q-list>
      <q-item v-ripple clickable to="/terms">
        <q-item-section>
          <q-icon name="gavel" class="q-mr-sm" />
          <span>{{ t('terms_and_conditions') }}</span>
        </q-item-section>
      </q-item>
      <q-item v-ripple clickable to="/privacy">
        <q-item-section>
          <q-icon name="privacy_tip" class="q-mr-sm" />
          <span>{{ t('privacy_policy') }}</span>
        </q-item-section>
      </q-item>
      <q-item v-ripple clickable to="/auth/authenticate">
        <q-item-section>
          <q-icon name="person" class="q-mr-sm" />
          <span>{{ t('auth') }}</span>
        </q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

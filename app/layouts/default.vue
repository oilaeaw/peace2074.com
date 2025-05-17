<script lang="ts" setup>
import { useTimeAgo } from '@vueuse/core'
import moment from 'moment'

const $q = useQuasar()
const { t } = useI18n()
useQ2P().init()
const toggleLeftDrawer = ref(false)
const toggleRightDrawer = ref(false)
const { savedName } = useUserStore()

const { toggle } = $q.dark
function toggleDark() {
  toggle()
  return $q.dark.mode
}
const date = '__DATE__'
const timeAgo = useTimeAgo(date)
const BuildTime: string = moment(date).format('ddd MMM DD, YYYY [at] HH:mm')

function toggleDrawer() {
  toggleLeftDrawer.value = !toggleLeftDrawer.value
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-green-9 text-white" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleDrawer" />
        <q-toolbar-title>
          <nuxt-link :title="t('general.SiteTitle')" to="/">
            {{ t('general.SiteTitle') }}
          </nuxt-link>
          <q-space />
        </q-toolbar-title>
        <span>{{ savedName }}</span>
        <q-space />
        <q-btn dense flat round icon="light" class="q-mx-md" @click="toggleDark" />
        <q-btn dense flat round icon="menu" class="bg-green-9 text-white" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="toggleLeftDrawer"
      :min-width="250"
      :width="300"
      side="left"
      bordered
    >
      <fahras />
    </q-drawer>

    <q-drawer
      v-model="toggleRightDrawer"
      side="right"
      :min-width="250"
      :width="300" bordered
    >
      <q-list bordered class="q-pa-lg">
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
        <q-item v-ripple clickable to="/authenticate">
          <q-item-section>
            <q-icon name="person" class="q-mr-sm" />
            <span>{{ t('auth') }}</span>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <slot />
      <q-page-scroller position="bottom" :scroll-offset="20" :offset="[0, 0]">
        <q-btn fab icon="keyboard_arrow_up" color="green" />
      </q-page-scroller>
    </q-page-container>

    <q-footer reveal class="bg-green-9">
      <q-toolbar class="bg-green-4 text-white">
        <q-btn flat round dense icon="assignment_ind" class="cursor" to="/authenticate" />
        <q-toolbar-title>
          <nuxt-link :title="appName" to="/" />
        </q-toolbar-title>
        <div class="q-mx-auto text-center text-white">
          Built at: {{ BuildTime }} ({{ timeAgo }})
        </div>
        <q-space />
        <q-btn flat round dense icon="apps" class="q-mr-xs" />
        <q-btn flat round dense icon="more_vert" />
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<style scoped></style>

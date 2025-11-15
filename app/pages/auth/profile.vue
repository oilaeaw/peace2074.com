<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const { t } = useI18n()
const { data: session, getSession } = useAuth()
const $q = useQuasar()

const isEditing = ref(false)
const loading = ref(false)
const profileData = reactive({
  first_name: '',
  last_name: '',
})

function startEditing() {
  profileData.first_name = (session.value?.user as any)?.first_name || ''
  profileData.last_name = (session.value?.user as any)?.last_name || ''
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
}

async function saveProfile() {
  loading.value = true
  try {
    await $fetch('/api/user/profile', {
      method: 'PATCH',
      body: {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
      },
    })

    // Refresh the session to get the updated user data
    await getSession({ force: true })

    $q.notify({
      type: 'positive',
      message: t('profile.saveSuccess'),
    })
    isEditing.value = false
  }
  catch (error) {
    $q.notify({
      type: 'negative',
      message: (error as any).data?.message || t('profile.saveError'),
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <q-page padding>
    <q-card class="my-card">
      <q-card-section>
        <h1 class="text-h4">
          {{ t('profile.title') }}
        </h1>
        <p class="text-subtitle1">{{ t('profile.subtitle') }}</p>
      </q-card-section>

      <q-card-section>
        <q-form v-if="isEditing" @submit.prevent="saveProfile">
          <q-list bordered separator>
            <q-item>
              <q-item-section>
                <q-input
                  v-model="profileData.first_name"
                  :label="t('profile.firstName')"
                  dense
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-input
                  v-model="profileData.last_name"
                  :label="t('profile.lastName')"
                  dense
                />
              </q-item-section>
            </q-item>
          </q-list>
          <q-card-actions align="right" class="q-mt-md">
            <q-btn flat :label="t('cancel')" color="primary" @click="cancelEditing" />
            <q-btn :loading="loading" :label="t('profile.save')" color="primary" type="submit" />
          </q-card-actions>
        </q-form>

        <div v-else-if="session?.user">
          <q-list bordered separator>
            <q-item>
              <q-item-section>
                <q-item-label overline>{{ t('profile.firstName') }}</q-item-label>
                <q-item-label>{{ (session.user as any).first_name || '-' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label overline>{{ t('profile.lastName') }}</q-item-label>
                <q-item-label>{{ (session.user as any).last_name || '-' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label overline>{{ t('profile.username') }}</q-item-label>
                <q-item-label>{{ session.user.name }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label overline>{{ t('profile.email') }}</q-item-label>
                <q-item-label>{{ session.user.email }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label overline>{{ t('account.title') }}</q-item-label>
                <q-item-label class="text-capitalize">{{ (session.user as any).role || 'user' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label overline>{{ t('profile.permissions') }}</q-item-label>
                <q-list dense>
                  <q-item v-if="$ability.can('manage', 'all')">
                    <q-item-section avatar>
                      <q-icon color="primary" name="verified_user" />
                    </q-item-section>
                    <q-item-label>Can manage all content (Admin)</q-item-label>
                  </q-item>
                  <q-item v-if="$ability.can('manage', 'Bookmark')">
                    <q-item-section avatar>
                      <q-icon color="primary" name="bookmark" />
                    </q-item-section>
                    <q-item-label>Can manage bookmarks</q-item-label>
                  </q-item>
                </q-list>
              </q-item-section>
            </q-item>
          </q-list>
          <q-card-actions align="right" class="q-mt-md">
            <q-btn :label="t('profile.edit')" color="primary" @click="startEditing" />
          </q-card-actions>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>
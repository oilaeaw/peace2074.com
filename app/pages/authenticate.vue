<script lang="ts" setup>
const { setPassword, setNewName } = useUserStore()
const userName = ref('')
const password = ref('')

function onSubmit() {
  setNewName(userName)
  setPassword(password)
}
function onReset() {
  userName.value = ''
  password.value = ''
}
</script>

<template>
  <q-page>
    <q-card class="my-card">
      <q-card-section>
        <q-form
          class="q-gutter-md"
          @submit="onSubmit"
          @reset="onReset"
        >
          <q-input v-model="userName" type="text" label="user" />
          <q-input v-model="password" type="password" label="password" />
          <div>
            <q-btn label="Submit" type="submit" color="primary" />
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style>

</style>

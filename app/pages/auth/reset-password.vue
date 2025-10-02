<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const athCode = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref("");

async function handleResetPassword() {
  if (newPassword.value !== confirmPassword.value) {
    error.value = "Passwords do not match";
    return;
  }

  try {
    loading.value = true;
    // Send reset request to your API endpoint
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: athCode.value,
        newPassword: newPassword.value,
      }),
    });

    if (!response.ok) {
      throw new Error("Password reset failed");
    }

    // Redirect to login page on success
    router.push("/auth/login");
  } catch (e) {
    error.value = e.message || "Failed to reset password";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <q-page :style-fn="myTweak" padding>
    <div class="q-pa-md" style="max-width: 400px; margin: 0 auto">
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6">Reset Password</div>
        </q-card-section>

        <q-card-section>
          <form @submit.prevent="handleResetPassword">
            <q-input
              v-model="athCode"
              type="text"
              label="Verification Code"
              class="q-mb-md"
              required
            />

            <q-input
              v-model="newPassword"
              type="password"
              label="New Password"
              class="q-mb-md"
              required
            />

            <q-input
              v-model="confirmPassword"
              type="password"
              label="Confirm Password"
              class="q-mb-md"
              required
            />

            <div v-if="error" class="text-negative q-mb-md">
              {{ error }}
            </div>

            <q-btn
              type="submit"
              color="primary"
              :loading="loading"
              label="Reset Password"
              class="full-width"
            />
          </form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style></style>

import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { useAuthStore } from "@/stores/auth.pinia";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Global navigation guard for authentication
router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const requiresAuth = Boolean(to.meta.requiresAuth)

  if (!authStore.hydrated) {
    if (requiresAuth) {
      await authStore.hydrateSession();
    } else {
      void authStore.hydrateSession();
    }
  }

  // Check if route requires authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login with return path
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  return true;
});

export default router;

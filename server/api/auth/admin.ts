export default defineNuxtRouteMiddleware(() => {
  const { data, status } = useAuth()

  // It's an admin-only page, so if the user is not authenticated or not an admin,
  // redirect them to the home page.
  if (status.value === 'unauthenticated' || (data.value?.user as any)?.role !== 'admin') {
    // You can show a 404 page or a "not authorized" page here instead.
    // For simplicity, we'll just redirect to the home page.
    return navigateTo('/')
  }
})
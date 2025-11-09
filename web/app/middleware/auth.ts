import { useAuthStore } from "~/stores/auth.store"

/**
 * Auth middleware - redirect to login if not authenticated
 */
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})


import { useAuthStore } from "~/stores/auth.store"

/**
 * Guest middleware - redirect to home if already authenticated
 */
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})


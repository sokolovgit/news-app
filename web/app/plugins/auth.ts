/**
 * Auth initialization plugin
 * Initializes auth store on app startup
 */
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  // Initialize auth state from localStorage on app startup
  if (import.meta.client) {
    authStore.initAuth()
  }
})


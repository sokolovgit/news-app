import { useAuthStore } from '~/stores/auth.store'
import { UserRole } from '~/models/user.model'

/**
 * Admin middleware - redirect to home if not admin
 */
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  const isAdmin = authStore.userRoles.includes(UserRole.ADMIN)
  
  if (!isAdmin) {
    return navigateTo('/')
  }
})



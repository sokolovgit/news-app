<template>
  <div class="min-h-screen bg-background flex flex-col">
    <AppNavbar @toggle-mobile-menu="toggleMobileMenu" />
    <MobileSidebar :is-open="isMobileMenuOpen" @update:open="isMobileMenuOpen = $event" />
    <main class="container mx-auto px-4 py-6 flex-1">
      <NuxtPage />
    </main>
    <AppFooter />
    <SettingsProvider />
  </div>
</template>

<script setup lang="ts">
import AppNavbar from '~/components/navigation/AppNavbar.vue'
import MobileSidebar from '~/components/navigation/MobileSidebar.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import SettingsProvider from '~/components/settings/SettingsProvider.vue'
import { useAuthStore } from '~/stores/auth.store'

const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)

// Initialize auth on mount
onMounted(() => {
  authStore.initAuth()
})

// Watch for auth state changes and redirect if needed
const route = useRoute()
const router = useRouter()

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    // Public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/landing',
      '/login',
      '/register',
      '/verify-email',
      '/articles/public',
      '/articles/read',
    ]
    
    // Check if current route is public
    const isPublicRoute = publicRoutes.some(publicRoute => 
      route.path === publicRoute || route.path.startsWith(publicRoute + '/')
    )
    
    // Redirect root to landing for unauthorized users
    if (!isAuthenticated && route.path === '/') {
      router.push('/landing')
      return
    }
    
    // Only redirect if we're on a protected route and not authenticated
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/landing')
    }
  },
  { immediate: true },
)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

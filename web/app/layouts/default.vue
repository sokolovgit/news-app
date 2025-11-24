<template>
  <div class="min-h-screen bg-background">
    <AppNavbar @toggle-mobile-menu="toggleMobileMenu" />
    <MobileSidebar :is-open="isMobileMenuOpen" @update:open="isMobileMenuOpen = $event" />
    <main class="container mx-auto px-4 py-6">
      <NuxtPage />
    </main>
    <SettingsProvider />
  </div>
</template>

<script setup lang="ts">
import AppNavbar from '~/components/navigation/AppNavbar.vue'
import MobileSidebar from '~/components/navigation/MobileSidebar.vue'
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
    // Only redirect if we're on a protected route and not authenticated
    const publicRoutes = ['/login', '/register', '/verify-email']
    if (!isAuthenticated && !publicRoutes.includes(route.path)) {
      router.push('/login')
    }
  },
  { immediate: true },
)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

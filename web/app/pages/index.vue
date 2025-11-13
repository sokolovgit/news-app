<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useAuthStore } from '~/stores/auth.store'
import EmailVerificationBanner from '~/components/auth/EmailVerificationBanner.vue'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-bg text-text flex flex-col">
    <!-- Email Verification Banner -->
    <EmailVerificationBanner />
    
    <div class="flex-1 flex items-center justify-center p-8">
    <div class="text-center space-y-6 max-w-2xl">
      <h1 class="text-5xl font-bold">News App</h1>
      <p class="text-xl text-muted">Welcome to the News Application</p>

      <!-- Auth Status -->
      <div
        v-if="authStore.isAuthenticated"
        class="mt-8 p-6 bg-card rounded-lg border border-border"
      >
        <h2 class="text-2xl font-semibold mb-4">Welcome back!</h2>
        <div class="space-y-2 text-left mb-4">
          <p><span class="font-medium">Email:</span> {{ authStore.userEmail }}</p>
          <p><span class="font-medium">Roles:</span> {{ authStore.userRoles.join(', ') }}</p>
          <p>
            <span class="font-medium">Email Verified:</span>
            {{ authStore.isEmailVerified ? 'Yes' : 'No' }}
          </p>
        </div>
        <Button variant="outline" class="w-full" @click="handleLogout"> Logout </Button>
      </div>

      <div v-else class="mt-8 p-6 bg-card rounded-lg border border-border">
        <p class="text-lg mb-4">Please sign in to continue</p>
        <div class="flex gap-4 justify-center">
          <NuxtLink to="/login">
            <Button size="lg" class="px-8 bg-accent text-bg hover:bg-accent/90"> Login </Button>
          </NuxtLink>
          <NuxtLink to="/register">
            <Button variant="outline" size="lg" class="px-8 hover:bg-accent/10"> Register </Button>
          </NuxtLink>
        </div>
      </div>

      <div class="flex gap-4 justify-center mt-8">
        <NuxtLink
          to="/palette"
          class="px-6 py-3 bg-accent text-bg rounded-lg hover:opacity-90 hover:no-underline transition-opacity font-medium"
        >
          View Color Palette
        </NuxtLink>
      </div>

      <div class="mt-12">
        <ThemeToggle />
        </div>
      </div>
    </div>
  </div>
</template>

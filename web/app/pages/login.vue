<script setup lang="ts">
import LoginForm from '~/components/auth/LoginForm.vue'

definePageMeta({
  layout: 'auth',
})

const router = useRouter()

const handleLoginSuccess = () => {
  // Redirect is handled in the LoginForm component
}

const handleSwitchToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="w-full">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
      <p class="text-muted-foreground">Sign in to your account to continue</p>
    </div>
    <LoginForm @success="handleLoginSuccess" @switch-to-register="handleSwitchToRegister" />
    <div class="mt-6 text-center text-sm text-muted-foreground">
      Don't have an account?
      <NuxtLink to="/register" class="text-primary-foreground hover:underline font-medium"> Sign up </NuxtLink>
    </div>
  </div>
</template>

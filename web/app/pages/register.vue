<script setup lang="ts">
import RegisterForm from '~/components/auth/RegisterForm.vue'

definePageMeta({
  layout: 'auth',
})

const router = useRouter()

const handleRegisterSuccess = () => {
  // Redirect is handled in the RegisterForm component
}

const handleSwitchToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="w-full">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-text mb-2">Create an account</h1>
      <p class="text-muted">Sign up to get started with News App</p>
    </div>
    <RegisterForm @success="handleRegisterSuccess" @switch-to-login="handleSwitchToLogin" />
    <div class="mt-6 text-center text-sm text-muted">
      Already have an account?
      <NuxtLink to="/login" class="text-primary hover:underline font-medium"> Sign in </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '~/stores/auth.store'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{
  success: []
  switchToRegister: []
}>()

const authStore = useAuthStore()
const router = useRouter()

// Form state
const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const formError = ref('')

// Validation
const validateEmail = () => {
  if (!email.value) {
    emailError.value = 'Email is required'
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email'
    return false
  }
  emailError.value = ''
  return true
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'Password is required'
    return false
  }
  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return false
  }
  passwordError.value = ''
  return true
}

// Handle submit
const handleSubmit = async (e: Event) => {
  e.preventDefault()
  formError.value = ''

  // Validate
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()

  if (!isEmailValid || !isPasswordValid) {
    return
  }

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    })

    emit('success')

    // Redirect to home or dashboard
    router.push('/')
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed. Please check your credentials.'
    formError.value = errorMessage
  }
}

const handleSwitchToRegister = () => {
  emit('switchToRegister')
}
</script>

<template>
  <form :class="cn('flex flex-col gap-6', props.class)" @submit="handleSubmit">
    <div class="flex flex-col items-center gap-2 text-center">
      <h1 class="text-2xl font-bold">Login to your account</h1>
      <p class="text-muted-foreground text-sm text-balance">
        Enter your email below to login to your account
      </p>
    </div>

    <!-- Display form error -->
    <div
      v-if="formError"
      class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3"
    >
      {{ formError }}
    </div>

    <div class="grid gap-6">
      <div class="grid gap-3">
        <Label for="email">Email</Label>
        <Input
          id="email"
          v-model="email"
          :class="emailError ? 'border-red-500' : ''"
          type="email"
          placeholder="m@example.com"
          required
          @blur="validateEmail"
        />
        <p v-if="emailError" class="text-sm text-red-600">{{ emailError }}</p>
      </div>

      <div class="grid gap-3">
        <div class="flex items-center">
          <Label for="password">Password</Label>
          <a href="#" class="ml-auto text-sm underline-offset-4 hover:underline">
            Forgot your password?
          </a>
        </div>
        <Input
          id="password"
          v-model="password"
          :class="passwordError ? 'border-red-500' : ''"
          type="password"
          required
          @blur="validatePassword"
        />
        <p v-if="passwordError" class="text-sm text-red-600">{{ passwordError }}</p>
      </div>

      <Button type="submit" class-name="w-full" :disabled="authStore.isLoading">
        {{ authStore.isLoading ? 'Logging in...' : 'Login' }}
      </Button>
    </div>

    <div class="text-center text-sm">
      Don't have an account?
      <a
        href="#"
        class="underline underline-offset-4 hover:text-primary"
        @click.prevent="handleSwitchToRegister"
      >
        Sign up
      </a>
    </div>
  </form>
</template>

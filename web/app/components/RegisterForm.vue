<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{
  success: []
  switchToLogin: []
}>()

const authStore = useAuthStore()
const router = useRouter()

// Form state
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
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

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
    return false
  }
  if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'Passwords do not match'
    return false
  }
  confirmPasswordError.value = ''
  return true
}

// Handle submit
const handleSubmit = async (e: Event) => {
  e.preventDefault()
  formError.value = ''

  // Validate
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()
  const isConfirmPasswordValid = validateConfirmPassword()

  if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
    return
  }

  try {
    await authStore.register({
      email: email.value,
      password: password.value,
    })

    emit('success')

    // Redirect to home or dashboard
    router.push('/')
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Registration failed. Please try again.'
    formError.value = errorMessage
  }
}

const handleSwitchToLogin = () => {
  emit('switchToLogin')
}
</script>

<template>
  <form :class="cn('flex flex-col gap-6', props.class)" @submit="handleSubmit">
    <div class="flex flex-col items-center gap-2 text-center">
      <h1 class="text-2xl font-bold">Create an account</h1>
      <p class="text-muted-foreground text-sm text-balance">
        Enter your email below to create your account
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
        <Label for="register-email">Email</Label>
        <Input
          id="register-email"
          v-model="email"
          type="email"
          placeholder="m@example.com"
          required
          :class="emailError ? 'border-red-500' : ''"
          @blur="validateEmail"
        />
        <p v-if="emailError" class="text-sm text-red-600">{{ emailError }}</p>
      </div>

      <div class="grid gap-3">
        <Label for="register-password">Password</Label>
        <Input
          id="register-password"
          v-model="password"
          type="password"
          required
          :class="passwordError ? 'border-red-500' : ''"
          @blur="validatePassword"
        />
        <p v-if="passwordError" class="text-sm text-red-600">{{ passwordError }}</p>
      </div>

      <div class="grid gap-3">
        <Label for="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          required
          :class="confirmPasswordError ? 'border-red-500' : ''"
          @blur="validateConfirmPassword"
        />
        <p v-if="confirmPasswordError" class="text-sm text-red-600">{{ confirmPasswordError }}</p>
      </div>

      <Button type="submit" class-name="w-full" :disabled="authStore.isLoading">
        {{ authStore.isLoading ? 'Creating account...' : 'Create account' }}
      </Button>
    </div>

    <div class="text-center text-sm">
      Already have an account?
      <a
        href="#"
        class="underline underline-offset-4 hover:text-primary"
        @click.prevent="handleSwitchToLogin"
      >
        Sign in
      </a>
    </div>
  </form>
</template>

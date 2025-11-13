<script setup lang="ts">
import * as z from 'zod'
import { toast } from 'vue-sonner'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'

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

// Password visibility toggle
const showPassword = ref(false)

// Email validation status
const emailValidation = computed(() => {
  const email = form.values.email || ''

  if (!email) return null // Not yet entered

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(email)

  return {
    isValid,
    message: isValid ? 'Valid email address' : 'Please enter a valid email address',
  }
})

// Define form schema with Zod
const loginFormSchema = toTypedSchema(
  z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .min(1, 'Email is required')
      .email('Please enter a valid email'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters'),
  }),
)

// Initialize form with vee-validate
const form = useForm({
  validationSchema: loginFormSchema,
  initialValues: {
    email: '',
    password: '',
  },
})

// Handle form submission
const onSubmit = form.handleSubmit(async (values) => {
  try {
    await authStore.login({
      email: values.email,
      password: values.password,
    })

    // Show success toast
    toast.success('Welcome back!', {
      description: 'You have successfully logged in.',
      duration: 3000,
    })

    emit('success')

    // Redirect to home or dashboard
    router.push('/')
  } catch (error: unknown) {
    // Show error toast for API errors
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed. Please check your credentials.'

    toast.error('Login Failed', {
      description: errorMessage,
      duration: 5000,
    })
  }
})

const handleSwitchToRegister = () => {
  emit('switchToRegister')
}
</script>

<template>
  <form :class="cn('flex flex-col gap-6', props.class)" @submit="onSubmit">
    <!-- Header -->
    <div class="flex flex-col items-center gap-2 text-center">
      <div class="rounded-full bg-primary/10 p-3 mb-2">
        <Icon name="lucide:lock-keyhole" class="h-6 w-6 text-primary" />
      </div>
      <h1 class="text-2xl font-bold">Welcome back</h1>
      <p class="text-muted-foreground text-sm text-balance">
        Enter your credentials to access your account
      </p>
    </div>

    <div class="grid gap-5">
      <!-- Email Field -->
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel class="text-sm font-medium">Email</FormLabel>
          <FormControl>
            <div class="space-y-2">
              <div class="relative">
                <Icon
                  name="lucide:mail"
                  class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  :class="[
                    'pl-9',
                    emailValidation?.isValid
                      ? 'pr-9 border-green-500 focus-visible:ring-green-500'
                      : emailValidation?.isValid === false
                        ? 'pr-9 border-red-500 focus-visible:ring-red-500'
                        : '',
                  ]"
                  v-bind="componentField"
                />
                <!-- Validation Status Icon -->
                <div
                  v-if="emailValidation !== null"
                  class="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Icon
                    v-if="emailValidation.isValid"
                    name="lucide:check-circle-2"
                    class="h-4 w-4 text-green-600"
                  />
                  <Icon v-else name="lucide:x-circle" class="h-4 w-4 text-red-600" />
                </div>
              </div>

              <!-- Validation Status Message -->
              <div v-if="emailValidation !== null" class="flex items-center gap-2 text-xs">
                <Icon
                  v-if="emailValidation.isValid"
                  name="lucide:check-circle-2"
                  class="h-3.5 w-3.5 text-green-600"
                />
                <Icon v-else name="lucide:alert-circle" class="h-3.5 w-3.5 text-red-600" />
                <span :class="emailValidation.isValid ? 'text-green-600' : 'text-red-600'">
                  {{ emailValidation.message }}
                </span>
              </div>
            </div>
          </FormControl>
        </FormItem>
      </FormField>

      <!-- Password Field -->
      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <div class="flex items-center justify-between mb-2">
            <FormLabel class="text-sm font-medium">Password</FormLabel>
            <a href="#" class="text-xs text-primary underline-offset-4 hover:underline font-medium">
              Forgot password?
            </a>
          </div>
          <FormControl>
            <div class="relative">
              <Icon
                name="lucide:lock"
                class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                class="pl-9 pr-9"
                v-bind="componentField"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                @click="showPassword = !showPassword"
              >
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
              </button>
            </div>
          </FormControl>
        </FormItem>
      </FormField>

      <!-- Submit Button -->
      <Button
        type="submit"
        size="lg"
        class="w-full mt-2 bg-accent text-bg hover:bg-accent/90"
        :disabled="authStore.isLoading"
      >
        <Icon v-if="authStore.isLoading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
        {{ authStore.isLoading ? 'Logging in...' : 'Login' }}
      </Button>
    </div>

    <!-- Footer -->
    <div class="text-center text-sm">
      <span class="text-muted-foreground">Don't have an account?</span>
      <a
        href="#"
        class="ml-1 font-medium text-primary underline-offset-4 hover:underline"
        @click.prevent="handleSwitchToRegister"
      >
        Sign up
      </a>
    </div>
  </form>
</template>

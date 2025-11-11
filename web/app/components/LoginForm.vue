<script setup lang="ts">
import * as z from 'zod'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

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

// Form error state
const formError = ref('')

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
  formError.value = ''

  try {
    await authStore.login({
      email: values.email,
      password: values.password,
    })

    emit('success')

    // Redirect to home or dashboard
    router.push('/')
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed. Please check your credentials.'
    formError.value = errorMessage
  }
})

const handleSwitchToRegister = () => {
  emit('switchToRegister')
}
</script>

<template>
  <form :class="cn('flex flex-col gap-6', props.class)" @submit="onSubmit">
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
      <!-- Email Field -->
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" placeholder="m@example.com" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Password Field -->
      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <div class="flex items-center">
            <FormLabel>Password</FormLabel>
            <a href="#" class="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </a>
          </div>
          <FormControl>
            <Input type="password" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

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

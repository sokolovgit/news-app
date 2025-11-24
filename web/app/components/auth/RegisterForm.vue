<script setup lang="ts">
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'

import EmailInput from '~/components/auth/EmailInput.vue'
import PasswordInput from '~/components/auth/PasswordInput.vue'
import PasswordStrengthIndicator from '~/components/auth/PasswordStrengthIndicator.vue'
import PasswordRequirementsList from '~/components/auth/PasswordRequirementsList.vue'

import { useAuthStore } from '~/stores/auth.store'
import { usePasswordValidation } from '~/composables/usePasswordValidation'

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
  }>(),
  {
    class: '',
  },
)

const emit = defineEmits<{
  success: []
  switchToLogin: []
}>()

const authStore = useAuthStore()
const router = useRouter()

// Define form schema with Zod matching backend validation
const registerFormSchema = toTypedSchema(
  z
    .object({
      email: z
        .string({ required_error: 'Email is required' })
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          'Password must meet all requirements',
        ),
      confirmPassword: z.string({ required_error: 'Please confirm your password' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
)

// Initialize form with vee-validate
const form = useForm({
  validationSchema: registerFormSchema,
  initialValues: {
    email: '',
    password: '',
    confirmPassword: '',
  },
})

// Use password validation composable
const password = computed(() => form.values.password || '')
const { strength, requirements } = usePasswordValidation(password)

// Check if passwords match
const passwordsMatch = computed(() => {
  const pwd = form.values.password || ''
  const confirmPwd = form.values.confirmPassword || ''

  if (!confirmPwd) return null
  return pwd === confirmPwd
})

// Handle form submission
const onSubmit = form.handleSubmit(async (values) => {
  try {
    await authStore.register({
      email: values.email,
      password: values.password,
    })

    // Show success toast with email verification notice
    toast.success('Account Created Successfully! 🎉', {
      description: 'Please check your email to verify your account. A verification link has been sent to your inbox.',
      duration: 7000,
    })

    // Show additional info toast after a short delay
    setTimeout(() => {
      toast.info('Email Verification Required', {
        description: 'You can use the app now, but some features may be limited until you verify your email.',
        duration: 6000,
    })
    }, 1000)

    emit('success')
    router.push('/')
  } catch (error: unknown) {
    // Show error toast for API errors
    const errorMessage =
      error instanceof Error ? error.message : 'Registration failed. Please try again.'

    toast.error('Registration Failed', {
      description: errorMessage,
      duration: 5000,
    })
  }
})

const handleSwitchToLogin = () => {
  emit('switchToLogin')
}
</script>

<template>
  <form :class="cn('flex flex-col gap-6', props.class)" @submit="onSubmit">
    <div class="grid gap-5">
      <!-- Email Field -->
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel class="text-sm font-medium">Email</FormLabel>
          <FormControl>
            <EmailInput v-bind="componentField" />
          </FormControl>
        </FormItem>
      </FormField>

      <!-- Password Field -->
      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <FormLabel class="text-sm font-medium">Password</FormLabel>
          <FormControl>
            <div class="space-y-3">
              <PasswordInput
                v-bind="componentField"
                placeholder="Enter your password"
                icon="lucide:lock"
              />

              <!-- Password Strength Indicator -->
              <PasswordStrengthIndicator v-if="form.values.password" :strength="strength" />

              <!-- Password Requirements -->
              <PasswordRequirementsList v-if="form.values.password" :requirements="requirements" />
            </div>
          </FormControl>
        </FormItem>
      </FormField>

      <!-- Confirm Password Field -->
      <FormField v-slot="{ componentField }" name="confirmPassword">
        <FormItem>
          <FormLabel class="text-sm font-medium">Confirm Password</FormLabel>
          <FormControl>
            <div class="space-y-2">
              <PasswordInput
                v-bind="componentField"
                placeholder="Confirm your password"
                icon="lucide:lock-keyhole"
                :show-validation="true"
                :is-valid="passwordsMatch"
              />

              <!-- Match Status Message -->
              <div v-if="passwordsMatch !== null" class="flex items-center gap-2 text-xs">
                <Icon
                  v-if="passwordsMatch"
                  name="lucide:check-circle-2"
                  class="h-3.5 w-3.5 text-green-600"
                />
                <Icon v-else name="lucide:alert-circle" class="h-3.5 w-3.5 text-red-600" />
                <span :class="passwordsMatch ? 'text-green-600' : 'text-red-600'">
                  {{ passwordsMatch ? 'Passwords match' : 'Passwords do not match' }}
                </span>
              </div>
            </div>
          </FormControl>
        </FormItem>
      </FormField>

      <!-- Submit Button -->
      <Button
        type="submit"
        size="lg"
        class="w-full mt-2"
        :disabled="authStore.isLoading"
      >
        <Icon v-if="authStore.isLoading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
        {{ authStore.isLoading ? 'Creating account...' : 'Create account' }}
      </Button>
    </div>
  </form>
</template>

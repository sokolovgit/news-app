<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '~/stores/auth.store'

// Page metadata
definePageMeta({
  layout: false,
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Verification state
const verificationState = ref<'idle' | 'verifying' | 'success' | 'error'>('idle')
const errorMessage = ref<string>('')
const countdown = ref(5)
let countdownInterval: ReturnType<typeof setInterval> | null = null

// Get token from query params
const token = computed(() => route.query.token as string | undefined)

// Verify email on mount
onMounted(async () => {
  if (!token.value) {
    verificationState.value = 'error'
    errorMessage.value = 'Verification token is missing'
    return
  }

  try {
    verificationState.value = 'verifying'
    await authStore.verifyEmail(token.value)
    verificationState.value = 'success'

    // Show success toast
    toast.success('Email Verified!', {
      description: 'Your email has been successfully verified.',
      duration: 5000,
    })

    // Start countdown for redirect
    startCountdown()
  } catch (error: unknown) {
    verificationState.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : 'Failed to verify email'

    // Show error toast
    toast.error('Verification Failed', {
      description: errorMessage.value,
      duration: 5000,
    })
  }
})

// Countdown and redirect after success
const startCountdown = () => {
  countdown.value = 5
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownInterval) clearInterval(countdownInterval)
      router.push('/')
    }
  }, 1000)
}

// Manual redirect
const goToHome = () => {
  if (countdownInterval) clearInterval(countdownInterval)
  router.push('/')
}

// Cleanup on unmount
onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<template>
  <div
    class="min-h-screen bg-linear-to-br from-bg via-bg to-bg/95 flex items-center justify-center p-4"
  >
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
    </div>

    <div class="relative w-full max-w-md">
      <!-- Card -->
      <div class="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <!-- Header with gradient -->
        <div
          class="relative h-32 bg-linear-to-br from-accent via-primary to-accent/80 flex items-center justify-center"
        >
          <div class="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

          <!-- Status Icon -->
          <div class="relative">
            <!-- Idle/Verifying State -->
            <div
              v-if="verificationState === 'idle' || verificationState === 'verifying'"
              class="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <Icon name="lucide:loader-2" class="h-10 w-10 text-white animate-spin" />
            </div>

            <!-- Success State -->
            <div
              v-else-if="verificationState === 'success'"
              class="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce"
            >
              <Icon name="lucide:check-circle-2" class="h-10 w-10 text-white" />
            </div>

            <!-- Error State -->
            <div
              v-else
              class="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse"
            >
              <Icon name="lucide:x-circle" class="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-8 space-y-6">
          <!-- Verifying State -->
          <div v-if="verificationState === 'verifying'" class="text-center space-y-3">
            <h1 class="text-2xl font-bold text-text">Verifying Your Email</h1>
            <p class="text-muted text-sm">Please wait while we verify your email address...</p>

            <!-- Loading Animation -->
            <div class="flex justify-center gap-2 pt-4">
              <div
                class="w-2 h-2 rounded-full bg-accent animate-bounce"
                style="animation-delay: 0ms"
              />
              <div
                class="w-2 h-2 rounded-full bg-accent animate-bounce"
                style="animation-delay: 150ms"
              />
              <div
                class="w-2 h-2 rounded-full bg-accent animate-bounce"
                style="animation-delay: 300ms"
              />
            </div>
          </div>

          <!-- Success State -->
          <div v-else-if="verificationState === 'success'" class="text-center space-y-4">
            <div class="space-y-2">
              <h1 class="text-2xl font-bold text-text">Email Verified!</h1>
              <p class="text-muted text-sm">
                Your email has been successfully verified. You can now access all features.
              </p>
            </div>

            <!-- Success Checkmark Animation -->
            <div class="flex justify-center py-4">
              <div class="relative">
                <div
                  class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center"
                >
                  <Icon name="lucide:check-circle-2" class="h-8 w-8 text-green-600" />
                </div>
                <div
                  class="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-75"
                />
              </div>
            </div>

            <!-- Countdown -->
            <div class="bg-muted/50 rounded-lg p-4 space-y-2">
              <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Icon name="lucide:timer" class="h-4 w-4" />
                <span>Redirecting to home in {{ countdown }} seconds...</span>
              </div>
              <div class="w-full h-1 bg-border rounded-full overflow-hidden">
                <div
                  class="h-full bg-accent transition-all duration-1000 ease-linear"
                  :style="{ width: `${(countdown / 5) * 100}%` }"
                />
              </div>
            </div>

            <Button size="lg" class="w-full bg-accent text-bg hover:bg-accent/90" @click="goToHome">
              <Icon name="lucide:home" class="mr-2 h-4 w-4" />
              Go to Home Now
            </Button>
          </div>

          <!-- Error State -->
          <div v-else-if="verificationState === 'error'" class="text-center space-y-4">
            <div class="space-y-2">
              <h1 class="text-2xl font-bold text-text">Verification Failed</h1>
              <p class="text-muted text-sm">We couldn't verify your email address.</p>
            </div>

            <!-- Error Icon Animation -->
            <div class="flex justify-center py-4">
              <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <Icon name="lucide:alert-triangle" class="h-8 w-8 text-red-600" />
              </div>
            </div>

            <!-- Error Message -->
            <div
              class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4"
            >
              <p class="text-sm text-red-800 dark:text-red-400">
                {{ errorMessage }}
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3 pt-2">
              <Button
                size="lg"
                class="w-full bg-accent text-bg hover:bg-accent/90"
                @click="router.push('/')"
              >
                <Icon name="lucide:home" class="mr-2 h-4 w-4" />
                Go to Home
              </Button>

              <Button
                v-if="authStore.isAuthenticated && !authStore.isEmailVerified"
                variant="outline"
                size="lg"
                class="w-full"
                @click="router.push('/resend-verification')"
              >
                <Icon name="lucide:mail" class="mr-2 h-4 w-4" />
                Request New Link
              </Button>
            </div>
          </div>

          <!-- Idle State (no token) -->
          <div v-else class="text-center space-y-4">
            <div class="space-y-2">
              <h1 class="text-2xl font-bold text-text">Invalid Link</h1>
              <p class="text-muted text-sm">This verification link is invalid or has expired.</p>
            </div>

            <div class="flex justify-center py-4">
              <div class="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Icon name="lucide:alert-circle" class="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <Button
              size="lg"
              class="w-full bg-accent text-bg hover:bg-accent/90"
              @click="router.push('/')"
            >
              <Icon name="lucide:home" class="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-center">
        <p class="text-xs text-muted">
          Having trouble?
          <a href="mailto:support@newsapp.com" class="text-accent hover:underline ml-1">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '~/stores/auth.store'

const authStore = useAuthStore()

// Banner visibility state
const isVisible = ref(true)
const isResending = ref(false)

// Show banner only for authenticated, unverified users
const shouldShowBanner = computed(() => {
  return isVisible.value && authStore.isAuthenticated && !authStore.isEmailVerified
})

// Dismiss banner
const dismissBanner = () => {
  isVisible.value = false
  // Store dismissal in sessionStorage so it doesn't show again this session
  sessionStorage.setItem('emailVerificationBannerDismissed', 'true')
}

// Check if banner was dismissed in this session
onMounted(() => {
  const wasDismissed = sessionStorage.getItem('emailVerificationBannerDismissed')
  if (wasDismissed) {
    isVisible.value = false
  }
})

// Resend verification email
const resendVerification = async () => {
  try {
    isResending.value = true
    await authStore.resendVerificationEmail()

    toast.success('Verification Email Sent', {
      description: 'Please check your inbox for the verification link.',
      duration: 5000,
    })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to resend verification email'

    toast.error('Failed to Send Email', {
      description: errorMessage,
      duration: 5000,
    })
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 -translate-y-2"
    enter-to-class="transform opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 translate-y-0"
    leave-to-class="transform opacity-0 -translate-y-2"
  >
    <div
      v-if="shouldShowBanner"
      class="relative bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-l-4 border-amber-500 backdrop-blur-sm"
    >
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-start gap-4">
          <!-- Icon -->
          <div class="shrink-0 mt-0.5">
            <div class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Icon name="lucide:mail-warning" class="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div class="space-y-1">
                <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Icon
                    name="lucide:alert-circle"
                    class="h-4 w-4 text-amber-600 dark:text-amber-400"
                  />
                  Verify Your Email Address
                </h3>
                <p class="text-sm text-muted-foreground">
                  We've sent a verification email to
                  <span class="font-medium text-foreground">{{ authStore.userEmail }}</span
                  >. Please check your inbox and click the verification link to activate your
                  account.
                </p>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  class="border-amber-500/50 hover:bg-amber-500/10 hover:border-amber-500"
                  :disabled="isResending"
                  @click="resendVerification"
                >
                  <Icon
                    v-if="isResending"
                    name="lucide:loader-2"
                    class="mr-2 h-3.5 w-3.5 animate-spin"
                  />
                  <Icon v-else name="lucide:refresh-cw" class="mr-2 h-3.5 w-3.5" />
                  {{ isResending ? 'Sending...' : 'Resend' }}
                </Button>

                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                  aria-label="Dismiss banner"
                  @click="dismissBanner"
                >
                  <Icon name="lucide:x" class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Additional Info -->
            <div class="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
              <Icon name="lucide:info" class="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                Didn't receive the email? Check your spam folder or
                <button
                  class="text-accent hover:underline font-medium"
                  :disabled="isResending"
                  @click="resendVerification"
                >
                  request a new one</button
                >.
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Animated border glow -->
      <div
        class="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-amber-500/50 to-transparent"
      />
    </div>
  </Transition>
</template>

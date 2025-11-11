<script setup lang="ts">
import { GalleryVerticalEnd } from 'lucide-vue-next'
import LoginForm from '~/components/auth/LoginForm.vue'
import { Toaster } from '@/components/ui/sonner'

const router = useRouter()

const handleLoginSuccess = () => {
  // Redirect is handled in the LoginForm component
}

const handleSwitchToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="relative flex flex-col gap-4 p-6 md:p-10">
      <Toaster position="bottom-right" />
      <div class="flex justify-center gap-2 md:justify-start">
        <a href="/" class="flex items-center gap-2 font-medium">
          <div
            class="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground"
          >
            <GalleryVerticalEnd :size="16" />
          </div>
          News App
        </a>
      </div>
      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-xs">
          <LoginForm @success="handleLoginSuccess" @switch-to-register="handleSwitchToRegister" />
        </div>
      </div>
    </div>
    <div class="relative hidden bg-muted lg:block">
      <img
        src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2670&auto=format&fit=crop"
        alt="News and Media"
        class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  </div>
</template>

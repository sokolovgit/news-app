<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'

// Demo functions for different toast types
const showSuccessToast = () => {
  toast.success('Success!', {
    description: 'Your action was completed successfully.',
    duration: 3000,
  })
}

const showErrorToast = () => {
  toast.error('Error Occurred', {
    description: 'Something went wrong. Please try again.',
    duration: 5000,
  })
}

const showWarningToast = () => {
  toast.warning('Warning', {
    description: 'Please review your input before proceeding.',
    duration: 4000,
  })
}

const showInfoToast = () => {
  toast.info('Information', {
    description: 'This is an informational message for you.',
    duration: 3000,
  })
}

const showLoadingToast = () => {
  toast.loading('Loading...', {
    description: 'Please wait while we process your request.',
  })
}

const showPromiseToast = () => {
  const promise = () => new Promise((resolve) => setTimeout(resolve, 2000))

  toast.promise(promise, {
    loading: 'Loading...',
    success: 'Data loaded successfully!',
    error: 'Failed to load data',
  })
}

const showCustomToast = () => {
  toast('Custom Toast', {
    description: 'This is a default styled toast notification.',
    action: {
      label: 'Undo',
      onClick: () => console.log('Undo clicked'),
    },
  })
}
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <div class="mx-auto max-w-4xl space-y-8">
      <div class="space-y-2">
        <h1 class="text-4xl font-bold text-foreground">Toast Notifications Demo</h1>
        <p class="text-muted-foreground">
          Click the buttons below to see different toast notification styles with your brand theme.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Success Toast -->
        <div class="space-y-3 rounded-lg border border-border bg-card p-6">
          <div class="flex items-center gap-2">
            <Icon name="lucide:check-circle" class="h-5 w-5 text-success" />
            <h3 class="font-semibold">Success</h3>
          </div>
          <p class="text-sm text-muted-foreground">Shows positive confirmation messages</p>
          <Button variant="outline" class="w-full" @click="showSuccessToast"> Show Success </Button>
        </div>

        <!-- Error Toast -->
        <div class="space-y-3 rounded-lg border border-border bg-card p-6">
          <div class="flex items-center gap-2">
            <Icon name="lucide:x-circle" class="h-5 w-5 text-destructive" />
            <h3 class="font-semibold">Error</h3>
          </div>
          <p class="text-sm text-muted-foreground">Shows error or failure messages</p>
          <Button variant="outline" class="w-full" @click="showErrorToast"> Show Error </Button>
        </div>

        <!-- Warning Toast -->
        <div class="space-y-3 rounded-lg border border-border bg-card p-6">
          <div class="flex items-center gap-2">
            <Icon name="lucide:alert-triangle" class="h-5 w-5 text-warning" />
            <h3 class="font-semibold">Warning</h3>
          </div>
          <p class="text-sm text-muted-foreground">Shows caution or warning messages</p>
          <Button variant="outline" class="w-full" @click="showWarningToast"> Show Warning </Button>
        </div>

        <!-- Info Toast -->
        <div class="space-y-3 rounded-lg border border-border bg-card p-6">
          <div class="flex items-center gap-2">
            <Icon name="lucide:info" class="h-5 w-5 text-info" />
            <h3 class="font-semibold">Info</h3>
          </div>
          <p class="text-sm text-muted-foreground">Shows informational messages</p>
          <Button variant="outline" class="w-full" @click="showInfoToast"> Show Info </Button>
        </div>

        <!-- Loading Toast -->
        <div class="space-y-3 rounded-lg border border-border bg-card p-6">
          <div class="flex items-center gap-2">
            <Icon name="lucide:loader-2" class="h-5 w-5 text-primary" />
            <h3 class="font-semibold">Loading</h3>
          </div>
          <p class="text-sm text-muted-foreground">Shows loading or processing states</p>
          <Button variant="outline" class="w-full" @click="showLoadingToast"> Show Loading </Button>
        </div>

        <!-- Promise Toast -->
        <div class="space-y-3 rounded-lg border border-border bg-card p-6">
          <div class="flex items-center gap-2">
            <Icon name="lucide:clock" class="h-5 w-5 text-primary" />
            <h3 class="font-semibold">Promise</h3>
          </div>
          <p class="text-sm text-muted-foreground">Tracks async operations</p>
          <Button variant="outline" class="w-full" @click="showPromiseToast"> Show Promise </Button>
        </div>

        <!-- Custom Toast -->
        <div
          class="space-y-3 rounded-lg border border-border bg-card p-6 sm:col-span-2 lg:col-span-3"
        >
          <div class="flex items-center gap-2">
            <Icon name="lucide:sparkles" class="h-5 w-5 text-accent" />
            <h3 class="font-semibold">Custom with Action</h3>
          </div>
          <p class="text-sm text-muted-foreground">Default toast with custom action button</p>
          <Button variant="default" class="w-full sm:w-auto" @click="showCustomToast">
            Show Custom Toast
          </Button>
        </div>
      </div>

      <!-- Usage Examples -->
      <div class="space-y-4 rounded-lg border border-border bg-card p-6">
        <h2 class="text-2xl font-semibold">Usage Examples</h2>
        <div class="space-y-4">
          <div>
            <h3 class="mb-2 font-medium">Success Toast</h3>
            <pre
              class="overflow-x-auto rounded-md bg-muted p-4 text-xs"
            ><code>toast.success('Welcome back!', {
  description: 'You have successfully logged in.',
  duration: 3000,
})</code></pre>
          </div>

          <div>
            <h3 class="mb-2 font-medium">Error Toast</h3>
            <pre
              class="overflow-x-auto rounded-md bg-muted p-4 text-xs"
            ><code>toast.error('Login Failed', {
  description: 'Invalid credentials. Please try again.',
  duration: 5000,
})</code></pre>
          </div>

          <div>
            <h3 class="mb-2 font-medium">Promise Toast</h3>
            <pre
              class="overflow-x-auto rounded-md bg-muted p-4 text-xs"
            ><code>const promise = () => fetch('/api/data')

toast.promise(promise, {
  loading: 'Loading data...',
  success: 'Data loaded successfully!',
  error: 'Failed to load data',
})</code></pre>
          </div>
        </div>
      </div>

      <!-- Back to Home -->
      <div class="flex justify-center">
        <NuxtLink to="/">
          <Button variant="outline">
            <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

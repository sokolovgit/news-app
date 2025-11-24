<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <NuxtLink
        to="/"
        class="absolute top-4 left-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Icon name="lucide:arrow-left" class="h-4 w-4" />
        <span>Back to home</span>
      </NuxtLink>

      <div class="w-full">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from '~/components/theme/ThemeToggle.vue'
</script>

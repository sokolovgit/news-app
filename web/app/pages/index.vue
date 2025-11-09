<template>
  <div class="min-h-screen bg-bg text-text flex items-center justify-center p-8">
    <div class="text-center space-y-6">
      <h1 class="text-5xl font-bold">News App</h1>
      <p class="text-xl text-muted">Welcome to the News Application</p>

      <div class="flex gap-4 justify-center mt-8">
        <NuxtLink
          to="/palette"
          class="px-6 py-3 bg-accent text-bg rounded-lg hover:opacity-90 hover:no-underline transition-opacity font-medium"
        >
          View Color Palette
        </NuxtLink>
      </div>

      <div class="mt-12">
        <ThemeSwitcher />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Home page
</script>

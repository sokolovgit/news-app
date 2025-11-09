<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { resolvedTheme, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center justify-center rounded-md p-2',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'transition-colors',
    ]"
    :aria-label="resolvedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
    @click="toggleTheme"
  >
    <Icon v-if="resolvedTheme === 'light'" name="meteor-icons:sun" size="24" />
    <Icon v-else name="meteor-icons:moon" size="24" />
  </button>
</template>

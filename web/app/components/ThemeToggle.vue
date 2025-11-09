<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { theme, setTheme } = useTheme()

const themes = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '💻' },
] as const
</script>

<template>
  <div class="inline-flex items-center gap-2 rounded-lg border border-border bg-background p-1">
    <button
      v-for="item in themes"
      :key="item.value"
      type="button"
      :class="[
        'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        theme === item.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
      ]"
      @click="setTheme(item.value)"
    >
      <span>{{ item.icon }}</span>
      <span>{{ item.label }}</span>
    </button>
  </div>
</template>

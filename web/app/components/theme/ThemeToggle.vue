<script setup lang="ts">
const colorMode = useColorMode()

const themes = [
  { value: 'light', label: 'Light', icon: 'meteor-icons:sun' },
  { value: 'dark', label: 'Dark', icon: 'meteor-icons:moon' },
  { value: 'system', label: 'System', icon: 'meteor-icons:desktop' },
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
        colorMode.preference === item.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
      ]"
      @click="colorMode.preference = item.value"
    >
      <Icon :name="item.icon" size="24" />
    </button>
  </div>
</template>

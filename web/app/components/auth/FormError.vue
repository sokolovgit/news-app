<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <div
    class="flex items-start gap-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300"
  >
    <Icon name="lucide:alert-circle" class="h-5 w-5 shrink-0 mt-0.5" />
    <span>{{ message }}</span>
  </div>
</template>


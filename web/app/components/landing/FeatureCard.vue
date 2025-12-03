<template>
  <div class="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
    <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
      <Icon :name="icon" class="h-6 w-6 text-primary" />
    </div>
    <h3 class="text-xl font-semibold text-foreground mb-2">{{ title }}</h3>
    <p class="text-muted-foreground leading-relaxed">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
}>()
</script>


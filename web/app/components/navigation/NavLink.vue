<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
    :class="isActive ? 'bg-primary text-primary-foreground' : 'text-foreground bg-card/80 dark:bg-background/60 hover:bg-card dark:hover:bg-background/80'"
  >
    <Icon :name="icon" class="h-4 w-4" />
    <span>{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const route = useRoute()
const props = defineProps<{
  to: string
  label: string
  icon: string
}>()

const isActive = computed(() => {
  if (props.to === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(props.to)
})
</script>

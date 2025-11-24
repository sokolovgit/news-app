<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
    :class="isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'"
    @click="$emit('click')"
  >
    <Icon :name="icon" class="h-5 w-5" />
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

defineEmits<{
  click: []
}>()

const isActive = computed(() => {
  if (props.to === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(props.to)
})
</script>

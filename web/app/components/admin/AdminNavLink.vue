<template>
  <NuxtLink
    :to="to"
    :class="[
      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
    ]"
  >
    <Icon :name="icon" class="h-4 w-4" />
    <span>{{ label }}</span>
    <Badge v-if="badge" variant="secondary" class="ml-auto">
      {{ badge }}
    </Badge>
  </NuxtLink>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  to: string
  icon: string
  label: string
  badge?: string | number
  exact?: boolean
}>()

const route = useRoute()

const isActive = computed(() => {
  if (props.exact) {
    return route.path === props.to
  }
  return route.path.startsWith(props.to)
})
</script>



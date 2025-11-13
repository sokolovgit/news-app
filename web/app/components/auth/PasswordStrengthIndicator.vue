<script setup lang="ts">
import type { PasswordStrength } from '~/composables/usePasswordValidation'

const props = defineProps<{
  strength: PasswordStrength
}>()

const strengthTextColor = computed(() => {
  const colorMap: Record<number, string> = {
    1: 'text-red-600',
    2: 'text-red-600',
    3: 'text-orange-600',
    4: 'text-yellow-600',
    5: 'text-green-600',
  }

  return colorMap[props.strength.score] || 'text-muted-foreground'
})
</script>

<template>
  <div v-if="strength.label" class="space-y-2">
    <div class="flex items-center justify-between text-xs">
      <span class="text-muted-foreground">Password strength:</span>
      <span :class="['font-medium', strengthTextColor]">
        {{ strength.label }}
      </span>
    </div>
    <div class="flex gap-1">
      <div
        v-for="i in 5"
        :key="i"
        :class="[
          'h-1.5 flex-1 rounded-full transition-all duration-300',
          i <= strength.score ? strength.color : 'bg-muted',
        ]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PasswordStrength } from '~/composables/usePasswordValidation'

defineProps<{
  strength: PasswordStrength
}>()
</script>

<template>
  <div v-if="strength.label" class="space-y-2">
    <div class="flex items-center justify-between text-xs">
      <span class="text-muted-foreground">Password strength:</span>
      <span
        :class="[
          'font-medium',
          strength.score <= 2
            ? 'text-red-600'
            : strength.score === 3
              ? 'text-orange-600'
              : strength.score === 4
                ? 'text-yellow-600'
                : 'text-green-600',
        ]"
      >
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


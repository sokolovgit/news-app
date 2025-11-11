<script setup lang="ts">
import type { PasswordRequirement } from '~/composables/usePasswordValidation'

defineProps<{
  requirements: PasswordRequirement[]
}>()
</script>

<template>
  <div class="bg-muted/10 rounded-lg p-3.5 space-y-2 border border-muted">
    <p class="text-xs font-medium text-muted-foreground">Password must contain:</p>
    <ul class="space-y-1.5">
      <li
        v-for="(req, index) in requirements"
        :key="index"
        class="flex items-center gap-2 text-xs transition-colors"
      >
        <Icon
          :name="req.met ? 'lucide:check-circle-2' : 'lucide:circle'"
          :class="[
            'h-3.5 w-3.5 transition-colors',
            req.met ? 'text-green-600' : 'text-muted-foreground',
          ]"
        />
        <span :class="req.met ? 'text-foreground font-medium' : 'text-muted-foreground'">
          {{ req.text }}
        </span>
      </li>
    </ul>
  </div>
</template>

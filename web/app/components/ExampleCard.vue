<script setup lang="ts">
/**
 * Example component demonstrating proper use of theme colors
 * This shows best practices for building theme-aware components
 */

interface Props {
  title: string
  description?: string
  featured?: boolean
}

defineProps<Props>()
</script>

<template>
  <article
    :class="[
      'rounded-lg border transition-colors',
      featured ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-border bg-card',
    ]"
  >
    <!-- Card Header -->
    <div class="p-6 space-y-2">
      <h3 :class="['text-xl font-semibold', featured ? 'text-primary' : 'text-card-foreground']">
        {{ title }}
      </h3>

      <p v-if="description" class="text-sm text-muted-foreground">
        {{ description }}
      </p>
    </div>

    <!-- Card Content -->
    <div class="px-6 pb-6">
      <slot />
    </div>

    <!-- Card Footer -->
    <div v-if="$slots.footer" class="border-t border-border bg-muted/50 px-6 py-4">
      <slot name="footer" />
    </div>
  </article>
</template>

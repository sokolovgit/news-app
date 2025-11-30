<template>
  <Card class="overflow-hidden border-border/50 bg-card/50">
    <!-- Cover Skeleton -->
    <Skeleton class="w-full h-40" />

    <!-- Content Skeleton -->
    <div class="p-4 space-y-3">
      <Skeleton class="h-5 w-3/4" />
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-2/3" />

      <div class="flex items-center justify-between pt-3 border-t border-border/50">
        <div class="flex items-center gap-3">
          <Skeleton class="h-4 w-16" />
          <Skeleton class="h-4 w-12" />
        </div>
        <Skeleton class="h-6 w-16" />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>


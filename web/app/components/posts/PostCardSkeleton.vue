<template>
  <Card class="overflow-hidden border-border/50 bg-card/50">
    <!-- Media Skeleton -->
    <Skeleton class="h-52 w-full rounded-none" />

    <!-- Content Skeleton -->
    <div class="p-4 space-y-3">
      <div class="flex items-center gap-2">
        <Skeleton class="h-5 w-20 rounded-full" />
        <Skeleton class="h-4 w-16" />
      </div>
      <Skeleton class="h-5 w-4/5" />
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-3/4" />
      <div class="flex items-center justify-between pt-3 border-t border-border/50">
        <Skeleton class="h-4 w-24" />
        <Skeleton class="h-4 w-16" />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>

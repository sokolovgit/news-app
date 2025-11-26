<template>
  <Card>
    <CardHeader>
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 space-y-2">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-6 w-3/4" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-2/3" />
        </div>
        <Skeleton class="h-8 w-8 rounded-full" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton class="h-4 w-full mb-2" />
      <Skeleton class="h-4 w-5/6" />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>


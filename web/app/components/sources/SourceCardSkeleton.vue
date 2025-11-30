<template>
  <Card>
    <CardHeader>
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3 flex-1">
          <Skeleton class="h-10 w-10 rounded-lg" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-5 w-3/4" />
            <Skeleton class="h-4 w-full" />
          </div>
        </div>
        <Skeleton class="h-5 w-16" />
      </div>
    </CardHeader>
    <CardContent>
      <div class="space-y-2">
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-2/3" />
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton class="h-8 w-20" />
      <Skeleton class="h-8 w-16" />
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>



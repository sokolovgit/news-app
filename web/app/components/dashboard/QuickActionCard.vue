<template>
  <Card class="cursor-pointer hover:shadow-lg transition-shadow" @click="$emit('click')">
    <CardHeader>
      <div class="flex items-center gap-3">
        <div class="p-3 rounded-lg bg-primary/10">
          <Icon :name="icon" class="h-6 w-6 text-primary-foreground" />
        </div>
        <div class="flex-1">
          <CardTitle class="text-lg">{{ title }}</CardTitle>
          <CardDescription>{{ description }}</CardDescription>
        </div>
        <Icon name="lucide:arrow-right" class="h-5 w-5 text-muted-foreground" />
      </div>
    </CardHeader>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

defineProps<{
  title: string
  description: string
  icon: string
}>()

defineEmits<{
  click: []
}>()
</script>

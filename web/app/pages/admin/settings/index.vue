<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Settings</h1>
        <p class="text-muted-foreground mt-1">Configure admin settings</p>
      </div>
    </div>

    <!-- Coming Soon -->
    <Card>
      <CardContent class="py-16">
        <div class="text-center">
          <Icon name="lucide:settings" class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-foreground mb-2">Admin Settings</h3>
          <p class="text-muted-foreground max-w-md mx-auto">
            Admin settings are coming soon. You'll be able to configure system-wide settings, notifications, and more from here.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})
</script>



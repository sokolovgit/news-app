<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner'
import { Toaster as Sonner } from 'vue-sonner'

const props = withDefaults(defineProps<ToasterProps>(), {
  position: 'bottom-right',
  expand: false,
  richColors: false,
  closeButton: true,
})
</script>

<template>
  <Sonner v-bind="props" :theme="'system'" :toast-options="{ unstyled: false }" />
</template>

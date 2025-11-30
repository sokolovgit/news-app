<template>
  <SettingsDialog :open="isOpen" @update:open="isOpen = $event" />
</template>

<script setup lang="ts">
import SettingsDialog from './SettingsDialog.vue'

const isOpen = ref(false)

// Listen for open-settings event
onMounted(() => {
  window.addEventListener('open-settings', () => {
    isOpen.value = true
  })
})

onUnmounted(() => {
  window.removeEventListener('open-settings', () => {
    isOpen.value = true
  })
})
</script>




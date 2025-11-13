<script setup lang="ts">
const colorMode = useColorMode()

const toggleTheme = () => {
  // Cycle through light -> dark -> system
  if (colorMode.preference === 'light') {
    colorMode.preference = 'dark'
  } else if (colorMode.preference === 'dark') {
    colorMode.preference = 'system'
  } else {
    colorMode.preference = 'light'
  }
}

const getCurrentIcon = computed(() => {
  if (colorMode.preference === 'light') return 'meteor-icons:sun'
  if (colorMode.preference === 'dark') return 'meteor-icons:moon'
  return 'meteor-icons:desktop'
})

const getLabel = computed(() => {
  if (colorMode.preference === 'light') return 'Switch to dark mode'
  if (colorMode.preference === 'dark') return 'Switch to system mode'
  return 'Switch to light mode'
})
</script>

<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center justify-center rounded-md p-2',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'transition-colors',
    ]"
    :aria-label="getLabel"
    @click="toggleTheme"
  >
    <Icon :name="getCurrentIcon" size="24" />
  </button>
</template>

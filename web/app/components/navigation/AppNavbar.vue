<template>
  <nav class="sticky top-0 z-50 w-full border-b border-border bg-card backdrop-blur-sm">
    <div class="container mx-auto flex h-16 items-center justify-between px-4">
      <!-- Logo and Mobile Menu Button -->
      <div class="flex items-center gap-4">
        <button
          class="md:hidden p-2 rounded-md text-foreground hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary transition-opacity"
          @click="toggleMobileMenu"
        >
          <Icon name="lucide:menu" class="h-6 w-6" />
        </button>
        <NuxtLink
          to="/"
          class="flex items-center gap-2 font-bold text-xl text-primary-foreground hover:opacity-80"
        >
          <Icon name="lucide:newspaper" class="h-6 w-6" />
          <span class="hidden sm:inline">News App</span>
        </NuxtLink>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-1">
        <NavLink to="/feed" label="Feed" icon="lucide:rss" />
        <NavLink to="/sources" label="Sources" icon="lucide:book-open" />
        <NavLink to="/profile" label="Profile" icon="lucide:user" />
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-4">
        <!-- Search (Desktop) -->
        <div class="hidden lg:flex items-center">
          <button
            class="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            @click="openSearch"
          >
            <Icon name="lucide:search" class="h-4 w-4" />
            <span>Search...</span>
            <kbd
              class="pointer-events-none hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-foreground opacity-100"
            >
              <span class="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        <!-- Notifications (Future) -->
        <button
          class="hidden md:flex p-2 rounded-md text-foreground hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary relative transition-opacity"
          @click="openNotifications"
        >
          <Icon name="lucide:bell" class="h-5 w-5" />
          <!-- Badge for unread notifications can be added here -->
        </button>

        <!-- User Dropdown -->
        <UserDropdown />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import NavLink from './NavLink.vue'
import UserDropdown from './UserDropdown.vue'

const emit = defineEmits<{
  'toggle-mobile-menu': []
}>()

const toggleMobileMenu = () => {
  emit('toggle-mobile-menu')
}

const openSearch = () => {
  // TODO: Implement search functionality
  console.log('Open search')
}

const openNotifications = () => {
  // TODO: Implement notifications
  console.log('Open notifications')
}
</script>

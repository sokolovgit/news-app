<template>
  <div class="min-h-screen bg-background">
    <!-- Admin Top Bar -->
    <header
      class="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60"
    >
      <div class="flex h-14 items-center px-4 gap-4">
        <!-- Mobile Menu Toggle -->
        <button
          class="lg:hidden p-2 rounded-md text-foreground hover:bg-accent transition-colors"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <Icon name="lucide:menu" class="h-5 w-5" />
        </button>

        <!-- Logo -->
        <NuxtLink to="/admin" class="flex items-center gap-2 font-bold text-lg text-foreground">
          <Icon name="lucide:shield" class="h-5 w-5 text-primary" />
          <span class="hidden sm:inline">Admin Panel</span>
        </NuxtLink>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Back to App -->
        <NuxtLink
          to="/"
          class="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="lucide:arrow-left" class="h-4 w-4" />
          <span class="hidden sm:inline">Back to App</span>
        </NuxtLink>

        <!-- Theme Toggle -->
        <button
          class="p-2 rounded-md text-foreground hover:bg-accent transition-colors"
          @click="toggleTheme"
        >
          <Icon :name="themeIcon" class="h-5 w-5" />
        </button>

        <!-- User Menu -->
        <AdminUserDropdown />
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <aside
        :class="[
          'fixed lg:sticky top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r border-border bg-card transition-transform duration-300 ease-in-out',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ]"
      >
        <!-- Overlay for mobile -->
        <div
          v-if="isSidebarOpen"
          class="fixed inset-0 bg-black/50 lg:hidden -z-10"
          @click="isSidebarOpen = false"
        />

        <nav class="flex flex-col gap-1 p-4">
          <p class="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Overview
          </p>
          <AdminNavLink
            to="/admin"
            icon="lucide:layout-dashboard"
            label="Dashboard"
            :exact="true"
          />

          <p
            class="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Management
          </p>
          <AdminNavLink to="/admin/complaints" icon="lucide:flag" label="Complaints" />
          <AdminNavLink to="/admin/users" icon="lucide:users" label="Users" />
          <AdminNavLink to="/admin/sources" icon="lucide:book-open" label="Sources" />
          <AdminNavLink to="/admin/articles" icon="lucide:file-text" label="Articles" />

          <p
            class="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            System
          </p>
          <AdminNavLink to="/admin/settings" icon="lucide:settings" label="Settings" />
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 min-h-[calc(100vh-3.5rem)] lg:ml-0">
        <div class="container mx-auto p-6 max-w-7xl">
          <NuxtPage />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import { useColorMode } from '#imports'
import AdminNavLink from '~/components/admin/AdminNavLink.vue'
import AdminUserDropdown from '~/components/admin/AdminUserDropdown.vue'

const authStore = useAuthStore()
const colorMode = useColorMode()

const isSidebarOpen = ref(false)

// Initialize auth on mount
onMounted(() => {
  authStore.initAuth()
})

const themeIcon = computed(() => {
  return colorMode.preference === 'dark' ? 'lucide:sun' : 'lucide:moon'
})

const toggleTheme = () => {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}

// Close sidebar on route change (mobile)
const route = useRoute()
watch(
  () => route.path,
  () => {
    isSidebarOpen.value = false
  },
)
</script>

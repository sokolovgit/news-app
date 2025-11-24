<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button
        class="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <Avatar class="h-8 w-8">
          <AvatarImage v-if="avatarUrl" :src="avatarUrl" :alt="userEmail || 'User'" />
          <AvatarFallback class="bg-primary text-primary-foreground">
            {{ userInitials }}
          </AvatarFallback>
        </Avatar>
        <span class="hidden md:block text-sm font-medium text-foreground">{{ userEmail }}</span>
        <Icon name="lucide:chevron-down" class="hidden md:block h-4 w-4 text-muted-foreground" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56">
      <DropdownMenuLabel class="font-normal">
        <div class="flex flex-col space-y-1">
          <p class="text-sm font-medium leading-none">{{ userEmail }}</p>
          <p class="text-xs leading-none text-muted-foreground">{{ userRoles.join(', ') }}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="cursor-pointer" @click="navigateTo('/profile')">
        <Icon name="lucide:user" class="mr-2 h-4 w-4" />
        <span>Profile</span>
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer" @click="openSettings">
        <Icon name="lucide:settings" class="mr-2 h-4 w-4" />
        <span>Settings</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="cursor-pointer" @click="toggleTheme">
        <Icon :name="themeIcon" class="mr-2 h-4 w-4" />
        <span>{{ themeLabel }}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="cursor-pointer text-error" @click="handleLogout">
        <Icon name="lucide:log-out" class="mr-2 h-4 w-4" />
        <span>Logout</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '~/stores/auth.store'
import { useColorMode } from '#imports'

const authStore = useAuthStore()
const router = useRouter()
const colorMode = useColorMode()

const userEmail = computed(() => authStore.userEmail || 'User')
const userRoles = computed(() => authStore.userRoles)

const userInitials = computed(() => {
  const email = userEmail.value
  if (!email || email === 'User') return 'U'
  const localPart = email.split('@')[0]
  if (!localPart) return 'U'
  const parts = localPart.split('.')
  if (parts.length >= 2 && parts[0] && parts[1]) {
    const first = parts[0][0]
    const second = parts[1][0]
    if (first && second) {
      return (first + second).toUpperCase()
    }
  }
  return localPart[0]?.toUpperCase() || 'U'
})

const avatarUrl = computed<string | undefined>(() => undefined) // Can be extended later with user avatars

const themeIcon = computed(() => {
  return colorMode.preference === 'dark' ? 'lucide:sun' : 'lucide:moon'
})

const themeLabel = computed(() => {
  return colorMode.preference === 'dark' ? 'Light Mode' : 'Dark Mode'
})

const toggleTheme = () => {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}

const openSettings = () => {
  // Emit event to open settings dialog (will be handled by parent)
  const event = new CustomEvent('open-settings')
  window.dispatchEvent(event)
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

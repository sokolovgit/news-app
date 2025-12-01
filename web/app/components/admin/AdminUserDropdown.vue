<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button
        class="flex items-center gap-2 rounded-full p-1 hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <Avatar class="h-8 w-8">
          <AvatarFallback class="bg-primary text-primary-foreground text-sm">
            {{ userInitials }}
          </AvatarFallback>
        </Avatar>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56">
      <DropdownMenuLabel class="font-normal">
        <div class="flex flex-col space-y-1">
          <p class="text-sm font-medium leading-none">{{ userEmail }}</p>
          <p class="text-xs leading-none text-muted-foreground">Administrator</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="cursor-pointer" @click="navigateTo('/profile')">
        <Icon name="lucide:user" class="mr-2 h-4 w-4" />
        <span>Profile</span>
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer" @click="navigateTo('/')">
        <Icon name="lucide:home" class="mr-2 h-4 w-4" />
        <span>Go to App</span>
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '~/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()

const userEmail = computed(() => authStore.userEmail || 'Admin')

const userInitials = computed(() => {
  const email = userEmail.value
  if (!email || email === 'Admin') return 'A'
  const localPart = email.split('@')[0]
  if (!localPart) return 'A'
  return localPart[0]?.toUpperCase() || 'A'
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>



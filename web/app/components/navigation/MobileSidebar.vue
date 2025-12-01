<template>
  <Sheet :open="isOpen" @update:open="updateOpen">
    <SheetContent side="left" class="w-[300px] sm:w-[400px]">
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="flex items-center gap-2 mb-6">
          <Icon name="lucide:newspaper" class="h-6 w-6 text-primary-foreground" />
          <h2 class="text-xl font-bold text-foreground">News App</h2>
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-col gap-1 flex-1">
          <MobileNavLink to="/feed" label="Feed" icon="lucide:rss" @click="close" />
          <MobileNavLink to="/articles" label="Articles" icon="lucide:file-text" @click="close" />
          <MobileNavLink to="/sources" label="Sources" icon="lucide:book-open" @click="close" />
          <MobileNavLink
            to="/sources/add"
            label="Add Source"
            icon="lucide:plus-circle"
            @click="close"
          />
          <MobileNavLink to="/profile" label="Profile" icon="lucide:user" @click="close" />
          <MobileNavLink
            v-if="isAdmin"
            to="/admin"
            label="Admin Panel"
            icon="lucide:shield"
            @click="close"
          />
        </nav>

        <!-- User Section -->
        <div class="border-t border-border pt-4 mt-auto">
          <div class="flex items-center gap-3 mb-4 px-2">
            <Avatar class="h-10 w-10">
              <AvatarImage v-if="avatarUrl" :src="avatarUrl" :alt="userEmail || 'User'" />
              <AvatarFallback class="bg-primary text-primary-foreground">
                {{ userInitials }}
              </AvatarFallback>
            </Avatar>
            <div class="flex flex-col flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate">{{ userEmail }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ userRoles.join(', ') }}</p>
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <button
              class="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              @click="openSettings"
            >
              <Icon name="lucide:settings" class="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button
              class="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-error hover:bg-muted transition-colors"
              @click="handleLogout"
            >
              <Icon name="lucide:log-out" class="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import MobileNavLink from './MobileNavLink.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useAuthStore } from '~/stores/auth.store'
import { UserRole } from '~/models/user.model'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const authStore = useAuthStore()
const router = useRouter()

const userEmail = computed(() => authStore.userEmail || 'User')
const userRoles = computed(() => authStore.userRoles)
const isAdmin = computed(() => authStore.userRoles.includes(UserRole.ADMIN))

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

const avatarUrl = computed<string | undefined>(() => undefined)

const updateOpen = (value: boolean) => {
  emit('update:open', value)
}

const close = () => {
  updateOpen(false)
}

const openSettings = () => {
  close()
  const event = new CustomEvent('open-settings')
  window.dispatchEvent(event)
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    close()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

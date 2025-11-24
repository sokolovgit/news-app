<template>
  <Dialog :open="isOpen" @update:open="updateOpen">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>
          Manage your application settings and preferences
        </DialogDescription>
      </DialogHeader>

      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <!-- General Tab -->
        <TabsContent value="general" class="space-y-4 mt-4">
          <div class="space-y-4">
            <div>
              <Label>Default Page</Label>
              <p class="text-sm text-muted-foreground mb-2">
                Choose which page to show when you log in
              </p>
              <Select v-model="settings.defaultPage">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="sources">Sources</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <Label>Posts Per Page</Label>
              <p class="text-sm text-muted-foreground mb-2">
                Number of posts to display per page
              </p>
              <Select v-model="settings.postsPerPage">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <Label>Auto-refresh Interval</Label>
              <p class="text-sm text-muted-foreground mb-2">
                How often to automatically refresh your feed
              </p>
              <Select v-model="settings.autoRefresh">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="5">Every 5 minutes</SelectItem>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="60">Every hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <!-- Appearance Tab -->
        <TabsContent value="appearance" class="space-y-4 mt-4">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p class="text-sm text-muted-foreground">
                  Choose your preferred theme
                </p>
              </div>
              <Select v-model="settings.theme">
                <SelectTrigger class="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div class="flex items-center justify-between">
              <div>
                <Label>Compact Mode</Label>
                <p class="text-sm text-muted-foreground">
                  Use a more compact layout
                </p>
              </div>
              <Switch v-model="settings.compactMode" />
            </div>

            <Separator />

            <div>
              <Label>Font Size</Label>
              <p class="text-sm text-muted-foreground mb-2">
                Adjust the base font size
              </p>
              <Select v-model="settings.fontSize">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <!-- Notifications Tab -->
        <TabsContent value="notifications" class="space-y-4 mt-4">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p class="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch v-model="settings.emailNotifications" />
            </div>

            <Separator />

            <div class="flex items-center justify-between">
              <div>
                <Label>New Post Notifications</Label>
                <p class="text-sm text-muted-foreground">
                  Get notified when new posts are available
                </p>
              </div>
              <Switch v-model="settings.newPostNotifications" />
            </div>

            <Separator />

            <div class="flex items-center justify-between">
              <div>
                <Label>Source Updates</Label>
                <p class="text-sm text-muted-foreground">
                  Notify when sources are updated or have errors
                </p>
              </div>
              <Switch v-model="settings.sourceUpdateNotifications" />
            </div>
          </div>
        </TabsContent>

        <!-- Account Tab -->
        <TabsContent value="account" class="space-y-4 mt-4">
          <div class="space-y-4">
            <div>
              <Label>Change Password</Label>
              <p class="text-sm text-muted-foreground mb-2">
                Update your account password
              </p>
              <Button variant="outline" @click="openChangePassword">
                Change Password
              </Button>
            </div>

            <Separator />

            <div>
              <Label>Export Data</Label>
              <p class="text-sm text-muted-foreground mb-2">
                Download a copy of your data
              </p>
              <Button variant="outline" @click="exportData">
                <Icon name="lucide:download" class="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>

            <Separator />

            <div>
              <Label class="text-error">Danger Zone</Label>
              <p class="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data
              </p>
              <Button variant="destructive" @click="openDeleteAccount">
                <Icon name="lucide:trash-2" class="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button variant="outline" @click="handleReset">
          Reset to Defaults
        </Button>
        <Button variant="outline" @click="updateOpen(false)">
          Cancel
        </Button>
        <Button @click="handleSave">
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useColorMode } from '#imports'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const colorMode = useColorMode()
const activeTab = ref('general')

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const updateOpen = (value: boolean) => {
  isOpen.value = value
}

const settings = ref({
  defaultPage: 'feed',
  postsPerPage: '20',
  autoRefresh: 'never',
  theme: 'system',
  compactMode: false,
  fontSize: 'medium',
  emailNotifications: true,
  newPostNotifications: false,
  sourceUpdateNotifications: true,
})

// Watch theme changes and apply them
watch(
  () => settings.value.theme,
  (newTheme) => {
    if (colorMode) {
      colorMode.preference = newTheme as 'light' | 'dark' | 'system'
    }
  }
)

const handleSave = async () => {
  // TODO: Save settings to backend/localStorage
  console.log('Saving settings:', settings.value)
  // Save to localStorage for now
  localStorage.setItem('app-settings', JSON.stringify(settings.value))
  updateOpen(false)
}

const handleReset = () => {
  settings.value = {
    defaultPage: 'feed',
    postsPerPage: '20',
    autoRefresh: 'never',
    theme: 'system',
    compactMode: false,
    fontSize: 'medium',
    emailNotifications: true,
    newPostNotifications: false,
    sourceUpdateNotifications: true,
  }
}

const openChangePassword = () => {
  // TODO: Open change password dialog
  console.log('Open change password')
}

const exportData = () => {
  // TODO: Implement data export
  console.log('Export data')
}

const openDeleteAccount = () => {
  // TODO: Open delete account confirmation dialog
  console.log('Open delete account')
}

// Load settings on mount
onMounted(() => {
  const savedSettings = localStorage.getItem('app-settings')
  if (savedSettings) {
    try {
      settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }
})
</script>


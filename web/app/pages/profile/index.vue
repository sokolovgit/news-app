<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Profile Header -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-6">
          <Avatar class="h-20 w-20">
            <AvatarImage v-if="avatarUrl" :src="avatarUrl" :alt="userEmail || 'User'" />
            <AvatarFallback class="bg-primary text-primary-foreground text-2xl">
              {{ userInitials }}
            </AvatarFallback>
          </Avatar>
          <div class="flex-1">
            <CardTitle class="text-2xl">{{ userEmail }}</CardTitle>
            <CardDescription class="mt-1">
              {{ userRoles.join(', ') }}
            </CardDescription>
            <div class="flex items-center gap-2 mt-2">
              <Badge v-if="isEmailVerified" variant="default">
                <Icon name="lucide:check-circle" class="h-3 w-3 mr-1" />
                Verified
              </Badge>
              <Badge v-else variant="outline">
                <Icon name="lucide:mail" class="h-3 w-3 mr-1" />
                Unverified
              </Badge>
            </div>
          </div>
          <Button variant="outline">
            <Icon name="lucide:edit" class="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </CardHeader>
    </Card>

    <!-- Tabs -->
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
      </TabsList>

      <!-- Overview Tab -->
      <TabsContent value="overview" class="space-y-4 mt-6">
        <div class="grid gap-4 md:grid-cols-2">
          <!-- Account Information -->
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <Label class="text-muted-foreground">Email</Label>
                <p class="text-foreground font-medium">{{ userEmail }}</p>
              </div>
              <div>
                <Label class="text-muted-foreground">Account Created</Label>
                <p class="text-foreground font-medium">{{ accountCreated }}</p>
              </div>
              <div>
                <Label class="text-muted-foreground">Email Verified</Label>
                <p class="text-foreground font-medium">
                  {{ isEmailVerified ? 'Yes' : 'No' }}
                </p>
              </div>
            </CardContent>
          </Card>

          <!-- Statistics -->
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <Label class="text-muted-foreground">Total Sources</Label>
                <p class="text-foreground font-medium text-2xl">{{ stats.totalSources }}</p>
              </div>
              <div>
                <Label class="text-muted-foreground">Posts Read</Label>
                <p class="text-foreground font-medium text-2xl">{{ stats.postsRead }}</p>
              </div>
              <div>
                <Label class="text-muted-foreground">Account Age</Label>
                <p class="text-foreground font-medium">{{ stats.accountAge }}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- Activity Tab -->
      <TabsContent value="activity" class="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="activities.length === 0" class="text-center py-8">
              <Icon name="lucide:activity" class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p class="text-muted-foreground">No recent activity</p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="activity in activities"
                :key="activity.id"
                class="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div class="p-2 rounded-lg bg-primary/10">
                  <Icon :name="activity.icon" class="h-4 w-4 text-primary-foreground" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-foreground">{{ activity.title }}</p>
                  <p class="text-xs text-muted-foreground">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Preferences Tab -->
      <TabsContent value="preferences" class="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <Label>Notifications</Label>
                <p class="text-sm text-muted-foreground">Receive email notifications</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div class="flex items-center justify-between">
              <div>
                <Label>Default Page</Label>
                <p class="text-sm text-muted-foreground">Page to show when you log in</p>
              </div>
              <Select default-value="feed">
                <SelectTrigger class="w-[180px]">
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
              <Label>Settings</Label>
              <p class="text-sm text-muted-foreground mb-4">
                For more settings, use the Settings button in the navigation menu.
              </p>
              <Button variant="outline" @click="openSettings">
                <Icon name="lucide:settings" class="mr-2 h-4 w-4" />
                Open Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '~/stores/auth.store'

definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const activeTab = ref('overview')

const userEmail = computed(() => authStore.userEmail || 'User')
const userRoles = computed(() => authStore.userRoles)
const isEmailVerified = computed(() => authStore.isEmailVerified)

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

const accountCreated = computed(() => {
  // TODO: Get from user data
  return 'January 2025'
})

const stats = ref({
  totalSources: 0,
  postsRead: 0,
  accountAge: '0 days',
})

const activities = ref<any[]>([])

const openSettings = () => {
  const event = new CustomEvent('open-settings')
  window.dispatchEvent(event)
}

// TODO: Fetch user stats and activities
onMounted(async () => {
  // const userStats = await fetchUserStats()
  // stats.value = userStats
  // const userActivities = await fetchUserActivities()
  // activities.value = userActivities
})
</script>

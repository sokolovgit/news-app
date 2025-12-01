<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
      <p class="text-muted-foreground mt-1">Overview of your admin activities</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Pending Complaints</CardTitle>
          <Icon name="lucide:flag" class="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ adminStore.pendingComplaintsCount }}</div>
          <p class="text-xs text-muted-foreground">Requires attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Under Review</CardTitle>
          <Icon name="lucide:eye" class="h-4 w-4 text-info" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ adminStore.reviewedComplaintsCount }}</div>
          <p class="text-xs text-muted-foreground">Being investigated</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Resolved</CardTitle>
          <Icon name="lucide:check-circle" class="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ adminStore.resolvedComplaintsCount }}</div>
          <p class="text-xs text-muted-foreground">Successfully handled</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Rejected</CardTitle>
          <Icon name="lucide:x-circle" class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ adminStore.rejectedComplaintsCount }}</div>
          <p class="text-xs text-muted-foreground">Dismissed reports</p>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Actions -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card class="cursor-pointer hover:border-primary transition-colors" @click="navigateTo('/admin/complaints')">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Icon name="lucide:flag" class="h-5 w-5 text-primary" />
            Manage Complaints
          </CardTitle>
          <CardDescription>Review and handle user complaints</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge v-if="adminStore.pendingComplaintsCount > 0" variant="destructive">
            {{ adminStore.pendingComplaintsCount }} pending
          </Badge>
          <Badge v-else variant="secondary">All caught up</Badge>
        </CardContent>
      </Card>

      <Card class="cursor-pointer hover:border-primary transition-colors" @click="navigateTo('/admin/users')">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Icon name="lucide:users" class="h-5 w-5 text-primary" />
            Manage Users
          </CardTitle>
          <CardDescription>View and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">View users</Badge>
        </CardContent>
      </Card>

      <Card class="cursor-pointer hover:border-primary transition-colors" @click="navigateTo('/admin/sources')">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Icon name="lucide:book-open" class="h-5 w-5 text-primary" />
            Manage Sources
          </CardTitle>
          <CardDescription>Monitor and control news sources</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">View sources</Badge>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Pending Complaints -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center justify-between">
          <span>Recent Pending Complaints</span>
          <Button variant="outline" size="sm" @click="navigateTo('/admin/complaints')">
            View All
            <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>Latest complaints that need your attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="recentComplaintsLoading" class="space-y-4">
          <Skeleton v-for="i in 3" :key="i" class="h-16 w-full" />
        </div>
        
        <div v-else-if="recentComplaints.length === 0" class="text-center py-8 text-muted-foreground">
          <Icon name="lucide:check-circle" class="h-12 w-12 mx-auto mb-2 text-success" />
          <p>No pending complaints!</p>
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="complaint in recentComplaints"
            :key="complaint.id"
            class="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="p-2 rounded-full bg-warning/10">
                <Icon name="lucide:flag" class="h-4 w-4 text-warning" />
              </div>
              <div>
                <p class="font-medium text-foreground">
                  {{ formatReason(complaint.reason) }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ complaint.targetType }} • {{ formatDate(complaint.createdAt) }}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" @click="navigateTo(`/admin/complaints?id=${complaint.id}`)">
              Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminStore } from '~/stores/admin.store'
import { AdminService, type Complaint } from '~/lib/api/admin.service'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const adminStore = useAdminStore()

const recentComplaints = ref<Complaint[]>([])
const recentComplaintsLoading = ref(true)

const formatReason = (reason: string) => {
  return reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString()
}

onMounted(async () => {
  // Fetch stats
  await adminStore.fetchStats()
  
  // Fetch recent pending complaints
  try {
    const api = useApi()
    const adminService = new AdminService(api)
    const response = await adminService.getComplaints({
      status: 'pending',
      limit: 5,
      sortField: 'createdAt',
      sortOrder: 'desc',
    })
    recentComplaints.value = response.data
  } catch (error) {
    console.error('Failed to fetch recent complaints:', error)
  } finally {
    recentComplaintsLoading.value = false
  }
})
</script>



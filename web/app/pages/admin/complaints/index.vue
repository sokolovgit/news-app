<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Complaints</h1>
        <p class="text-muted-foreground mt-1">Manage user complaints</p>
      </div>
      <Button variant="outline" @click="fetchComplaints(true)">
        <Icon name="lucide:refresh-cw" class="mr-2 h-4 w-4" />
        Refresh
      </Button>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[200px] relative">
            <Icon
              name="lucide:search"
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            />
            <Input
              v-model="searchQuery"
              placeholder="Search complaints..."
              class="pl-9"
              @keyup.enter="handleSearch"
            />
          </div>

          <Select v-model="statusFilter" @update:model-value="handleFilterChange">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="targetTypeFilter" @update:model-value="handleFilterChange">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Target Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="source">Source</SelectItem>
              <SelectItem value="post">Post</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" @click="resetFilters">
            <Icon name="lucide:x" class="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <Skeleton v-for="i in 5" :key="i" class="h-32 w-full" />
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive">
      <Icon name="lucide:alert-circle" class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Data Table -->
    <Card v-else class="overflow-hidden">
      <CardContent class="p-0">
        <div class="overflow-x-auto">
          <div class="py-1">
            <Table>
              <TableHeader>
                <TableRow class="border-b">
                  <TableHead class="w-12 font-semibold">#</TableHead>
                  <TableHead
                    v-for="header in table.getHeaderGroups()[0]?.headers || []"
                    :key="header.id"
                    class="font-semibold"
                  >
                    <div
                      v-if="!header.isPlaceholder"
                      class="flex items-center gap-2 transition-colors"
                      :class="{
                        'cursor-pointer select-none hover:text-foreground':
                          header.column.getCanSort(),
                      }"
                      @click="header.column.getToggleSortingHandler()?.($event)"
                    >
                      {{
                        typeof header.column.columnDef.header === 'string'
                          ? header.column.columnDef.header
                          : ''
                      }}
                      <Icon
                        v-if="header.column.getCanSort()"
                        :name="
                          header.column.getIsSorted() === 'asc'
                            ? 'lucide:arrow-up'
                            : header.column.getIsSorted() === 'desc'
                              ? 'lucide:arrow-down'
                              : 'lucide:arrow-up-down'
                        "
                        class="h-4 w-4 transition-colors"
                        :class="{
                          'text-foreground': header.column.getIsSorted(),
                          'text-muted-foreground': !header.column.getIsSorted(),
                        }"
                      />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="complaints.length === 0" class="hover:bg-transparent">
                  <TableCell :colspan="7" class="h-32 text-center">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <Icon name="lucide:flag" class="h-12 w-12 text-muted-foreground" />
                      <p class="text-sm text-muted-foreground">
                        {{
                          searchQuery || statusFilter !== 'all' || targetTypeFilter !== 'all'
                            ? 'No complaints found matching your filters.'
                            : 'No complaints found.'
                        }}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow
                  v-for="(row, index) in table.getRowModel().rows"
                  :key="row.id"
                  class="transition-colors hover:bg-muted/50"
                >
                  <TableCell class="text-muted-foreground font-medium">
                    {{ offset + index + 1 }}
                  </TableCell>
                  <TableCell>
                    <Badge :variant="getReasonVariant(row.original.reason)">
                      {{ formatReason(row.original.reason) }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="getStatusVariant(row.original.status)">
                      {{ formatStatus(row.original.status) }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div class="flex flex-col gap-1">
                      <span class="text-sm font-medium capitalize">{{
                        row.original.targetType
                      }}</span>
                      <span
                        class="text-xs text-muted-foreground font-mono truncate"
                        :title="row.original.targetId"
                      >
                        {{ row.original.targetId }}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div v-if="row.original.reporter" class="flex items-center gap-2">
                      <Avatar class="h-8 w-8">
                        <AvatarFallback class="bg-primary text-primary-foreground text-xs">
                          {{ getUserInitials(row.original.reporter.email) }}
                        </AvatarFallback>
                      </Avatar>
                      <div class="flex flex-col gap-1 min-w-0">
                        <span
                          class="text-sm font-medium text-foreground truncate"
                          :title="row.original.reporter.email"
                        >
                          {{ row.original.reporter.email }}
                        </span>
                        <span
                          class="text-xs text-muted-foreground font-mono truncate"
                          :title="row.original.reporter.id"
                        >
                          {{ row.original.reporter.id }}
                        </span>
                      </div>
                    </div>
                    <div v-else class="flex flex-col gap-1">
                      <span class="text-sm text-muted-foreground"> Unknown </span>
                      <span
                        v-if="row.original.reportedBy"
                        class="text-xs text-muted-foreground font-mono truncate"
                      >
                        {{ row.original.reportedBy }}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span class="text-sm text-foreground">
                      {{ formatDate(row.original.createdAt) }}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Button variant="outline" size="sm" @click="viewComplaint(row.original)">
                        <Icon name="lucide:eye" class="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        v-if="row.original.status === 'pending'"
                        variant="default"
                        size="sm"
                        @click="reviewComplaint(row.original)"
                      >
                        <Icon name="lucide:check" class="h-4 w-4 mr-2" />
                        Review
                      </Button>
                      <Button
                        v-if="
                          row.original.status === 'pending' || row.original.status === 'reviewed'
                        "
                        variant="default"
                        size="sm"
                        @click="resolveComplaint(row.original)"
                      >
                        <Icon name="lucide:check-circle" class="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                      <Button
                        v-if="
                          row.original.status === 'pending' || row.original.status === 'reviewed'
                        "
                        variant="destructive"
                        size="sm"
                        @click="rejectComplaint(row.original)"
                      >
                        <Icon name="lucide:x" class="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Pagination -->
    <div v-if="!isLoading && !error && totalPages > 1" class="flex justify-center">
      <Pagination
        :total="total"
        :items-per-page="limit"
        :page="currentPage"
        @update:page="goToPage"
      >
        <PaginationContent>
          <PaginationPrevious />
          <template v-for="page in visiblePages" :key="page">
            <PaginationItem :value="page" :is-active="page === currentPage">
              {{ page }}
            </PaginationItem>
          </template>
          <PaginationNext />
        </PaginationContent>
      </Pagination>
    </div>

    <!-- Complaint Detail Dialog -->
    <Dialog v-model:open="isComplaintDialogOpen">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complaint Details</DialogTitle>
          <DialogDescription> Review and handle complaint </DialogDescription>
        </DialogHeader>
        <div v-if="selectedComplaint" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-sm font-medium">Reason</Label>
            <Badge :variant="getReasonVariant(selectedComplaint.reason)">
              {{ formatReason(selectedComplaint.reason) }}
            </Badge>
          </div>
          <div class="space-y-2">
            <Label class="text-sm font-medium">Target Type</Label>
            <Badge variant="outline">{{ selectedComplaint.targetType }}</Badge>
          </div>
          <div class="space-y-2">
            <Label class="text-sm font-medium">Target ID</Label>
            <p class="text-sm text-muted-foreground font-mono">{{ selectedComplaint.targetId }}</p>
          </div>
          <div class="space-y-2">
            <Label class="text-sm font-medium">Status</Label>
            <Badge :variant="getStatusVariant(selectedComplaint.status)">
              {{ formatStatus(selectedComplaint.status) }}
            </Badge>
          </div>
          <div class="space-y-2">
            <Label class="text-sm font-medium">Reporter</Label>
            <div v-if="selectedComplaint.reporter" class="space-y-3">
              <div class="flex items-center gap-3">
                <Avatar class="h-12 w-12">
                  <AvatarFallback class="bg-primary text-primary-foreground">
                    {{ getUserInitials(selectedComplaint.reporter.email) }}
                  </AvatarFallback>
                </Avatar>
                <div class="flex-1">
                  <p class="text-sm font-medium text-foreground">
                    {{ selectedComplaint.reporter.email }}
                  </p>
                  <p class="text-xs text-muted-foreground font-mono">
                    {{ selectedComplaint.reporter.id }}
                  </p>
                  <div
                    v-if="
                      selectedComplaint.reporter.roles &&
                      selectedComplaint.reporter.roles.length > 0
                    "
                    class="flex gap-1 mt-1"
                  >
                    <Badge
                      v-for="role in selectedComplaint.reporter.roles"
                      :key="role"
                      variant="secondary"
                      class="text-xs"
                    >
                      {{ role }}
                    </Badge>
                  </div>
                </div>
              </div>
              <div
                v-if="selectedComplaint.reporter?.createdAt"
                class="text-xs text-muted-foreground"
              >
                Account created:
                {{
                  formatDate(
                    selectedComplaint.reporter.createdAt instanceof Date
                      ? selectedComplaint.reporter.createdAt.toISOString()
                      : selectedComplaint.reporter.createdAt,
                  )
                }}
              </div>
              <Button
                variant="outline"
                size="sm"
                class="w-fit"
                @click="viewReporter(selectedComplaint.reporter.id)"
              >
                <Icon name="lucide:user" class="h-4 w-4 mr-2" />
                View Full Profile
              </Button>
            </div>
            <div v-else class="flex flex-col gap-1">
              <p class="text-sm text-muted-foreground">Unknown</p>
              <p
                v-if="selectedComplaint.reportedBy"
                class="text-xs text-muted-foreground font-mono"
              >
                ID: {{ selectedComplaint.reportedBy }}
              </p>
            </div>
          </div>
          <div v-if="selectedComplaint.description" class="space-y-2">
            <Label class="text-sm font-medium">Description</Label>
            <p class="text-sm text-muted-foreground">{{ selectedComplaint.description }}</p>
          </div>
          <div v-if="selectedComplaint.resolutionNote" class="space-y-2">
            <Label class="text-sm font-medium">Resolution Note</Label>
            <p class="text-sm text-muted-foreground">{{ selectedComplaint.resolutionNote }}</p>
          </div>
          <div class="space-y-2">
            <Label class="text-sm font-medium">Created At</Label>
            <p class="text-sm text-muted-foreground">
              {{ formatDate(selectedComplaint.createdAt) }}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isComplaintDialogOpen = false">Close</Button>
          <Button
            v-if="selectedComplaint?.status === 'pending'"
            @click="reviewComplaint(selectedComplaint)"
          >
            <Icon name="lucide:check" class="h-4 w-4 mr-2" />
            Review
          </Button>
          <Button
            v-if="
              selectedComplaint?.status === 'pending' || selectedComplaint?.status === 'reviewed'
            "
            @click="resolveComplaint(selectedComplaint)"
          >
            <Icon name="lucide:check-circle" class="h-4 w-4 mr-2" />
            Resolve
          </Button>
          <Button
            v-if="
              selectedComplaint?.status === 'pending' || selectedComplaint?.status === 'reviewed'
            "
            variant="destructive"
            @click="rejectComplaint(selectedComplaint)"
          >
            <Icon name="lucide:x" class="h-4 w-4 mr-2" />
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useVueTable,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
} from '@tanstack/vue-table'
import { valueUpdater } from '@/components/ui/table/utils'
import {
  AdminService,
  type Complaint,
  type ComplaintStatus,
  type ComplaintReason,
  type GetComplaintsParams,
} from '~/lib/api/admin.service'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const api = useApi()
const adminService = new AdminService(api)

// State
const complaints = ref<Complaint[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const statusFilter = ref<ComplaintStatus | 'all'>('all')
const targetTypeFilter = ref<'source' | 'post' | 'all'>('all')
const sortField = ref<'createdAt' | 'updatedAt' | 'status'>('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')
const offset = ref(0)
const limit = ref(20)
const total = ref(0)

// Dialog state
const isComplaintDialogOpen = ref(false)
const selectedComplaint = ref<Complaint | null>(null)

// Sorting state
const sorting = ref<SortingState>([])

// Computed
const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)
const totalPages = computed(() => Math.ceil(total.value / limit.value))

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value

  const start = Math.max(1, current - 2)
  const end = Math.min(total, start + 4)

  const adjustedStart = end - start < 4 ? Math.max(1, end - 4) : start

  for (let i = adjustedStart; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Table columns
const columns = computed<ColumnDef<Complaint>[]>(() => [
  {
    accessorKey: 'reason',
    header: 'Reason',
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: false,
  },
  {
    accessorKey: 'targetType',
    header: 'Target',
    enableSorting: false,
  },
  {
    accessorKey: 'reporter',
    header: 'Reporter',
    enableSorting: false,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Created At',
    enableSorting: true,
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
  },
])

// Debounce sorting changes to prevent lag
let sortingTimeout: ReturnType<typeof setTimeout> | null = null

// Watch sorting changes and sync with API
watch(
  sorting,
  (newSorting) => {
    if (sortingTimeout) {
      clearTimeout(sortingTimeout)
    }

    sortingTimeout = setTimeout(() => {
      if (newSorting.length > 0) {
        const sort = newSorting[0]
        if (sort) {
          const field = sort.id as 'createdAt' | 'updatedAt' | 'status'
          const order = sort.desc ? 'desc' : 'asc'

          if (sortField.value !== field || sortOrder.value !== order) {
            sortField.value = field
            sortOrder.value = order
            fetchComplaints(true)
          }
        }
      }
    }, 150)
  },
  { deep: true },
)

// Table instance
const table = useVueTable({
  get data() {
    return complaints.value
  },
  get columns() {
    return columns.value
  },
  getCoreRowModel: getCoreRowModel(),
  manualSorting: true,
  get state() {
    return {
      sorting: sorting.value,
    }
  },
  onSortingChange: (updater) => {
    valueUpdater(updater, sorting)
  },
})

// Methods
const fetchComplaints = async (resetPagination = false) => {
  if (resetPagination) {
    offset.value = 0
  }

  isLoading.value = true
  error.value = null

  try {
    const params: GetComplaintsParams = {
      offset: offset.value,
      limit: limit.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
    }

    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value
    }

    if (targetTypeFilter.value !== 'all') {
      params.targetType = targetTypeFilter.value
    }

    const response = await adminService.getComplaints(params)
    complaints.value = response.data as Complaint[]
    total.value = response.total
  } catch (err) {
    console.error('Failed to fetch complaints:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load complaints'
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  fetchComplaints(true)
}

const handleFilterChange = () => {
  fetchComplaints(true)
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
  targetTypeFilter.value = 'all'
  sortField.value = 'createdAt'
  sortOrder.value = 'desc'
  fetchComplaints(true)
}

const goToPage = (page: number) => {
  offset.value = (page - 1) * limit.value
  fetchComplaints()
}

const viewComplaint = (complaint: Complaint) => {
  selectedComplaint.value = complaint
  isComplaintDialogOpen.value = true
}

const reviewComplaint = async (complaint: Complaint) => {
  try {
    await adminService.reviewComplaint(complaint.id)
    await fetchComplaints()
    isComplaintDialogOpen.value = false
  } catch (err) {
    console.error('Failed to review complaint:', err)
    error.value = err instanceof Error ? err.message : 'Failed to review complaint'
  }
}

const resolveComplaint = async (complaint: Complaint) => {
  try {
    await adminService.resolveComplaint(complaint.id, {})
    await fetchComplaints()
    isComplaintDialogOpen.value = false
  } catch (err) {
    console.error('Failed to resolve complaint:', err)
    error.value = err instanceof Error ? err.message : 'Failed to resolve complaint'
  }
}

const rejectComplaint = async (complaint: Complaint) => {
  try {
    await adminService.rejectComplaint(complaint.id, {})
    await fetchComplaints()
    isComplaintDialogOpen.value = false
  } catch (err) {
    console.error('Failed to reject complaint:', err)
    error.value = err instanceof Error ? err.message : 'Failed to reject complaint'
  }
}

const formatReason = (reason: ComplaintReason) => {
  return reason
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatStatus = (status: ComplaintStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getReasonVariant = (
  reason: ComplaintReason,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (reason) {
    case 'spam':
    case 'inappropriate_content':
      return 'destructive'
    case 'misinformation':
      return 'default'
    case 'copyright_violation':
      return 'secondary'
    default:
      return 'outline'
  }
}

const getStatusVariant = (
  status: ComplaintStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'pending':
      return 'destructive'
    case 'reviewed':
      return 'default'
    case 'resolved':
      return 'secondary'
    case 'rejected':
      return 'outline'
    default:
      return 'outline'
  }
}

const viewReporter = (userId?: string) => {
  if (userId) {
    // Navigate to user details or open user info dialog
    navigateTo(`/admin/users?userId=${userId}`)
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown date'
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

const getUserInitials = (email?: string) => {
  if (!email) return 'U'
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
}

// Initialize
onMounted(() => {
  // Initialize sorting state from current filters
  if (sortField.value) {
    sorting.value = [
      {
        id: sortField.value,
        desc: sortOrder.value === 'desc',
      },
    ]
  }
  fetchComplaints()
})
</script>

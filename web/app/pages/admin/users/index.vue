<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Users</h1>
        <p class="text-muted-foreground mt-1">Manage user accounts</p>
      </div>
      <Button v-if="!needsAdminEndpoint" variant="outline" @click="fetchUsers(true)">
        <Icon name="lucide:refresh-cw" class="mr-2 h-4 w-4" />
        Refresh
      </Button>
    </div>

    <!-- Admin Endpoint Notice -->
    <Alert v-if="needsAdminEndpoint" variant="default">
      <Icon name="lucide:info" class="h-4 w-4" />
      <AlertTitle>Admin Endpoint Required</AlertTitle>
      <AlertDescription>
        User management requires admin API endpoints. Please implement admin endpoints for listing
        and managing users on the backend.
      </AlertDescription>
    </Alert>

    <!-- Filters (hidden when endpoint not available) -->
    <Card v-if="!needsAdminEndpoint">
      <CardContent class="pt-6">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[200px] relative">
            <Icon
              name="lucide:search"
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            />
            <Input
              v-model="searchQuery"
              placeholder="Search users..."
              class="pl-9"
              @keyup.enter="handleSearch"
            />
          </div>

          <Select v-model="sortField" @update:model-value="handleFilterChange">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="lastLogin">Last Login</SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="sortOrder" @update:model-value="handleFilterChange">
            <SelectTrigger class="w-[130px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
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
    <div v-if="!needsAdminEndpoint && isLoading" class="space-y-4">
      <Skeleton v-for="i in 5" :key="i" class="h-32 w-full" />
    </div>

    <!-- Error State -->
    <Alert v-else-if="!needsAdminEndpoint && error" variant="destructive">
      <Icon name="lucide:alert-circle" class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Data Table -->
    <Card v-else-if="!needsAdminEndpoint" class="overflow-hidden">
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
                <TableRow v-if="users.length === 0" class="hover:bg-transparent">
                  <TableCell :colspan="5" class="h-32 text-center">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <Icon name="lucide:users" class="h-12 w-12 text-muted-foreground" />
                      <p class="text-sm text-muted-foreground">
                        {{
                          searchQuery ? 'No users found matching your search.' : 'No users found.'
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
                    <div class="flex flex-col gap-1">
                      <span class="font-medium text-foreground">{{ row.original.email }}</span>
                      <span class="text-xs text-muted-foreground font-mono">
                        {{ row.original.id }}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" class="font-normal">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <div class="flex flex-col gap-1">
                      <span class="text-sm text-foreground">
                        {{ formatDate(row.original.createdAt) }}
                      </span>
                      <span v-if="row.original.updatedAt" class="text-xs text-muted-foreground">
                        Updated: {{ formatDate(row.original.updatedAt) }}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Button variant="outline" size="sm" @click="viewUser(row.original)">
                        <Icon name="lucide:eye" class="h-4 w-4 mr-2" />
                        View
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
    <div
      v-if="!needsAdminEndpoint && !isLoading && !error && totalPages > 1"
      class="flex justify-center"
    >
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

    <!-- User Detail Dialog -->
    <Dialog v-model:open="isUserDialogOpen">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription> User account information </DialogDescription>
        </DialogHeader>
        <div v-if="selectedUser" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-sm font-medium">Email</Label>
            <p class="text-sm text-muted-foreground">{{ selectedUser.email }}</p>
          </div>
          <div class="space-y-2">
            <Label class="text-sm font-medium">User ID</Label>
            <p class="text-sm text-muted-foreground font-mono">{{ selectedUser.id }}</p>
          </div>
          <div v-if="selectedUser.createdAt" class="space-y-2">
            <Label class="text-sm font-medium">Created At</Label>
            <p class="text-sm text-muted-foreground">
              {{ formatDate(selectedUser.createdAt) }}
            </p>
          </div>
          <div v-if="selectedUser.updatedAt" class="space-y-2">
            <Label class="text-sm font-medium">Updated At</Label>
            <p class="text-sm text-muted-foreground">
              {{ formatDate(selectedUser.updatedAt) }}
            </p>
          </div>
          <div v-if="selectedUser.lastLogin" class="space-y-2">
            <Label class="text-sm font-medium">Last Login</Label>
            <p class="text-sm text-muted-foreground">
              {{ formatDate(selectedUser.lastLogin) }}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isUserDialogOpen = false">Close</Button>
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
import { AdminService } from '~/lib/api/admin.service'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const api = useApi()
const adminService = new AdminService(api)

interface User {
  id: string
  email: string
  createdAt?: string | Date
  updatedAt?: string | Date
  lastLogin?: string
}

// State
const needsAdminEndpoint = ref(false) // Admin endpoints are now available
const users = ref<User[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const sortField = ref<'createdAt' | 'email'>('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')
const offset = ref(0)
const limit = ref(20)
const total = ref(0)

// Dialog state
const isUserDialogOpen = ref(false)
const selectedUser = ref<User | null>(null)

// Sorting state
const sorting = ref<SortingState>([])

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
          const field = sort.id as 'createdAt' | 'email'
          const order = sort.desc ? 'desc' : 'asc'

          if (sortField.value !== field || sortOrder.value !== order) {
            sortField.value = field
            sortOrder.value = order
            fetchUsers(true)
          }
        }
      }
    }, 150)
  },
  { deep: true },
)

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
const columns = computed<ColumnDef<User>[]>(() => [
  {
    accessorKey: 'email',
    header: 'Email',
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: false,
  },
  {
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

// Table instance
const table = useVueTable({
  get data() {
    return users.value
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
const fetchUsers = async (resetPagination = false) => {
  if (needsAdminEndpoint.value) {
    return
  }

  if (resetPagination) {
    offset.value = 0
  }

  isLoading.value = true
  error.value = null

  try {
    const response = await adminService.getAllUsers({
      offset: offset.value,
      limit: limit.value,
      search: searchQuery.value || undefined,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
    })
    users.value = (
      response.data as unknown as {
        id: string
        email: string
        createdAt?: string | Date
        updatedAt?: string | Date
      }[]
    ).map((user) => ({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: undefined, // Not available in current response
    }))
    total.value = response.total
  } catch (err) {
    console.error('Failed to fetch users:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load users'
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  fetchUsers(true)
}

const handleFilterChange = () => {
  fetchUsers(true)
}

const resetFilters = () => {
  searchQuery.value = ''
  sortField.value = 'createdAt'
  sortOrder.value = 'desc'
  fetchUsers(true)
}

const goToPage = (page: number) => {
  offset.value = (page - 1) * limit.value
  fetchUsers()
}

const viewUser = (user: User) => {
  selectedUser.value = user
  isUserDialogOpen.value = true
}

const formatDate = (dateString?: string | Date) => {
  if (!dateString) return 'Unknown date'
  const date = dateString instanceof Date ? dateString : new Date(dateString)
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

// Initialize
onMounted(() => {
  if (!needsAdminEndpoint.value) {
    // Initialize sorting state from current filters
    if (sortField.value) {
      sorting.value = [
        {
          id: sortField.value,
          desc: sortOrder.value === 'desc',
        },
      ]
    }
    fetchUsers()
  }
})
</script>

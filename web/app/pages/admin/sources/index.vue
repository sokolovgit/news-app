<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Sources</h1>
        <p class="text-muted-foreground mt-1">Manage news sources</p>
      </div>
      <Button variant="outline" @click="fetchSources(true)">
        <Icon name="lucide:refresh-cw" class="mr-2 h-4 w-4" />
        Refresh
      </Button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="text-2xl font-bold">{{ total }}</div>
          <p class="text-xs text-muted-foreground">Total Sources</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="text-2xl font-bold">{{ sourceTypeCounts.telegram }}</div>
          <p class="text-xs text-muted-foreground">Telegram</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="text-2xl font-bold">{{ sourceTypeCounts.instagram }}</div>
          <p class="text-xs text-muted-foreground">Instagram</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="text-2xl font-bold">{{ sourceTypeCounts.rss }}</div>
          <p class="text-xs text-muted-foreground">RSS</p>
        </CardContent>
      </Card>
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
              placeholder="Search sources..."
              class="pl-9"
              @keyup.enter="handleSearch"
            />
          </div>

          <Select v-model="sourceTypeFilter" @update:model-value="handleFilterChange">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Source Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="rss">RSS</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
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
                <TableRow v-if="sources.length === 0" class="hover:bg-transparent">
                  <TableCell :colspan="6" class="h-32 text-center">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <Icon name="lucide:book-open" class="h-12 w-12 text-muted-foreground" />
                      <p class="text-sm text-muted-foreground">
                        {{
                          searchQuery || sourceTypeFilter !== 'all'
                            ? 'No sources found matching your filters.'
                            : 'No sources found.'
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
                      <span class="font-medium">{{ row.original.source.name }}</span>
                      <span class="text-xs text-muted-foreground break-all">
                        {{ row.original.source.url }}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="getSourceTypeVariant(row.original.source.source)">
                      {{ formatSourceType(row.original.source.source) }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span class="text-sm text-muted-foreground font-mono">
                      {{ row.original.source.id }}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span class="text-sm text-muted-foreground">
                      {{ formatDate(row.original.source.createdAt) }}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Button variant="outline" size="sm" @click="viewSource(row.original)">
                        <Icon name="lucide:eye" class="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" as-child>
                        <a
                          :href="row.original.source.url"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Icon name="lucide:external-link" class="h-4 w-4 mr-2" />
                          Open
                        </a>
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

    <!-- Source Detail Dialog -->
    <Dialog v-model:open="isSourceDialogOpen">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ selectedSource?.source.name }}</DialogTitle>
          <DialogDescription> Source details and information </DialogDescription>
        </DialogHeader>
        <div v-if="selectedSource" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-sm font-medium">Type</Label>
            <Badge :variant="getSourceTypeVariant(selectedSource.source.source)">
              {{ formatSourceType(selectedSource.source.source) }}
            </Badge>
          </div>
          <div class="space-y-2">
            <Label class="text-sm font-medium">URL</Label>
            <p class="text-sm text-muted-foreground break-all">{{ selectedSource.source.url }}</p>
          </div>
          <div class="space-y-2">
            <Label class="text-sm font-medium">ID</Label>
            <p class="text-sm text-muted-foreground font-mono">{{ selectedSource.source.id }}</p>
          </div>
          <div v-if="selectedSource.source.addedBy" class="space-y-2">
            <Label class="text-sm font-medium">Added By</Label>
            <p class="text-sm text-muted-foreground font-mono">
              {{ selectedSource.source.addedBy }}
            </p>
          </div>
          <div v-if="selectedSource.source.createdAt" class="space-y-2">
            <Label class="text-sm font-medium">Created At</Label>
            <p class="text-sm text-muted-foreground">
              {{ formatDate(selectedSource.source.createdAt) }}
            </p>
          </div>
          <div v-if="selectedSource.source.updatedAt" class="space-y-2">
            <Label class="text-sm font-medium">Updated At</Label>
            <p class="text-sm text-muted-foreground">
              {{ formatDate(selectedSource.source.updatedAt) }}
            </p>
          </div>
          <div class="space-y-2">
            <Label class="text-sm font-medium">Subscription Status</Label>
            <Badge :variant="selectedSource.isSubscribed ? 'default' : 'outline'">
              {{ selectedSource.isSubscribed ? 'Subscribed' : 'Not Subscribed' }}
            </Badge>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isSourceDialogOpen = false">Close</Button>
          <Button v-if="selectedSource" @click="window.open(selectedSource.source.url, '_blank')">
            <Icon name="lucide:external-link" class="h-4 w-4 mr-2" />
            Open Source
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
  SourcesService,
  type SourceWithSubscriptionStatusResponse,
  type SourceType,
} from '~/lib/api/sources.service'
import { AdminService } from '~/lib/api/admin.service'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const api = useApi()
const sourcesService = new SourcesService(api)
const adminService = new AdminService(api)

// State
const sources = ref<SourceWithSubscriptionStatusResponse[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const sourceTypeFilter = ref<SourceType | 'all'>('all')
const sortField = ref<'createdAt' | 'updatedAt' | 'name'>('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')
const offset = ref(0)
const limit = ref(20)
const total = ref(0)

// Dialog state
const isSourceDialogOpen = ref(false)
const selectedSource = ref<SourceWithSubscriptionStatusResponse | null>(null)

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
          const field = sort.id as 'createdAt' | 'updatedAt' | 'name'
          const order = sort.desc ? 'desc' : 'asc'

          if (sortField.value !== field || sortOrder.value !== order) {
            sortField.value = field
            sortOrder.value = order
            fetchSources(true)
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
const columns = computed<ColumnDef<SourceWithSubscriptionStatusResponse>[]>(() => [
  {
    accessorKey: 'source.name',
    header: 'Name',
    enableSorting: false,
  },
  {
    accessorKey: 'source.source',
    header: 'Type',
    enableSorting: false,
  },
  {
    accessorKey: 'source.id',
    header: 'ID',
    enableSorting: false,
  },
  {
    id: 'source.createdAt',
    accessorKey: 'source.createdAt',
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
    return sources.value
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
  onSortingChange: (updater) => valueUpdater(updater, sorting),
})

const sourceTypeCounts = ref<Record<string, number>>({
  telegram: 0,
  instagram: 0,
  rss: 0,
  twitter: 0,
})

// Methods
const fetchSources = async (resetPagination = false) => {
  if (resetPagination) {
    offset.value = 0
  }

  isLoading.value = true
  error.value = null

  try {
    const params: any = {
      offset: offset.value,
      limit: limit.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    if (sourceTypeFilter.value !== 'all') {
      params.sourceType = sourceTypeFilter.value
    }

    // Fetch sources and stats in parallel
    const [sourcesResponse, statsResponse] = await Promise.all([
      adminService.getAllSources(params),
      adminService.getSourceStats(),
    ])

    sources.value = sourcesResponse.data.map((item: any) => ({
      source: item,
      isSubscribed: false, // Admin view doesn't need subscription status
    })) as SourceWithSubscriptionStatusResponse[]
    total.value = sourcesResponse.total

    // Update stats from backend
    sourceTypeCounts.value = {
      telegram: statsResponse.byType.telegram || 0,
      instagram: statsResponse.byType.instagram || 0,
      rss: statsResponse.byType.rss || 0,
      twitter: statsResponse.byType.twitter || 0,
    }
  } catch (err) {
    console.error('Failed to fetch sources:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load sources'
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  fetchSources(true)
}

const handleFilterChange = () => {
  fetchSources(true)
}

const resetFilters = () => {
  searchQuery.value = ''
  sourceTypeFilter.value = 'all'
  fetchSources(true)
}

const goToPage = (page: number) => {
  offset.value = (page - 1) * limit.value
  fetchSources()
}

const viewSource = (source: SourceWithSubscriptionStatusResponse) => {
  selectedSource.value = source
  isSourceDialogOpen.value = true
}

const formatSourceType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const getSourceTypeVariant = (
  type: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (type) {
    case 'telegram':
      return 'default'
    case 'instagram':
      return 'secondary'
    case 'rss':
      return 'outline'
    case 'twitter':
      return 'destructive'
    default:
      return 'outline'
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

// Initialize
onMounted(() => {
  // Initialize sorting state from current filters
  if (sortField.value) {
    sorting.value = [
      {
        id: 'source.createdAt',
        desc: sortOrder.value === 'desc',
      },
    ]
  }
  fetchSources()
})
</script>

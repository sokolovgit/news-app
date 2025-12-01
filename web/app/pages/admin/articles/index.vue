<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Articles</h1>
        <p class="text-muted-foreground mt-1">Manage published articles</p>
      </div>
      <Button variant="outline" @click="fetchArticles(true)">
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
              placeholder="Search articles..."
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
              <SelectItem value="updatedAt">Updated Date</SelectItem>
              <SelectItem value="publishedAt">Published Date</SelectItem>
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
                <TableRow v-if="articles.length === 0" class="hover:bg-transparent">
                  <TableCell :colspan="7" class="h-32 text-center">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <Icon name="lucide:file-text" class="h-12 w-12 text-muted-foreground" />
                      <p class="text-sm text-muted-foreground">
                        {{
                          searchQuery
                            ? 'No articles found matching your search.'
                            : 'No articles found.'
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
                      <span class="font-medium text-foreground">{{ row.original.title }}</span>
                      <span
                        v-if="row.original.description"
                        class="text-xs text-muted-foreground line-clamp-1"
                      >
                        {{ row.original.description }}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex flex-col gap-1">
                      <span class="text-sm text-foreground">
                        {{ row.original.author?.email || 'Unknown' }}
                      </span>
                      <span class="text-xs text-muted-foreground font-mono">
                        {{ row.original.id }}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex flex-col gap-1">
                      <span class="text-sm text-foreground">
                        {{ formatDate(row.original.publishedAt || row.original.createdAt) }}
                      </span>
                      <span
                        v-if="row.original.createdAt && row.original.publishedAt"
                        class="text-xs text-muted-foreground"
                      >
                        Created: {{ formatDate(row.original.createdAt) }}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:eye" class="h-4 w-4 text-muted-foreground" />
                      <span class="text-sm font-medium">{{ row.original.viewCount }}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" class="font-normal">Published</Badge>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Button variant="outline" size="sm" @click="viewArticle(row.original)">
                        <Icon name="lucide:eye" class="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button v-if="row.original.slug" variant="outline" size="sm" as-child>
                        <a :href="`/articles/read/${row.original.slug}`" target="_blank">
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

    <!-- Article Detail Dialog -->
    <Dialog v-model:open="isArticleDialogOpen">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ selectedArticle?.title }}</DialogTitle>
          <DialogDescription> Article details and content </DialogDescription>
        </DialogHeader>
        <div v-if="selectedArticle" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-sm font-medium">Author</Label>
            <p class="text-sm text-muted-foreground">
              {{ selectedArticle.author?.email || 'Unknown' }}
            </p>
          </div>
          <div class="space-y-2">
            <Label class="text-sm font-medium">Status</Label>
            <Badge variant="secondary">Published</Badge>
          </div>
          <div class="space-y-2">
            <Label class="text-sm font-medium">Views</Label>
            <p class="text-sm text-muted-foreground">{{ selectedArticle.viewCount }}</p>
          </div>
          <div class="space-y-2">
            <Label class="text-sm font-medium">Published At</Label>
            <p class="text-sm text-muted-foreground">
              {{ formatDate(selectedArticle.publishedAt || selectedArticle.createdAt) }}
            </p>
          </div>
          <div v-if="selectedArticle.slug" class="space-y-2">
            <Label class="text-sm font-medium">Slug</Label>
            <p class="text-sm text-muted-foreground font-mono">{{ selectedArticle.slug }}</p>
          </div>
          <div v-if="selectedArticle.description" class="space-y-2">
            <Label class="text-sm font-medium">Description</Label>
            <p class="text-sm text-muted-foreground">{{ selectedArticle.description }}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isArticleDialogOpen = false">Close</Button>
          <Button
            v-if="selectedArticle?.slug"
            @click="navigateTo(`/articles/read/${selectedArticle.slug}`, { external: true })"
          >
            <Icon name="lucide:external-link" class="h-4 w-4 mr-2" />
            View Article
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
import { AdminService } from '~/lib/api/admin.service'
import { useApi } from '~/composables/useApi'
import type { Article, GetPublicArticlesQuery } from '~/types/articles.types'
import { valueUpdater } from '@/components/ui/table/utils'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const api = useApi()
const adminService = new AdminService(api)

// State
const articles = ref<Article[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const sortField = ref<'createdAt' | 'updatedAt' | 'publishedAt'>('publishedAt')
const sortOrder = ref<'asc' | 'desc'>('desc')
const offset = ref(0)
const limit = ref(20)
const total = ref(0)

// Dialog state
const isArticleDialogOpen = ref(false)
const selectedArticle = ref<Article | null>(null)

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
          const field = sort.id as 'createdAt' | 'updatedAt' | 'publishedAt'
          const order = sort.desc ? 'desc' : 'asc'

          if (sortField.value !== field || sortOrder.value !== order) {
            sortField.value = field
            sortOrder.value = order
            fetchArticles(true)
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
const columns = computed<ColumnDef<Article>[]>(() => [
  {
    accessorKey: 'title',
    header: 'Title',
    enableSorting: false, // Not supported by backend
  },
  {
    accessorKey: 'author',
    header: 'Author',
    enableSorting: false,
  },
  {
    accessorKey: 'publishedAt',
    header: 'Published',
    enableSorting: true,
  },
  {
    accessorKey: 'viewCount',
    header: 'Views',
    enableSorting: false, // Not supported by backend
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: false,
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
    return articles.value
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
const fetchArticles = async (resetPagination = false) => {
  if (resetPagination) {
    offset.value = 0
  }

  isLoading.value = true
  error.value = null

  try {
    const query: GetPublicArticlesQuery = {
      offset: offset.value,
      limit: limit.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
    }

    if (searchQuery.value) {
      query.search = searchQuery.value
    }

    const response = await adminService.getAllArticles({
      offset: query.offset,
      limit: query.limit,
      search: query.search,
      sortField: query.sortField,
      sortOrder: query.sortOrder,
    })
    articles.value = response.data as unknown as Article[]
    total.value = response.total
  } catch (err) {
    console.error('Failed to fetch articles:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load articles'
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  fetchArticles(true)
}

const handleFilterChange = () => {
  fetchArticles(true)
}

const resetFilters = () => {
  searchQuery.value = ''
  sortField.value = 'publishedAt'
  sortOrder.value = 'desc'
  fetchArticles(true)
}

const goToPage = (page: number) => {
  offset.value = (page - 1) * limit.value
  fetchArticles()
}

const viewArticle = (article: Article) => {
  selectedArticle.value = article
  isArticleDialogOpen.value = true
}

const formatDate = (dateString?: Date | string) => {
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
        id: sortField.value,
        desc: sortOrder.value === 'desc',
      },
    ]
  }
  fetchArticles()
})
</script>

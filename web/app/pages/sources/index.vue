<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-foreground">My Sources</h1>
        <p class="text-muted-foreground mt-1">Manage your news sources</p>
      </div>
      <Button @click="navigateTo('/sources/add')">
        <Icon name="lucide:plus-circle" class="mr-2 h-4 w-4" />
        Add Source
      </Button>
    </div>

    <!-- Search and Filters -->
    <div class="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
      <div class="relative flex-1 min-w-[200px]">
        <Icon
          name="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          v-model="searchQuery"
          placeholder="Search sources..."
          class="pl-9"
          @input="handleSearch"
        />
      </div>
      <Select v-model="filterType" @update:model-value="handleTypeFilter">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="rss">RSS</SelectItem>
          <SelectItem value="instagram">Instagram</SelectItem>
        </SelectContent>
      </Select>
      <div class="h-6 w-px bg-border shrink-0" />
      <Button variant="outline" size="sm" @click="toggleView">
        <Icon :name="viewIcon" class="h-4 w-4 mr-2" />
        {{ viewMode === 'grid' ? 'List' : 'Grid' }}
      </Button>
      <!-- Pagination in Filters Block -->
      <div
        v-if="totalPages > 1 && !isLoading && sources.length > 0"
        class="flex items-center ml-auto gap-4"
      >
        <div class="h-6 w-px bg-border shrink-0" />
        <Pagination
          :total="pagination.total"
          :items-per-page="pagination.limit"
          :page="currentPage"
          @update:page="handlePageChange"
        >
          <PaginationContent>
            <PaginationPrevious />
            <PaginationItem
              v-for="page in visiblePages"
              :key="page"
              :value="page"
              :is-active="page === currentPage"
            >
              {{ page }}
            </PaginationItem>
            <PaginationNext />
          </PaginationContent>
        </Pagination>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SourceCardSkeleton v-for="i in 6" :key="i" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading && filteredSources.length === 0" class="text-center py-12">
      <Icon name="lucide:book-open" class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-foreground mb-2">
        {{ searchQuery || filterType !== 'all' ? 'No sources found' : 'No sources yet' }}
      </h3>
      <p class="text-muted-foreground mb-6">
        {{
          searchQuery || filterType !== 'all'
            ? 'Try adjusting your filters.'
            : 'Add your first source to get started.'
        }}
      </p>
      <Button v-if="!searchQuery && filterType === 'all'" @click="navigateTo('/sources/add')">
        <Icon name="lucide:plus-circle" class="mr-2 h-4 w-4" />
        Add Your First Source
      </Button>
    </div>

    <!-- Sources Grid/List -->
    <div
      v-else
      :class="viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'"
    >
      <SourceCard
        v-for="source in filteredSources"
        :key="source.id"
        :source="source"
        @refresh="handleRefresh(source)"
        @view="handleView(source)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1 && !isLoading" class="flex justify-center">
      <Pagination
        :total="pagination.total"
        :items-per-page="pagination.limit"
        :page="currentPage"
        @update:page="handlePageChange"
      >
        <PaginationContent>
          <PaginationPrevious />
          <PaginationItem
            v-for="page in visiblePages"
            :key="page"
            :value="page"
            :is-active="page === currentPage"
          >
            {{ page }}
          </PaginationItem>
          <PaginationNext />
        </PaginationContent>
      </Pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import SourceCard from '~/components/sources/SourceCard.vue'
import SourceCardSkeleton from '~/components/sources/SourceCardSkeleton.vue'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useApi } from '~/composables/useApi'
import { SourcesService } from '~/lib/api'

definePageMeta({
  layout: 'default',
})

const api = useApi()
const sourcesService = new SourcesService(api)

interface Source {
  id: string
  name: string
  url: string
  source: string
  lastFetchedAt?: string | Date
}

const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')
const filterType = ref('all')
const isLoading = ref(false)
const sources = ref<Source[]>([])
const pagination = ref({
  offset: 0,
  limit: 20,
  total: 0,
  hasMore: false,
})
const currentPage = ref(1)

const viewIcon = computed(() => {
  return viewMode.value === 'grid' ? 'lucide:list' : 'lucide:grid'
})

// Calculate total pages
const totalPages = computed(() => {
  if (pagination.value.total === 0) return 0
  return Math.ceil(pagination.value.total / pagination.value.limit)
})

// Calculate visible pages for pagination
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    if (current > 3) {
      pages.push('ellipsis-start')
    }

    // Show pages around current
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < total - 2) {
      pages.push('ellipsis-end')
    }

    // Always show last page
    pages.push(total)
  }

  return pages.filter((p) => typeof p === 'number') as number[]
})

const filteredSources = computed(() => {
  let filtered = sources.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (source) =>
        source.name.toLowerCase().includes(query) || source.url.toLowerCase().includes(query),
    )
  }

  // Filter by type
  if (filterType.value !== 'all') {
    filtered = filtered.filter(
      (source) => source.source.toLowerCase() === filterType.value.toLowerCase(),
    )
  }

  return filtered
})

const toggleView = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const handleSearch = () => {
  // Search is handled by computed property
}

const handleTypeFilter = () => {
  // Filter is handled by computed property
}

const handleRefresh = async (source: Source) => {
  // TODO: Implement refresh source
  console.log('Refresh source:', source.id)
}

const handleView = (source: Source) => {
  // TODO: Navigate to source details or filter feed by source
  console.log('View source:', source.id)
}

const loadUserSources = async (page: number) => {
  isLoading.value = true
  try {
    // Convert page number to offset
    const offset = (page - 1) * pagination.value.limit

    const response = await sourcesService.getUserSources({
      offset,
      limit: pagination.value.limit,
    })

    // Map user sources to the format expected by SourceCard
    sources.value = response.data.map((userSource) => ({
      id: userSource.source.id,
      name: userSource.source.name,
      url: userSource.source.url,
      source: userSource.source.source,
      lastFetchedAt: userSource.source.updatedAt,
    }))

    // Update pagination state
    pagination.value = {
      offset: response.offset,
      limit: response.limit,
      total: response.total,
      hasMore: response.hasMore,
    }

    // Update current page
    currentPage.value = page
  } catch (error) {
    console.error('Failed to fetch user sources:', error)
  } finally {
    isLoading.value = false
  }
}

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    loadUserSources(page)
  }
}

onMounted(async () => {
  await loadUserSources(1)
})
</script>

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
      <Button variant="outline" size="sm" @click="toggleView">
        <Icon :name="viewIcon" class="h-4 w-4 mr-2" />
        {{ viewMode === 'grid' ? 'List' : 'Grid' }}
      </Button>
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
    <div v-if="!isLoading && sources.length > 0" class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Showing {{ pagination.offset + 1 }}-{{
          Math.min(pagination.offset + pagination.limit, pagination.total)
        }}
        of {{ pagination.total }}
      </div>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.offset === 0"
          @click="loadPreviousPage"
        >
          <Icon name="lucide:chevron-left" class="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button variant="outline" size="sm" :disabled="!pagination.hasMore" @click="loadNextPage">
          Next
          <Icon name="lucide:chevron-right" class="h-4 w-4 ml-1" />
        </Button>
      </div>
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

const viewIcon = computed(() => {
  return viewMode.value === 'grid' ? 'lucide:list' : 'lucide:grid'
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

const loadUserSources = async (offset: number = 0) => {
  isLoading.value = true
  try {
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
  } catch (error) {
    console.error('Failed to fetch user sources:', error)
  } finally {
    isLoading.value = false
  }
}

const loadNextPage = () => {
  if (pagination.value.hasMore) {
    loadUserSources(pagination.value.offset + pagination.value.limit)
  }
}

const loadPreviousPage = () => {
  const newOffset = Math.max(0, pagination.value.offset - pagination.value.limit)
  loadUserSources(newOffset)
}

onMounted(async () => {
  await loadUserSources(0)
})
</script>

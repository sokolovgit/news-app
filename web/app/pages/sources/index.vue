<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Sources</h1>
        <p class="text-muted-foreground mt-1">Manage your news sources</p>
      </div>
      <Button @click="navigateTo('/sources/add')">
        <Icon name="lucide:plus-circle" class="mr-2 h-4 w-4" />
        Add Source
      </Button>
    </div>

    <!-- Tabs -->
    <Tabs v-model="activeTab" class="w-full">
      <TabsList>
        <TabsTrigger value="my-sources">My Sources</TabsTrigger>
        <TabsTrigger value="all-sources">All Sources</TabsTrigger>
      </TabsList>

      <!-- My Sources Tab -->
      <TabsContent value="my-sources" class="space-y-6 mt-6">
        <!-- Search and Filters -->
        <div class="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
          <div class="relative flex-1 min-w-[200px]">
            <Icon
              name="lucide:search"
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              v-model="mySourcesSearchQuery"
              placeholder="Search sources..."
              class="pl-9"
              @input="handleSearch"
            />
          </div>
          <Select v-model="mySourcesFilterType" @update:model-value="handleTypeFilter">
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
            v-if="mySourcesTotalPages > 1 && !mySourcesLoading && mySources.length > 0"
            class="flex items-center ml-auto gap-4"
          >
            <div class="h-6 w-px bg-border shrink-0" />
            <Pagination
              :total="mySourcesPagination.total"
              :items-per-page="mySourcesPagination.limit"
              :page="mySourcesCurrentPage"
              @update:page="handleMySourcesPageChange"
            >
              <PaginationContent>
                <PaginationPrevious />
                <PaginationItem
                  v-for="page in mySourcesVisiblePages"
                  :key="page"
                  :value="page"
                  :is-active="page === mySourcesCurrentPage"
                >
                  {{ page }}
                </PaginationItem>
                <PaginationNext />
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="mySourcesLoading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SourceCardSkeleton v-for="i in 6" :key="i" />
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!mySourcesLoading && filteredMySources.length === 0"
          class="text-center py-12"
        >
          <Icon name="lucide:book-open" class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-foreground mb-2">
            {{ mySourcesSearchQuery || mySourcesFilterType !== 'all' ? 'No sources found' : 'No sources yet' }}
          </h3>
          <p class="text-muted-foreground mb-6">
            {{
              mySourcesSearchQuery || mySourcesFilterType !== 'all'
                ? 'Try adjusting your filters.'
                : 'Add your first source to get started.'
            }}
          </p>
          <Button
            v-if="!mySourcesSearchQuery && mySourcesFilterType === 'all'"
            @click="navigateTo('/sources/add')"
          >
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
            v-for="source in filteredMySources"
            :key="source.id"
            :source="source"
            :is-subscribed="true"
            :show-follow-button="false"
            :show-actions="true"
            :show-report-button="true"
            @refresh="handleRefresh(source)"
            @view="handleView(source)"
          />
        </div>

        <!-- Pagination -->
        <div v-if="mySourcesTotalPages > 1 && !mySourcesLoading" class="flex justify-center">
          <Pagination
            :total="mySourcesPagination.total"
            :items-per-page="mySourcesPagination.limit"
            :page="mySourcesCurrentPage"
            @update:page="handleMySourcesPageChange"
          >
            <PaginationContent>
              <PaginationPrevious />
              <PaginationItem
                v-for="page in mySourcesVisiblePages"
                :key="page"
                :value="page"
                :is-active="page === mySourcesCurrentPage"
              >
                {{ page }}
              </PaginationItem>
              <PaginationNext />
            </PaginationContent>
          </Pagination>
        </div>
      </TabsContent>

      <!-- All Sources Tab -->
      <TabsContent value="all-sources" class="space-y-6 mt-6">
        <!-- Search and Filters -->
        <div class="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
          <div class="relative flex-1 min-w-[200px]">
            <Icon
              name="lucide:search"
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              v-model="allSourcesSearchQuery"
              placeholder="Search sources..."
              class="pl-9"
              @input="handleSearch"
            />
          </div>
          <Select v-model="allSourcesFilterType" @update:model-value="handleTypeFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="rss">RSS</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
          <Select
            v-model="allSourcesFilterSubscription"
            @update:model-value="handleSubscriptionFilter"
          >
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="subscribed">Subscribed</SelectItem>
              <SelectItem value="not-subscribed">Not Subscribed</SelectItem>
            </SelectContent>
          </Select>
          <div class="h-6 w-px bg-border shrink-0" />
          <Button variant="outline" size="sm" @click="toggleView">
            <Icon :name="viewIcon" class="h-4 w-4 mr-2" />
            {{ viewMode === 'grid' ? 'List' : 'Grid' }}
          </Button>
          <!-- Pagination in Filters Block -->
          <div
            v-if="allSourcesTotalPages > 1 && !allSourcesLoading && allSources.length > 0"
            class="flex items-center ml-auto gap-4"
          >
            <div class="h-6 w-px bg-border shrink-0" />
            <Pagination
              :total="allSourcesPagination.total"
              :items-per-page="allSourcesPagination.limit"
              :page="allSourcesCurrentPage"
              @update:page="handleAllSourcesPageChange"
            >
              <PaginationContent>
                <PaginationPrevious />
                <PaginationItem
                  v-for="page in allSourcesVisiblePages"
                  :key="page"
                  :value="page"
                  :is-active="page === allSourcesCurrentPage"
                >
                  {{ page }}
                </PaginationItem>
                <PaginationNext />
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="allSourcesLoading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SourceCardSkeleton v-for="i in 6" :key="i" />
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!allSourcesLoading && filteredAllSources.length === 0"
          class="text-center py-12"
        >
          <Icon name="lucide:book-open" class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-foreground mb-2">
            {{ allSourcesSearchQuery || allSourcesFilterType !== 'all' ? 'No sources found' : 'No sources available' }}
          </h3>
          <p class="text-muted-foreground mb-6">
            {{
              allSourcesSearchQuery || allSourcesFilterType !== 'all'
                ? 'Try adjusting your filters.'
                : 'There are no public sources available yet.'
            }}
          </p>
        </div>

        <!-- Sources Grid/List -->
        <div
          v-else
          :class="viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'"
        >
          <SourceCard
            v-for="source in filteredAllSources"
            :key="source.id"
            :source="source"
            :is-subscribed="source.isSubscribed"
            :show-follow-button="true"
            :show-actions="source.isSubscribed"
            :show-report-button="true"
            :is-following="followingSourceIds.has(source.id)"
            @refresh="handleRefresh(source)"
            @view="handleView(source)"
            @follow="handleFollow(source)"
          />
        </div>

        <!-- Pagination -->
        <div v-if="allSourcesTotalPages > 1 && !allSourcesLoading" class="flex justify-center">
          <Pagination
            :total="allSourcesPagination.total"
            :items-per-page="allSourcesPagination.limit"
            :page="allSourcesCurrentPage"
            @update:page="handleAllSourcesPageChange"
          >
            <PaginationContent>
              <PaginationPrevious />
              <PaginationItem
                v-for="page in allSourcesVisiblePages"
                :key="page"
                :value="page"
                :is-active="page === allSourcesCurrentPage"
              >
                {{ page }}
              </PaginationItem>
              <PaginationNext />
            </PaginationContent>
          </Pagination>
        </div>
      </TabsContent>
    </Tabs>
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { toast } from 'vue-sonner'

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
  isSubscribed?: boolean
}

const activeTab = ref<'my-sources' | 'all-sources'>('my-sources')
const viewMode = ref<'grid' | 'list'>('grid')

// My Sources state
const mySourcesSearchQuery = ref('')
const mySourcesFilterType = ref('all')
const mySourcesLoading = ref(false)
const mySources = ref<Source[]>([])
const mySourcesPagination = ref({
  offset: 0,
  limit: 20,
  total: 0,
  hasMore: false,
})
const mySourcesCurrentPage = ref(1)

// All Sources state
const allSourcesSearchQuery = ref('')
const allSourcesFilterType = ref('all')
const allSourcesFilterSubscription = ref('all')
const allSourcesLoading = ref(false)
const allSources = ref<Source[]>([])
const followingSourceIds = ref<Set<string>>(new Set())
const allSourcesPagination = ref({
  offset: 0,
  limit: 20,
  total: 0,
  hasMore: false,
})
const allSourcesCurrentPage = ref(1)

const viewIcon = computed(() => {
  return viewMode.value === 'grid' ? 'lucide:list' : 'lucide:grid'
})

// Calculate total pages for My Sources
const mySourcesTotalPages = computed(() => {
  if (mySourcesPagination.value.total === 0) return 0
  return Math.ceil(mySourcesPagination.value.total / mySourcesPagination.value.limit)
})

// Calculate visible pages for My Sources pagination
const mySourcesVisiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = mySourcesTotalPages.value
  const current = mySourcesCurrentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > 3) {
      pages.push('ellipsis-start')
    }
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (current < total - 2) {
      pages.push('ellipsis-end')
    }
    pages.push(total)
  }

  return pages.filter((p) => typeof p === 'number') as number[]
})

// Calculate total pages for All Sources
const allSourcesTotalPages = computed(() => {
  if (allSourcesPagination.value.total === 0) return 0
  return Math.ceil(allSourcesPagination.value.total / allSourcesPagination.value.limit)
})

// Calculate visible pages for All Sources pagination
const allSourcesVisiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = allSourcesTotalPages.value
  const current = allSourcesCurrentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > 3) {
      pages.push('ellipsis-start')
    }
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (current < total - 2) {
      pages.push('ellipsis-end')
    }
    pages.push(total)
  }

  return pages.filter((p) => typeof p === 'number') as number[]
})

// Filtered My Sources
const filteredMySources = computed(() => {
  let filtered = mySources.value

  if (mySourcesSearchQuery.value) {
    const query = mySourcesSearchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (source) =>
        source.name.toLowerCase().includes(query) || source.url.toLowerCase().includes(query),
    )
  }

  if (mySourcesFilterType.value !== 'all') {
    filtered = filtered.filter(
      (source) => source.source.toLowerCase() === mySourcesFilterType.value.toLowerCase(),
    )
  }

  return filtered
})

// Filtered All Sources
const filteredAllSources = computed(() => {
  let filtered = allSources.value

  if (allSourcesSearchQuery.value) {
    const query = allSourcesSearchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (source) =>
        source.name.toLowerCase().includes(query) || source.url.toLowerCase().includes(query),
    )
  }

  if (allSourcesFilterType.value !== 'all') {
    filtered = filtered.filter(
      (source) => source.source.toLowerCase() === allSourcesFilterType.value.toLowerCase(),
    )
  }

  if (allSourcesFilterSubscription.value === 'subscribed') {
    filtered = filtered.filter((source) => source.isSubscribed === true)
  } else if (allSourcesFilterSubscription.value === 'not-subscribed') {
    filtered = filtered.filter((source) => source.isSubscribed === false)
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

const handleSubscriptionFilter = () => {
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

const handleFollow = async (source: Source) => {
  if (followingSourceIds.value.has(source.id)) {
    return // Already following
  }

  followingSourceIds.value.add(source.id)

  try {
    await sourcesService.addSource(source.url)

    // Update the source's subscription status
    const sourceIndex = allSources.value.findIndex((s) => s.id === source.id)
    if (sourceIndex !== -1) {
      allSources.value[sourceIndex].isSubscribed = true
    }

    // Reload my sources to include the newly followed source
    await loadMySources(mySourcesCurrentPage.value)

    toast.success('Source followed', {
      description: `You are now following ${source.name}`,
      duration: 3000,
    })
  } catch (error) {
    followingSourceIds.value.delete(source.id)
    toast.error('Failed to follow source', {
      description:
        error instanceof Error ? error.message : 'Please try again later.',
      duration: 5000,
    })
  }
}

// Load My Sources
const loadMySources = async (page: number) => {
  mySourcesLoading.value = true
  try {
    const offset = (page - 1) * mySourcesPagination.value.limit

    const response = await sourcesService.getUserSources({
      offset,
      limit: mySourcesPagination.value.limit,
    })

    mySources.value = response.data.map((userSource) => ({
      id: userSource.source.id,
      name: userSource.source.name,
      url: userSource.source.url,
      source: userSource.source.source,
      lastFetchedAt: userSource.source.updatedAt,
      isSubscribed: true,
    }))

    mySourcesPagination.value = {
      offset: response.offset,
      limit: response.limit,
      total: response.total,
      hasMore: response.hasMore,
    }

    mySourcesCurrentPage.value = page
  } catch (error) {
    console.error('Failed to fetch user sources:', error)
    toast.error('Failed to load your sources', {
      description:
        error instanceof Error ? error.message : 'Please try again later.',
      duration: 5000,
    })
  } finally {
    mySourcesLoading.value = false
  }
}

const handleMySourcesPageChange = (page: number) => {
  if (page >= 1 && page <= mySourcesTotalPages.value) {
    loadMySources(page)
  }
}

// Load All Sources
const loadAllSources = async (page: number) => {
  allSourcesLoading.value = true
  try {
    const offset = (page - 1) * allSourcesPagination.value.limit

    const response = await sourcesService.getAllSources({
      offset,
      limit: allSourcesPagination.value.limit,
    })

    allSources.value = response.data.map((item) => ({
      id: item.source.id,
      name: item.source.name,
      url: item.source.url,
      source: item.source.source,
      lastFetchedAt: item.source.updatedAt,
      isSubscribed: item.isSubscribed,
    }))

    allSourcesPagination.value = {
      offset: response.offset,
      limit: response.limit,
      total: response.total,
      hasMore: response.hasMore,
    }

    allSourcesCurrentPage.value = page
  } catch (error) {
    console.error('Failed to fetch sources:', error)
    toast.error('Failed to load sources', {
      description:
        error instanceof Error ? error.message : 'Please try again later.',
      duration: 5000,
    })
  } finally {
    allSourcesLoading.value = false
  }
}

const handleAllSourcesPageChange = (page: number) => {
  if (page >= 1 && page <= allSourcesTotalPages.value) {
    loadAllSources(page)
  }
}

// Watch for tab changes and load appropriate data
watch(activeTab, async (newTab) => {
  if (newTab === 'my-sources' && mySources.value.length === 0) {
    await loadMySources(1)
  } else if (newTab === 'all-sources' && allSources.value.length === 0) {
    await loadAllSources(1)
  }
})

onMounted(async () => {
  await loadMySources(1)
})
</script>


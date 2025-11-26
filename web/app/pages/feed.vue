<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Your Feed</h1>
        <p class="text-muted-foreground mt-1">Latest posts from your sources</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="refreshFeed">
          <Icon
            name="lucide:refresh-cw"
            class="h-4 w-4 mr-2"
            :class="{ 'animate-spin': isRefreshing }"
          />
          Refresh
        </Button>
        <Button variant="outline" size="sm" @click="toggleView">
          <Icon :name="viewIcon" class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <div
      class="flex flex-wrap items-center justify-between gap-4 p-4 bg-card rounded-lg border border-border"
    >
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:filter" class="h-4 w-4 text-muted-foreground" />
          <span class="text-sm font-medium text-foreground">Filters:</span>
        </div>
        <Select v-model="selectedSource" @update:model-value="handleSourceFilter">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem v-for="source in sources" :key="source.id" :value="source.id">
              {{ source.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="sortBy" @update:model-value="handleSort">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="source">By Source</SelectItem>
          </SelectContent>
        </Select>
        <div class="relative max-w-xs">
          <Icon
            name="lucide:search"
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input v-model="searchQuery" placeholder="Search posts..." class="pl-9" />
        </div>
      </div>
      <!-- Pagination in Filters Block -->
      <div v-if="totalPages > 1 && !isLoading && posts.length > 0" class="flex items-center">
        <Pagination
          :total="total"
          :items-per-page="limit"
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
    <div
      v-if="isLoading && posts.length === 0"
      :class="viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'"
    >
      <PostCardSkeleton v-for="i in 6" :key="i" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading && filteredPosts.length === 0" class="text-center py-12">
      <Icon name="lucide:inbox" class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-foreground mb-2">No posts yet</h3>
      <p class="text-muted-foreground mb-6">
        {{
          searchQuery
            ? 'No posts match your search.'
            : selectedSource !== 'all'
              ? 'No posts found for the selected source.'
              : sources.length === 0
                ? 'Add sources to start seeing posts in your feed. Posts will appear here once your sources are fetched.'
                : 'Your sources have been added, but no posts have been fetched yet. Posts will appear here once they are available.'
        }}
      </p>
      <div class="flex gap-2 justify-center">
        <Button v-if="!searchQuery" @click="navigateTo('/sources/add')">
          <Icon name="lucide:plus-circle" class="mr-2 h-4 w-4" />
          {{ sources.length === 0 ? 'Add Your First Source' : 'Add More Sources' }}
        </Button>
        <Button v-if="sources.length > 0" variant="outline" @click="refreshFeed">
          <Icon name="lucide:refresh-cw" class="mr-2 h-4 w-4" />
          Refresh Feed
        </Button>
      </div>
    </div>

    <!-- Posts Grid/List -->
    <div
      v-else
      :class="viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'"
    >
      <PostPreviewCard
        v-for="post in filteredPosts"
        :key="post.id"
        :post="post"
        @click="handlePostClick"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1 && !isLoading" class="flex justify-center">
      <Pagination
        :total="total"
        :items-per-page="limit"
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
import PostPreviewCard from '~/components/posts/PostPreviewCard.vue'
import PostCardSkeleton from '~/components/posts/PostCardSkeleton.vue'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useApi } from '~/composables/useApi'
import { FeedService } from '~/lib/api'
import type { FeedPost, SourceDto, GetFeedQuery } from '~/types/posts.types'
import { useDebounce } from '~/composables/useDebounce'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
})

const api = useApi()
const feedService = new FeedService(api)

const viewMode = ref<'list' | 'grid'>('list')
const selectedSource = ref('all')
const sortBy = ref('newest')
const searchQuery = ref('')
const isLoading = ref(false)
const isRefreshing = ref(false)
const posts = ref<FeedPost[]>([])
const sources = ref<SourceDto[]>([])
const total = ref(0)
const currentPage = ref(1)
const limit = 20

// Debounce search query
const debouncedSearchQuery = useDebounce(searchQuery, 500)

const viewIcon = computed(() => {
  return viewMode.value === 'list' ? 'lucide:grid' : 'lucide:list'
})

const toggleView = () => {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list'
}

// Extract unique sources from posts
const extractSources = (posts: FeedPost[]) => {
  const sourceMap = new Map<string, SourceDto>()
  posts.forEach((post) => {
    if (post.source && !sourceMap.has(post.source.id)) {
      sourceMap.set(post.source.id, post.source)
    }
  })
  return Array.from(sourceMap.values())
}

// Calculate total pages
const totalPages = computed(() => {
  return Math.ceil(total.value / limit)
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

// Build query params
const buildQuery = (page: number): GetFeedQuery => {
  const query: GetFeedQuery = {
    offset: (page - 1) * limit,
    limit,
  }

  if (sortBy.value === 'newest') {
    query.sortField = 'createdAt'
    query.sortOrder = 'desc'
  } else if (sortBy.value === 'oldest') {
    query.sortField = 'createdAt'
    query.sortOrder = 'asc'
  }

  if (debouncedSearchQuery.value) {
    query.search = debouncedSearchQuery.value
  }

  return query
}

// Filter posts by source client-side (since backend doesn't support sourceIds filter)
const filteredPosts = computed(() => {
  if (selectedSource.value === 'all') {
    return posts.value
  }
  return posts.value.filter((post) => post.sourceId === selectedSource.value)
})

// Fetch feed posts
const fetchFeed = async (page: number) => {
  try {
    const query = buildQuery(page)
    console.log('Fetching feed with query:', query)

    isLoading.value = true
    const response = await feedService.getFeed(query)
    console.log('Feed response:', response)

    posts.value = response.data
    total.value = response.total
    currentPage.value = page

    // Extract sources from posts
    const extractedSources = extractSources(response.data)
    extractedSources.forEach((source) => {
      if (!sources.value.find((s) => s.id === source.id)) {
        sources.value.push(source)
      }
    })

    // Log if no posts found
    if (response.data.length === 0) {
      console.log('No posts found in feed. Total:', response.total)
    }

    return response
  } catch (error) {
    console.error('Failed to fetch feed:', error)

    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    toast.error('Error', {
      description:
        error instanceof Error ? error.message : 'Failed to load feed. Please try again.',
    })
    throw error
  } finally {
    isLoading.value = false
  }
}

const refreshFeed = async () => {
  isRefreshing.value = true
  try {
    currentPage.value = 1
    await fetchFeed(1)
  } finally {
    isRefreshing.value = false
  }
}

const handleSourceFilter = () => {
  currentPage.value = 1
  fetchFeed(1)
}

const handleSort = () => {
  currentPage.value = 1
  fetchFeed(1)
}

// Watch debounced search query
watch(debouncedSearchQuery, () => {
  currentPage.value = 1
  fetchFeed(1)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchFeed(page)
  // Scroll to top of page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handlePostClick = (post: FeedPost) => {
  navigateTo(`/posts/${post.id}`)
}

// Fetch posts on mount
onMounted(async () => {
  await fetchFeed(1)
})
</script>

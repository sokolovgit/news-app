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
    <div class="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
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

    <!-- Loading State -->
    <div v-if="isLoading && posts.length === 0" class="space-y-4">
      <PostCardSkeleton v-for="i in 5" :key="i" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading && posts.length === 0" class="text-center py-12">
      <Icon name="lucide:inbox" class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-foreground mb-2">No posts yet</h3>
      <p class="text-muted-foreground mb-6">
        {{
          searchQuery
            ? 'No posts match your search.'
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

    <!-- Posts List -->
    <div v-else class="space-y-4">
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @bookmark="handleBookmark(post)"
      />
    </div>

    <!-- Load More -->
    <div v-if="hasMore && !isLoading" class="text-center">
      <Button variant="outline" @click="loadMore"> Load More Posts </Button>
    </div>

    <!-- Loading More -->
    <div v-if="isLoadingMore" class="text-center py-4">
      <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
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
import PostCard from '~/components/posts/PostCard.vue'
import PostCardSkeleton from '~/components/posts/PostCardSkeleton.vue'
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
const isLoadingMore = ref(false)
const hasMore = ref(true)
const posts = ref<FeedPost[]>([])
const sources = ref<SourceDto[]>([])
const offset = ref(0)
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

// Build query params
const buildQuery = (resetOffset = false): GetFeedQuery => {
  const query: GetFeedQuery = {
    offset: resetOffset ? 0 : offset.value,
    limit,
  }

  if (selectedSource.value !== 'all') {
    query.sourceIds = [selectedSource.value]
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

// Fetch feed posts
const fetchFeed = async (resetOffset = false) => {
  try {
    const query = buildQuery(resetOffset)
    console.log('Fetching feed with query:', query)

    const response = await feedService.getFeed(query)
    console.log('Feed response:', response)

    if (resetOffset) {
      posts.value = response.data
      offset.value = response.data.length
    } else {
      posts.value = [...posts.value, ...response.data]
      offset.value += response.data.length
    }

    hasMore.value = response.hasMore

    // Extract sources from posts
    const extractedSources = extractSources(response.data)
    extractedSources.forEach((source) => {
      if (!sources.value.find((s) => s.id === source.id)) {
        sources.value.push(source)
      }
    })

    // Log if no posts found
    if (response.data.length === 0) {
      console.log('No posts found in feed. Total:', response.total, 'HasMore:', response.hasMore)
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
  }
}

const refreshFeed = async () => {
  isRefreshing.value = true
  try {
    offset.value = 0
    await fetchFeed(true)
  } finally {
    isRefreshing.value = false
  }
}

const handleSourceFilter = () => {
  offset.value = 0
  fetchFeed(true)
}

const handleSort = () => {
  offset.value = 0
  fetchFeed(true)
}

// Watch debounced search query
watch(debouncedSearchQuery, () => {
  offset.value = 0
  fetchFeed(true)
})

const handleBookmark = (post: FeedPost) => {
  // TODO: Implement bookmark functionality
  console.log('Bookmark post:', post.id)
  toast.info('Bookmark', {
    description: 'Bookmark feature coming soon!',
  })
}

const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return

  isLoadingMore.value = true
  try {
    await fetchFeed(false)
  } finally {
    isLoadingMore.value = false
  }
}

// Fetch posts on mount
onMounted(async () => {
  isLoading.value = true
  try {
    await fetchFeed(true)
  } finally {
    isLoading.value = false
  }
})
</script>

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
        <Input
          v-model="searchQuery"
          placeholder="Search posts..."
          class="pl-9"
          @input="handleSearch"
        />
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
            : 'Add sources to start seeing posts in your feed.'
        }}
      </p>
      <Button v-if="!searchQuery" @click="navigateTo('/sources/add')">
        <Icon name="lucide:plus-circle" class="mr-2 h-4 w-4" />
        Add Your First Source
      </Button>
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

definePageMeta({
  layout: 'default',
})

const viewMode = ref<'list' | 'grid'>('list')
const selectedSource = ref('all')
const sortBy = ref('newest')
const searchQuery = ref('')
const isLoading = ref(false)
const isRefreshing = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const posts = ref<any[]>([])
const sources = ref<any[]>([])

const viewIcon = computed(() => {
  return viewMode.value === 'list' ? 'lucide:grid' : 'lucide:list'
})

const toggleView = () => {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list'
}

const refreshFeed = async () => {
  isRefreshing.value = true
  try {
    // TODO: Fetch fresh posts
    await new Promise((resolve) => setTimeout(resolve, 1000))
  } finally {
    isRefreshing.value = false
  }
}

const handleSourceFilter = () => {
  // TODO: Filter posts by source
  console.log('Filter by source:', selectedSource.value)
}

const handleSort = () => {
  // TODO: Sort posts
  console.log('Sort by:', sortBy.value)
}

const handleSearch = () => {
  // TODO: Search posts
  console.log('Search:', searchQuery.value)
}

const handleBookmark = (post: any) => {
  // TODO: Implement bookmark functionality
  console.log('Bookmark post:', post.id)
}

const loadMore = async () => {
  isLoadingMore.value = true
  try {
    // TODO: Load more posts
    await new Promise((resolve) => setTimeout(resolve, 1000))
  } finally {
    isLoadingMore.value = false
  }
}

// TODO: Fetch posts and sources on mount
onMounted(async () => {
  isLoading.value = true
  try {
    // const feedData = await fetchFeed()
    // posts.value = feedData.posts
    // sources.value = feedData.sources
  } finally {
    isLoading.value = false
  }
})
</script>

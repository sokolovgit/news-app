<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
          >
            <Icon name="lucide:rss" class="h-5 w-5 text-primary" />
          </div>
          <h1 class="text-3xl font-bold text-foreground tracking-tight">Your Feed</h1>
        </div>
        <p class="text-muted-foreground">
          Stay updated with the latest content from your sources
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          class="gap-2 border-border/50 hover:border-primary/30"
          :class="{ 'bg-primary/10 border-primary/50': feedStore.isSelectionMode }"
          @click="feedStore.toggleSelectionMode"
        >
          <Icon
            name="lucide:check-square"
            class="h-4 w-4"
            :class="{ 'text-primary': feedStore.isSelectionMode }"
          />
          {{ feedStore.isSelectionMode ? 'Cancel' : 'Select' }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          class="gap-2 border-border/50 hover:border-primary/30"
          @click="feedStore.refreshPosts"
        >
          <Icon
            name="lucide:refresh-cw"
            class="h-4 w-4"
            :class="{ 'animate-spin': feedStore.isRefreshing }"
          />
          Refresh
        </Button>
        <div class="flex items-center rounded-lg border border-border/50 p-0.5">
          <Button
            variant="ghost"
            size="sm"
            class="h-8 px-3 rounded-md"
            :class="{ 'bg-muted': viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            <Icon name="lucide:list" class="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="h-8 px-3 rounded-md"
            :class="{ 'bg-muted': viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            <Icon name="lucide:grid-3x3" class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div
      class="flex flex-wrap items-center justify-between gap-4 p-4 bg-card rounded-xl border border-border shadow-sm"
    >
      <div class="flex flex-wrap items-center gap-3">
        <Select 
          v-model="feedStore.filters.sourceId" 
          @update:model-value="handleSourceFilter"
        >
          <SelectTrigger class="w-[180px] border-border bg-background">
            <div class="flex items-center gap-2">
              <Icon name="lucide:layers" class="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="All Sources" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem 
              v-for="source in feedStore.userSources" 
              :key="source.id" 
              :value="source.id"
            >
              {{ source.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select 
          v-model="feedStore.filters.sortBy" 
          @update:model-value="handleSort"
        >
          <SelectTrigger class="w-[160px] border-border bg-background">
            <div class="flex items-center gap-2">
              <Icon name="lucide:arrow-up-down" class="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
        <div class="relative">
          <Icon
            name="lucide:search"
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            v-model="feedStore.filters.search"
            placeholder="Search posts..."
            class="pl-9 w-[200px] md:w-[280px] border-border bg-background"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>
      <!-- Pagination in Filters Block -->
      <div v-if="feedStore.totalPages > 1 && !feedStore.isLoading && feedStore.posts.length > 0" class="flex items-center">
        <Pagination
          :total="feedStore.pagination.total"
          :items-per-page="feedStore.pagination.limit"
          :page="feedStore.currentPage"
          @update:page="feedStore.goToPage"
        >
          <PaginationContent>
            <PaginationPrevious />
            <PaginationItem
              v-for="page in feedStore.visiblePages"
              :key="page"
              :value="page"
              :is-active="page === feedStore.currentPage"
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
      v-if="feedStore.isLoading && feedStore.posts.length === 0"
      :class="viewMode === 'grid' ? 'grid gap-5 md:grid-cols-2 lg:grid-cols-3' : 'grid gap-5 grid-cols-1 lg:grid-cols-2'"
    >
      <PostCardSkeleton v-for="i in 6" :key="i" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!feedStore.isLoading && feedStore.posts.length === 0"
      class="text-center py-16 px-4"
    >
      <div
        class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/30 flex items-center justify-center"
      >
        <Icon name="lucide:inbox" class="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 class="text-xl font-semibold text-foreground mb-2">No posts yet</h3>
      <p class="text-muted-foreground mb-8 max-w-md mx-auto">
        {{
          feedStore.filters.search
            ? 'No posts match your search. Try different keywords.'
            : feedStore.filters.sourceId !== 'all'
              ? 'No posts found for the selected source.'
              : feedStore.userSources.length === 0
                ? 'Add sources to start seeing posts in your feed. Posts will appear here once your sources are fetched.'
                : 'Your sources have been added, but no posts have been fetched yet. Posts will appear here once they are available.'
        }}
      </p>
      <div class="flex gap-3 justify-center">
        <Button v-if="!feedStore.filters.search" class="gap-2" @click="navigateTo('/sources/add')">
          <Icon name="lucide:plus-circle" class="h-4 w-4" />
          {{ feedStore.userSources.length === 0 ? 'Add Your First Source' : 'Add More Sources' }}
        </Button>
        <Button v-if="feedStore.userSources.length > 0" variant="outline" class="gap-2" @click="feedStore.refreshPosts">
          <Icon name="lucide:refresh-cw" class="h-4 w-4" />
          Refresh Feed
        </Button>
      </div>
    </div>

    <!-- Posts Grid/List -->
    <div
      v-else
      :class="viewMode === 'grid' ? 'grid gap-5 md:grid-cols-2 lg:grid-cols-3' : 'grid gap-5 grid-cols-1 lg:grid-cols-2'"
    >
      <PostPreviewCard
        v-for="post in feedStore.posts"
        :key="post.id"
        :post="post"
        :selectable="feedStore.isSelectionMode"
        :is-selected="feedStore.selectedPostIds.has(post.id)"
        @click="handlePostClick"
        @toggle-select="handleToggleSelect"
      />
    </div>

    <!-- Selection Footer -->
    <div
      v-if="feedStore.isSelectionMode && feedStore.selectedPostIds.size > 0"
      class="fixed bottom-0 inset-x-0 bg-background/90 dark:bg-background/95 backdrop-blur-xl backdrop-saturate-150 border-t border-border/50 p-4 z-50 before:absolute before:inset-0 before:bg-linear-to-t before:from-background/40 before:to-transparent before:pointer-events-none"
    >
      <div class="relative container mx-auto flex items-center justify-between max-w-7xl">
        <div class="flex items-center gap-3">
          <Badge variant="secondary" class="text-sm">
            {{ feedStore.selectedPostIds.size }} selected
          </Badge>
          <Button variant="ghost" size="sm" @click="feedStore.clearSelection">
            Clear
          </Button>
        </div>
        <Button class="gap-2" @click="createArticleFromSelection">
          <Icon name="lucide:pen-square" class="h-4 w-4" />
          Create Article
        </Button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="feedStore.totalPages > 1 && !feedStore.isLoading" class="flex justify-center">
      <Pagination
        :total="feedStore.pagination.total"
        :items-per-page="feedStore.pagination.limit"
        :page="feedStore.currentPage"
        @update:page="feedStore.goToPage"
      >
        <PaginationContent>
          <PaginationPrevious />
          <PaginationItem
            v-for="page in feedStore.visiblePages"
            :key="page"
            :value="page"
            :is-active="page === feedStore.currentPage"
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
import { Badge } from '@/components/ui/badge'
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
import { useFeedStore } from '~/stores/feed.store'
import type { FeedPost } from '~/types/posts.types'
import { useDebounce } from '~/composables/useDebounce'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
})

const feedStore = useFeedStore()

const viewMode = ref<'list' | 'grid'>('list')

// Debounce search query
const debouncedSearch = useDebounce(toRef(feedStore.filters, 'search'), 500)

const handleSourceFilter = async () => {
  await feedStore.applyFilters()
}

const handleSort = async () => {
  await feedStore.applyFilters()
}

const handleSearch = async () => {
  await feedStore.applyFilters()
}

// Watch debounced search query
watch(debouncedSearch, async () => {
  await feedStore.applyFilters()
})

const handlePostClick = (post: FeedPost) => {
  if (!feedStore.isSelectionMode) {
    navigateTo(`/posts/${post.id}`)
  }
}

const handleToggleSelect = (post: FeedPost) => {
  feedStore.togglePostSelection(post.id)
}

const createArticleFromSelection = () => {
  const ids = Array.from(feedStore.selectedPostIds)
  navigateTo({
    path: '/articles/create',
    query: { sourcePostIds: ids },
  })
}

// Fetch posts and user sources on mount
onMounted(async () => {
  try {
    await Promise.all([
      feedStore.fetchPosts(1),
      feedStore.fetchUserSources(),
    ])
  } catch (error) {
    toast.error('Error', {
      description: error instanceof Error ? error.message : 'Failed to load feed. Please try again.',
    })
  }
})
</script>

<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <section
      class="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary via-secondary to-tertiary p-8 md:p-12"
    >
      <div class="relative z-10">
        <h1 class="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
          Welcome back, {{ userInitials }}!
        </h1>
        <p class="text-lg md:text-xl text-primary-foreground/90 mb-6 max-w-2xl">
          Stay updated with your personalized news feed from all your favorite sources.
        </p>
        <div class="flex flex-wrap gap-4">
          <Button
            size="lg"
            variant="outline"
            class="border-card-foreground/20 text-card-foreground bg-card transition-all hover:bg-card/90 hover:border-card-foreground/40 hover:scale-105 hover:shadow-lg"
            @click="navigateTo('/sources/add')"
          >
            <Icon name="lucide:plus-circle" class="mr-2 h-5 w-5" />
            Add New Source
          </Button>
          <Button
            size="lg"
            variant="outline"
            class="border-card-foreground/20 text-card-foreground bg-card transition-all hover:bg-card/90 hover:border-card-foreground/40 hover:scale-105 hover:shadow-lg"
            @click="navigateTo('/feed')"
          >
            <Icon name="lucide:rss" class="mr-2 h-5 w-5" />
            View Feed
          </Button>
        </div>
      </div>
    </section>

    <!-- Stats Cards -->
    <section>
      <h2 class="text-2xl font-bold text-foreground mb-4">Overview</h2>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Sources"
          :value="stats.totalSources"
          icon="lucide:book-open"
          description="Sources you're following"
        />
        <StatsCard
          title="Posts Today"
          :value="stats.postsToday"
          icon="lucide:newspaper"
          description="New posts in last 24h"
        />
        <StatsCard
          title="Last Updated"
          :value="stats.lastUpdated"
          icon="lucide:clock"
          description="Feed refresh time"
        />
      </div>
    </section>

    <!-- Quick Actions -->
    <section>
      <h2 class="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <QuickActionCard
          title="Add Source"
          description="Add a new RSS feed or Instagram account"
          icon="lucide:plus-circle"
          @click="navigateTo('/sources/add')"
        />
        <QuickActionCard
          title="Manage Sources"
          description="View and manage all your sources"
          icon="lucide:settings"
          @click="navigateTo('/sources')"
        />
      </div>
    </section>

    <!-- Recent Sources Preview -->
    <section v-if="!isLoading && recentSources.length > 0">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-foreground">Recent Sources</h2>
        <NuxtLink to="/sources" class="text-sm text-primary-foreground hover:underline">
          View all
        </NuxtLink>
      </div>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SourceCard
          v-for="source in recentSources"
          :key="source.source.id"
          :source="formatSourceForCard(source)"
          :preview="true"
        />
      </div>
    </section>

    <!-- Feed Preview -->
    <section v-if="!isLoading && recentPosts.length > 0">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-foreground">Latest Posts</h2>
        <NuxtLink to="/feed" class="text-sm text-primary-foreground hover:underline">
          View all
        </NuxtLink>
      </div>
      <div class="space-y-4">
        <PostCard v-for="post in recentPosts" :key="post.id" :post="post" :preview="true" />
      </div>
    </section>

    <!-- Loading State -->
    <section v-if="isLoading" class="text-center py-12">
      <div class="max-w-md mx-auto">
        <Icon
          name="lucide:loader-2"
          class="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-spin"
        />
        <h3 class="text-xl font-semibold text-foreground mb-2">Loading...</h3>
        <p class="text-muted-foreground">Fetching your data</p>
      </div>
    </section>

    <!-- Error State -->
    <section v-if="!isLoading && error" class="text-center py-12">
      <div class="max-w-md mx-auto">
        <Icon name="lucide:alert-circle" class="h-16 w-16 text-destructive mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-foreground mb-2">Error Loading Data</h3>
        <p class="text-muted-foreground mb-6">{{ error }}</p>
        <Button @click="fetchData">
          <Icon name="lucide:refresh-cw" class="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </section>

    <!-- Empty State -->
    <section
      v-if="!isLoading && !error && recentSources.length === 0 && recentPosts.length === 0"
      class="text-center py-12"
    >
      <div class="max-w-md mx-auto">
        <Icon name="lucide:inbox" class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-foreground mb-2">Get Started</h3>
        <p class="text-muted-foreground mb-6">
          Add your first source to start seeing personalized news in your feed.
        </p>
        <Button @click="navigateTo('/sources/add')">
          <Icon name="lucide:plus-circle" class="mr-2 h-4 w-4" />
          Add Your First Source
        </Button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import StatsCard from '~/components/dashboard/StatsCard.vue'
import QuickActionCard from '~/components/dashboard/QuickActionCard.vue'
import SourceCard from '~/components/sources/SourceCard.vue'
import PostCard from '~/components/posts/PostCard.vue'
import { useAuthStore } from '~/stores/auth.store'
import { SourcesService } from '~/lib/api/sources.service'
import { FeedService } from '~/lib/api/feed.service'
import type { FeedPost } from '~/types/posts.types'
import type { UserSourceResponse } from '~/lib/api/sources.service'

// Layout is default by default, but we can explicitly set it
definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const route = useRoute()

// Redirect unauthorized users to landing page
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated && route.path === '/') {
      navigateTo('/landing')
    }
  },
  { immediate: true },
)

const userInitials = computed(() => {
  const email = authStore.userEmail || ''
  if (!email) return 'User'
  const localPart = email.split('@')[0]
  if (!localPart) return 'User'
  const parts = localPart.split('.')
  if (parts.length >= 2 && parts[0] && parts[1]) {
    const first = parts[0][0]
    const second = parts[1][0]
    if (first && second) {
      return (first + second).toUpperCase()
    }
  }
  return localPart[0]?.toUpperCase() || 'User'
})

// Services
const api = useApi()
const sourcesService = new SourcesService(api)
const feedService = new FeedService(api)

// State
const isLoading = ref(false)
const error = ref<string | null>(null)

const stats = ref({
  totalSources: 0,
  postsToday: 0,
  lastUpdated: 'Never',
})

const recentSources = ref<UserSourceResponse[]>([])
const recentPosts = ref<FeedPost[]>([])

// Format lastUpdated ISO string to readable format
function formatLastUpdated(isoString: string | null): string {
  if (!isoString) return 'Never'

  const now = new Date()
  const updated = new Date(isoString)
  const diffMs = now.getTime() - updated.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return 'Just now'
  } else if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return updated.toLocaleDateString()
  }
}

// Format sources for SourceCard component
function formatSourceForCard(source: UserSourceResponse) {
  return {
    id: source.source.id,
    name: source.source.name,
    url: source.source.url,
    source: source.source.source,
    lastFetchedAt: source.source.updatedAt,
  }
}

// Fetch data
async function fetchData() {
  isLoading.value = true
  error.value = null

  try {
    // Fetch dashboard stats from backend
    const [dashboardStats, sourcesResponse, postsResponse] = await Promise.all([
      sourcesService.getDashboardStats(),
      sourcesService.getUserSources({
        limit: 6,
        offset: 0,
      }),
      feedService.getFeed({
        limit: 5,
        offset: 0,
        sortField: 'createdAt',
        sortOrder: 'desc',
      }),
    ])

    // Update stats from backend
    stats.value = {
      totalSources: dashboardStats.totalSources,
      postsToday: dashboardStats.postsToday,
      lastUpdated: formatLastUpdated(dashboardStats.lastUpdated),
    }

    recentSources.value = sourcesResponse.data
    recentPosts.value = postsResponse.data
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
    console.error('Failed to fetch home page data:', err)
    error.value = errorMessage
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchData()
})
</script>

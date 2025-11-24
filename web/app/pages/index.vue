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
            class="border-card-foreground/20 text-card-foreground bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80 hover:border-card-foreground/40 hover:scale-105 hover:shadow-lg"
            @click="navigateTo('/sources/add')"
          >
            <Icon name="lucide:plus-circle" class="mr-2 h-5 w-5" />
            Add New Source
          </Button>
          <Button
            size="lg"
            variant="outline"
            class="border-card-foreground/20 text-card-foreground bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80 hover:border-card-foreground/40 hover:scale-105 hover:shadow-lg"
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
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          title="Unread Items"
          :value="stats.unreadItems"
          icon="lucide:mail"
          description="Posts you haven't read"
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
    <section v-if="recentSources.length > 0">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-foreground">Recent Sources</h2>
        <NuxtLink to="/sources" class="text-sm text-primary-foreground hover:underline">
          View all
        </NuxtLink>
      </div>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SourceCard
          v-for="source in recentSources"
          :key="source.id"
          :source="source"
          :preview="true"
        />
      </div>
    </section>

    <!-- Feed Preview -->
    <section v-if="recentPosts.length > 0">
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

    <!-- Empty State -->
    <section
      v-if="recentSources.length === 0 && recentPosts.length === 0"
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

// Layout is default by default, but we can explicitly set it
definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()

const userInitials = computed(() => {
  const email = authStore.userEmail || ''
  if (!email) return 'User'
  const parts = email.split('@')[0].split('.')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return email[0].toUpperCase()
})

// Mock data for now - will be replaced with actual API calls
const stats = ref({
  totalSources: 0,
  postsToday: 0,
  unreadItems: 0,
  lastUpdated: 'Never',
})

const recentSources = ref<any[]>([])
const recentPosts = ref<any[]>([])

// TODO: Fetch actual data from API
onMounted(async () => {
  // Fetch stats and recent data
  // const sourcesData = await fetchUserSources()
  // const postsData = await fetchRecentPosts()
})
</script>

<template>
  <div class="space-y-16">
    <!-- Hero Section -->
    <section class="text-center py-16 md:py-24">
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6">
          <Icon name="lucide:newspaper" class="h-10 w-10 text-primary" />
        </div>
        <h1 class="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
          Your Personalized News Hub
        </h1>
        <p class="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Aggregate articles from RSS feeds, Instagram, and Twitter. Create and share your own articles with the community.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button size="lg" class="gap-2" @click="navigateTo('/register')">
            <Icon name="lucide:user-plus" class="h-5 w-5" />
            Get Started
          </Button>
          <Button size="lg" variant="outline" class="gap-2" @click="navigateTo('/articles/public')">
            <Icon name="lucide:book-open" class="h-5 w-5" />
            Browse Articles
          </Button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Everything You Need
        </h2>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Powerful features to help you stay informed and share your thoughts
        </p>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon="lucide:rss"
          title="RSS Feed Aggregation"
          description="Connect multiple RSS feeds and get all your news in one place. Never miss an update from your favorite sources."
        />
        <FeatureCard
          icon="lucide:instagram"
          title="Social Media Integration"
          description="Follow Instagram and Twitter accounts. See posts alongside your RSS feeds for a complete news experience."
        />
        <FeatureCard
          icon="lucide:pen-square"
          title="Create Articles"
          description="Write and publish your own articles. Share your insights with the community and build your audience."
        />
        <FeatureCard
          icon="lucide:search"
          title="Smart Search"
          description="Find articles quickly with powerful search. Filter by source, date, and keywords to find exactly what you need."
        />
        <FeatureCard
          icon="lucide:share-2"
          title="Easy Sharing"
          description="Share articles with one click. Copy links and share your favorite content with friends and colleagues."
        />
        <FeatureCard
          icon="lucide:shield"
          title="Privacy First"
          description="Your data is secure. We respect your privacy and give you full control over your content and sources."
        />
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-br from-primary/10 via-secondary/10 to-tertiary/10 rounded-2xl border border-border">
      <div class="text-center max-w-2xl mx-auto space-y-6">
        <h2 class="text-3xl md:text-4xl font-bold text-foreground">
          Ready to Get Started?
        </h2>
        <p class="text-lg text-muted-foreground">
          Join our community and start aggregating your news sources today.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button size="lg" class="gap-2" @click="navigateTo('/register')">
            <Icon name="lucide:user-plus" class="h-5 w-5" />
            Create Account
          </Button>
          <Button size="lg" variant="outline" class="gap-2" @click="navigateTo('/login')">
            <Icon name="lucide:log-in" class="h-5 w-5" />
            Sign In
          </Button>
        </div>
      </div>
    </section>

    <!-- Recent Articles Preview -->
    <section class="py-16">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-bold text-foreground mb-2">Recent Articles</h2>
          <p class="text-muted-foreground">Check out what the community is sharing</p>
        </div>
        <Button variant="outline" @click="navigateTo('/articles/public')">
          View All
          <Icon name="lucide:arrow-right" class="h-4 w-4 ml-2" />
        </Button>
      </div>
      <div v-if="isLoading" class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <ArticleCardSkeleton v-for="i in 6" :key="i" />
      </div>
      <div v-else-if="articles.length > 0" class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <ArticleCard
          v-for="article in articles"
          :key="article.id"
          :article="article"
          :show-actions="false"
          @share="handleShare"
        />
      </div>
      <div v-else class="text-center py-12">
        <Icon name="lucide:file-text" class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p class="text-muted-foreground">No articles yet. Be the first to publish!</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import ArticleCard from '~/components/articles/ArticleCard.vue'
import ArticleCardSkeleton from '~/components/articles/ArticleCardSkeleton.vue'
import FeatureCard from '~/components/landing/FeatureCard.vue'
import { useApi } from '~/composables/useApi'
import { ArticlesService } from '~/lib/api'
import { useShare } from '~/composables/useShare'
import type { Article } from '~/types/articles.types'

definePageMeta({
  layout: 'default',
})

const api = useApi()
const articlesService = new ArticlesService(api)
const { shareArticle } = useShare()

const articles = ref<Article[]>([])
const isLoading = ref(true)

const handleShare = async (article: Article) => {
  await shareArticle(article)
}

// Fetch recent public articles
onMounted(async () => {
  try {
    isLoading.value = true
    const response = await articlesService.getPublicArticles({
      limit: 6,
      offset: 0,
      sortField: 'publishedAt',
      sortOrder: 'desc',
    })
    articles.value = response.data
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  } finally {
    isLoading.value = false
  }
})
</script>


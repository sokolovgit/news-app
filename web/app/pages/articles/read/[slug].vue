<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div class="space-y-4">
        <Skeleton class="h-12 w-3/4" />
        <Skeleton class="h-6 w-1/2" />
        <Skeleton class="h-64 w-full" />
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-3/4" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <Icon name="lucide:alert-circle" class="h-16 w-16 text-destructive mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-foreground mb-2">Article not found</h3>
      <p class="text-muted-foreground mb-6">{{ error }}</p>
      <Button @click="navigateTo('/articles')">
        <Icon name="lucide:arrow-left" class="h-4 w-4 mr-2" />
        Back to Articles
      </Button>
    </div>

    <!-- Article Content -->
    <article v-else-if="article" class="max-w-4xl mx-auto">
      <!-- Header Actions -->
      <div class="flex items-center justify-between mb-6">
        <Button variant="ghost" @click="goBack">
          <Icon name="lucide:arrow-left" class="h-4 w-4 mr-2" />
          Back to Articles
        </Button>
        <Button v-if="article.slug" variant="outline" class="gap-2" @click="handleShare">
          <Icon name="lucide:share-2" class="h-4 w-4" />
          Share
        </Button>
      </div>

      <!-- Cover Image -->
      <div v-if="article.coverImageUrl" class="mb-8 rounded-lg overflow-hidden">
        <img
          :src="getMediaUrl(article.coverImageUrl)"
          :alt="article.title"
          class="w-full h-auto object-cover"
          loading="lazy"
        />
      </div>

      <!-- Article Header -->
      <header class="mb-8">
        <h1 class="text-4xl font-bold text-foreground mb-4 leading-tight">
          {{ article.title }}
        </h1>

        <p v-if="article.description" class="text-xl text-muted-foreground mb-6 leading-relaxed">
          {{ article.description }}
        </p>

        <!-- Article Meta -->
        <div
          class="flex items-center gap-4 text-sm text-muted-foreground border-b border-border pb-6"
        >
          <div v-if="article.author" class="flex items-center gap-2">
            <Icon name="lucide:user" class="h-4 w-4" />
            <span>{{ article.author.email }}</span>
          </div>
          <div v-if="article.publishedAt" class="flex items-center gap-2">
            <Icon name="lucide:calendar" class="h-4 w-4" />
            <time
              :datetime="
                typeof article.publishedAt === 'string'
                  ? article.publishedAt
                  : article.publishedAt.toISOString()
              "
            >
              {{ formatDate(article.publishedAt) }}
            </time>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="lucide:eye" class="h-4 w-4" />
            <span>{{ article.viewCount }} views</span>
          </div>
        </div>
      </header>

      <!-- Article Content -->
      <div class="prose prose-lg dark:prose-invert max-w-none">
        <ArticleContentRenderer :content="article.content" />
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ArticleContentRenderer from '~/components/articles/ArticleContentRenderer.vue'
import { useApi } from '~/composables/useApi'
import { ArticlesService } from '~/lib/api'
import type { Article } from '~/types/articles.types'
import { toast } from 'vue-sonner'
import { useMediaUrl } from '~/composables/useMediaUrl'
import { useShare } from '~/composables/useShare'
import { useAuthStore } from '~/stores/auth.store'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const api = useApi()
const articlesService = new ArticlesService(api)
const { getMediaUrl } = useMediaUrl()
const { shareArticle } = useShare()
const authStore = useAuthStore()

const article = ref<Article | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const handleShare = async () => {
  if (article.value && article.value.slug) {
    await shareArticle(article.value)
  }
}

const goBack = () => {
  const backPath = authStore.isAuthenticated ? '/articles' : '/articles/public'
  navigateTo(backPath)
}

// Format date for display
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Fetch article by slug
const fetchArticle = async () => {
  const params = route.params as { slug: string }
  const slug = params.slug

  if (!slug) {
    error.value = 'Invalid article slug'
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    error.value = null

    // Fetch article by slug
    article.value = await articlesService.getArticleBySlug(slug)
  } catch (err) {
    console.error('Failed to fetch article:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load article'
    toast.error('Error', {
      description: 'Failed to load article. Please try again.',
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchArticle()
})

// Watch for route changes
watch(
  () => (route.params as { slug: string }).slug,
  () => {
    fetchArticle()
  },
  { immediate: false },
)
</script>

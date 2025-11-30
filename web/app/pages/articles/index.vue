<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
          >
            <Icon name="lucide:pen-square" class="h-5 w-5 text-primary" />
          </div>
          <h1 class="text-3xl font-bold text-foreground tracking-tight">My Articles</h1>
        </div>
        <p class="text-muted-foreground">
          Create and manage your news articles
        </p>
      </div>
      <Button class="gap-2" @click="navigateTo('/articles/create')">
        <Icon name="lucide:plus" class="h-4 w-4" />
        New Article
      </Button>
    </div>

    <!-- Filters -->
    <div
      class="flex flex-wrap items-center justify-between gap-4 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50"
    >
      <div class="flex flex-wrap items-center gap-3">
        <!-- Status Filter -->
        <Select v-model="statusFilter" @update:model-value="handleStatusFilter">
          <SelectTrigger class="w-[140px] border-border/50 bg-background/50">
            <div class="flex items-center gap-2">
              <Icon name="lucide:filter" class="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="All" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <!-- Search -->
        <div class="relative">
          <Icon
            name="lucide:search"
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            v-model="searchQuery"
            placeholder="Search articles..."
            class="pl-9 w-[200px] md:w-[280px] border-border/50 bg-background/50"
          />
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1 && !isLoading && articles.length > 0" class="flex items-center">
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
      v-if="isLoading && articles.length === 0"
      class="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
    >
      <ArticleCardSkeleton v-for="i in 6" :key="i" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!isLoading && articles.length === 0"
      class="text-center py-16 px-4"
    >
      <div
        class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/30 flex items-center justify-center"
      >
        <Icon name="lucide:file-text" class="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 class="text-xl font-semibold text-foreground mb-2">No articles yet</h3>
      <p class="text-muted-foreground mb-8 max-w-md mx-auto">
        {{ searchQuery
          ? 'No articles match your search. Try different keywords.'
          : statusFilter !== 'all'
            ? `You don't have any ${statusFilter} articles yet.`
            : 'Start creating your first article to share your news with the world.'
        }}
      </p>
      <Button v-if="!searchQuery" class="gap-2" @click="navigateTo('/articles/create')">
        <Icon name="lucide:plus" class="h-4 w-4" />
        Create Your First Article
      </Button>
    </div>

    <!-- Articles Grid -->
    <div
      v-else
      class="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
    >
      <ArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
        :show-actions="true"
        @edit="handleEdit"
        @delete="handleDelete"
        @publish="handlePublish"
        @unpublish="handleUnpublish"
      />
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Article</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{{ articleToDelete?.title }}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmDelete">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import ArticleCard from '~/components/articles/ArticleCard.vue'
import ArticleCardSkeleton from '~/components/articles/ArticleCardSkeleton.vue'
import { useApi } from '~/composables/useApi'
import { ArticlesService } from '~/lib/api'
import type { Article, GetMyArticlesQuery } from '~/types/articles.types'
import { ArticleStatus } from '~/types/articles.types'
import { useDebounce } from '~/composables/useDebounce'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
})

const api = useApi()
const articlesService = new ArticlesService(api)

const statusFilter = ref('all')
const searchQuery = ref('')
const isLoading = ref(false)
const articles = ref<Article[]>([])
const total = ref(0)
const currentPage = ref(1)
const limit = 12

const showDeleteDialog = ref(false)
const articleToDelete = ref<Article | null>(null)

// Debounce search query
const debouncedSearchQuery = useDebounce(searchQuery, 500)

// Calculate total pages
const totalPages = computed(() => Math.ceil(total.value / limit))

// Calculate visible pages
const visiblePages = computed(() => {
  const pages: number[] = []
  const totalPagesVal = totalPages.value
  const current = currentPage.value

  if (totalPagesVal <= 5) {
    for (let i = 1; i <= totalPagesVal; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    const start = Math.max(2, current - 1)
    const end = Math.min(totalPagesVal - 1, current + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    pages.push(totalPagesVal)
  }

  return [...new Set(pages)].sort((a, b) => a - b)
})

// Build query params
const buildQuery = (page: number): GetMyArticlesQuery => {
  const query: GetMyArticlesQuery = {
    offset: (page - 1) * limit,
    limit,
    sortField: 'createdAt',
    sortOrder: 'desc',
  }

  if (statusFilter.value !== 'all') {
    query.status = statusFilter.value as ArticleStatus
  }

  if (debouncedSearchQuery.value) {
    query.search = debouncedSearchQuery.value
  }

  return query
}

// Fetch articles
const fetchArticles = async (page: number) => {
  try {
    isLoading.value = true
    const query = buildQuery(page)
    const response = await articlesService.getMyArticles(query)
    
    articles.value = response.data
    total.value = response.total
    currentPage.value = page
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    toast.error('Error', {
      description: 'Failed to load articles. Please try again.',
    })
  } finally {
    isLoading.value = false
  }
}

const handleStatusFilter = () => {
  currentPage.value = 1
  fetchArticles(1)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchArticles(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleEdit = (article: Article) => {
  navigateTo(`/articles/${article.id}/edit`)
}

const handleDelete = (article: Article) => {
  articleToDelete.value = article
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!articleToDelete.value) return

  try {
    await articlesService.deleteArticle(articleToDelete.value.id)
    toast.success('Article deleted', {
      description: 'Your article has been deleted successfully.',
    })
    showDeleteDialog.value = false
    articleToDelete.value = null
    fetchArticles(currentPage.value)
  } catch (error) {
    console.error('Failed to delete article:', error)
    toast.error('Error', {
      description: 'Failed to delete article. Please try again.',
    })
  }
}

const handlePublish = async (article: Article) => {
  try {
    await articlesService.publishArticle(article.id)
    toast.success('Article published', {
      description: 'Your article is now live!',
    })
    fetchArticles(currentPage.value)
  } catch (error) {
    console.error('Failed to publish article:', error)
    toast.error('Error', {
      description: 'Failed to publish article. Please try again.',
    })
  }
}

const handleUnpublish = async (article: Article) => {
  try {
    await articlesService.unpublishArticle(article.id)
    toast.success('Article unpublished', {
      description: 'Your article is now a draft.',
    })
    fetchArticles(currentPage.value)
  } catch (error) {
    console.error('Failed to unpublish article:', error)
    toast.error('Error', {
      description: 'Failed to unpublish article. Please try again.',
    })
  }
}

// Watch debounced search query
watch(debouncedSearchQuery, () => {
  currentPage.value = 1
  fetchArticles(1)
})

// Fetch articles on mount
onMounted(() => {
  fetchArticles(1)
})
</script>


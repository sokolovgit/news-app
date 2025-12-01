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
        <Select 
          v-model="articlesStore.filters.status" 
          @update:model-value="handleStatusFilter"
        >
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
            v-model="articlesStore.filters.search"
            placeholder="Search articles..."
            class="pl-9 w-[200px] md:w-[280px] border-border/50 bg-background/50"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="articlesStore.totalPages > 1 && !articlesStore.isLoading && articlesStore.articles.length > 0" class="flex items-center">
        <Pagination
          :total="articlesStore.pagination.total"
          :items-per-page="articlesStore.pagination.limit"
          :page="articlesStore.currentPage"
          @update:page="articlesStore.goToPage"
        >
          <PaginationContent>
            <PaginationPrevious />
            <PaginationItem
              v-for="page in articlesStore.visiblePages"
              :key="page"
              :value="page"
              :is-active="page === articlesStore.currentPage"
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
      v-if="articlesStore.isLoading && articlesStore.articles.length === 0"
      class="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
    >
      <ArticleCardSkeleton v-for="i in 6" :key="i" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!articlesStore.isLoading && articlesStore.articles.length === 0"
      class="text-center py-16 px-4"
    >
      <div
        class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/30 flex items-center justify-center"
      >
        <Icon name="lucide:file-text" class="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 class="text-xl font-semibold text-foreground mb-2">No articles yet</h3>
      <p class="text-muted-foreground mb-8 max-w-md mx-auto">
        {{ articlesStore.filters.search
          ? 'No articles match your search. Try different keywords.'
          : articlesStore.filters.status !== 'all'
            ? `You don't have any ${articlesStore.filters.status} articles yet.`
            : 'Start creating your first article to share your news with the world.'
        }}
      </p>
      <Button v-if="!articlesStore.filters.search" class="gap-2" @click="navigateTo('/articles/create')">
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
        v-for="article in articlesStore.articles"
        :key="article.id"
        :article="article"
        :show-actions="true"
        @edit="handleEdit"
        @delete="articlesStore.openDeleteDialog"
        @publish="handlePublish"
        @unpublish="handleUnpublish"
      />
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="articlesStore.showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Article</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{{ articlesStore.articleToDelete?.title }}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="articlesStore.closeDeleteDialog">
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
import { useArticlesStore } from '~/stores/articles.store'
import type { Article } from '~/types/articles.types'
import { useDebounce } from '~/composables/useDebounce'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
})

const articlesStore = useArticlesStore()

// Debounce search query
const debouncedSearch = useDebounce(toRef(articlesStore.filters, 'search'), 500)

const handleStatusFilter = async () => {
  await articlesStore.applyFilters()
}

const handleSearch = async () => {
  await articlesStore.applyFilters()
}

// Watch debounced search query
watch(debouncedSearch, async () => {
  await articlesStore.applyFilters()
})

const handleEdit = (article: Article) => {
  navigateTo(`/articles/${article.id}/edit`)
}

const confirmDelete = async () => {
  try {
    await articlesStore.confirmDelete()
    toast.success('Article deleted', {
      description: 'Your article has been deleted successfully.',
    })
  } catch (error) {
    console.error('Failed to delete article:', error)
    toast.error('Error', {
      description: 'Failed to delete article. Please try again.',
    })
  }
}

const handlePublish = async (article: Article) => {
  try {
    await articlesStore.publishArticle(article)
    toast.success('Article published', {
      description: 'Your article is now live!',
    })
  } catch (error) {
    console.error('Failed to publish article:', error)
    toast.error('Error', {
      description: 'Failed to publish article. Please try again.',
    })
  }
}

const handleUnpublish = async (article: Article) => {
  try {
    await articlesStore.unpublishArticle(article)
    toast.success('Article unpublished', {
      description: 'Your article is now a draft.',
    })
  } catch (error) {
    console.error('Failed to unpublish article:', error)
    toast.error('Error', {
      description: 'Failed to unpublish article. Please try again.',
    })
  }
}

// Fetch articles on mount
onMounted(async () => {
  try {
    await articlesStore.fetchArticles(1)
  } catch (error) {
    toast.error('Error', {
      description: 'Failed to load articles. Please try again.',
    })
  }
})
</script>

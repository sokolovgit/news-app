<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div
      class="flex flex-wrap items-center justify-between gap-4 p-4 bg-card rounded-xl border border-border shadow-sm"
    >
      <div class="flex flex-wrap items-center gap-3">
        <!-- Status Filter (only for my articles) -->
        <Select 
          v-if="isMyArticles"
          v-model="articlesStore.filters.status" 
          @update:model-value="handleStatusFilter"
        >
          <SelectTrigger class="w-[140px] border-border bg-background">
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
            v-if="isMyArticles"
            v-model="articlesStore.filters.search"
            placeholder="Search articles..."
            class="pl-9 w-[200px] md:w-[280px] border-border bg-background"
            @keyup.enter="handleSearch"
          />
          <Input
            v-else
            v-model="articlesStore.publicFilters.search"
            placeholder="Search articles..."
            class="pl-9 w-[200px] md:w-[280px] border-border bg-background"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="articlesStore.currentTotalPages > 1 && !articlesStore.currentIsLoading && articlesStore.currentArticles.length > 0" class="flex items-center">
        <Pagination
          :total="articlesStore.currentPagination.total"
          :items-per-page="articlesStore.currentPagination.limit"
          :page="articlesStore.currentPageNumber"
          @update:page="articlesStore.goToPage"
        >
          <PaginationContent>
            <PaginationPrevious />
            <PaginationItem
              v-for="page in articlesStore.currentVisiblePages"
              :key="page"
              :value="page"
              :is-active="page === articlesStore.currentPageNumber"
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
      v-if="articlesStore.currentIsLoading && articlesStore.currentArticles.length === 0"
      class="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
    >
      <ArticleCardSkeleton v-for="i in 6" :key="i" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!articlesStore.currentIsLoading && articlesStore.currentArticles.length === 0"
      class="text-center py-16 px-4"
    >
      <div
        class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/30 flex items-center justify-center"
      >
        <Icon name="lucide:file-text" class="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 class="text-xl font-semibold text-foreground mb-2">No articles yet</h3>
      <p class="text-muted-foreground mb-8 max-w-md mx-auto">
        <template v-if="isMyArticles">
          {{ articlesStore.filters.search
            ? 'No articles match your search. Try different keywords.'
            : articlesStore.filters.status !== 'all'
              ? `You don't have any ${articlesStore.filters.status} articles yet.`
              : 'Start creating your first article to share your news with the world.'
          }}
        </template>
        <template v-else>
          {{ articlesStore.publicFilters.search
            ? 'No articles match your search. Try different keywords.'
            : 'No public articles available yet.'
          }}
        </template>
      </p>
      <Button v-if="isMyArticles && !articlesStore.filters.search" class="gap-2" @click="navigateTo('/articles/create')">
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
        v-for="article in articlesStore.currentArticles"
        :key="article.id"
        :article="article"
        :show-actions="isMyArticles"
        @edit="handleEdit"
        @delete="articlesStore.openDeleteDialog"
        @publish="handlePublish"
        @unpublish="handleUnpublish"
        @share="handleShare"
      />
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

interface Props {
  isMyArticles: boolean
}

const props = defineProps<Props>()

const articlesStore = useArticlesStore()

// Debounce search query
const debouncedMySearch = useDebounce(toRef(articlesStore.filters, 'search'), 500)
const debouncedPublicSearch = useDebounce(toRef(articlesStore.publicFilters, 'search'), 500)

const handleStatusFilter = async () => {
  await articlesStore.applyFilters()
}

const handleSearch = async () => {
  await articlesStore.applyFilters()
}

// Watch debounced search queries
watch(debouncedMySearch, async () => {
  if (props.isMyArticles) {
    await articlesStore.applyFilters()
  }
})

watch(debouncedPublicSearch, async () => {
  if (!props.isMyArticles) {
    await articlesStore.applyFilters()
  }
})

const handleEdit = (article: Article) => {
  navigateTo(`/articles/${article.id}/edit`)
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
</script>


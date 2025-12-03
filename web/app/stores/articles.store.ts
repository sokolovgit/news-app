/**
 * Articles Store
 * Manages articles state with server-side filtering
 */

import { ArticlesService } from '~/lib/api/articles.service'
import type { Article, GetMyArticlesQuery, GetPublicArticlesQuery, ArticleStatus } from '~/types/articles.types'

export interface ArticlesFilters {
  search: string
  status: ArticleStatus | 'all'
}

export interface ArticlesPagination {
  offset: number
  limit: number
  total: number
  hasMore: boolean
}

export type ArticleTab = 'my' | 'public'

export const useArticlesStore = defineStore('articles', () => {
  // State
  const articles = ref<Article[]>([])
  const publicArticles = ref<Article[]>([])
  const isLoading = ref(false)
  const isLoadingPublic = ref(false)
  const error = ref<string | null>(null)
  const activeTab = ref<ArticleTab>('my')
  const filters = ref<ArticlesFilters>({
    search: '',
    status: 'all',
  })
  const publicFilters = ref<Omit<ArticlesFilters, 'status'>>({
    search: '',
  })
  const pagination = ref<ArticlesPagination>({
    offset: 0,
    limit: 12,
    total: 0,
    hasMore: false,
  })
  const publicPagination = ref<ArticlesPagination>({
    offset: 0,
    limit: 12,
    total: 0,
    hasMore: false,
  })
  const currentPage = ref(1)
  const currentPublicPage = ref(1)

  // Delete dialog state
  const showDeleteDialog = ref(false)
  const articleToDelete = ref<Article | null>(null)

  // Get service instance
  const articlesService = computed(() => {
    const api = useApi()
    return new ArticlesService(api)
  })

  // Computed
  const totalPages = computed(() => {
    if (pagination.value.total === 0) return 0
    return Math.ceil(pagination.value.total / pagination.value.limit)
  })

  const totalPublicPages = computed(() => {
    if (publicPagination.value.total === 0) return 0
    return Math.ceil(publicPagination.value.total / publicPagination.value.limit)
  })

  const visiblePages = computed(() => {
    const pages: number[] = []
    const total = totalPages.value
    const current = currentPage.value

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      pages.push(total)
    }

    return [...new Set(pages)].sort((a, b) => a - b)
  })

  const visiblePublicPages = computed(() => {
    const pages: number[] = []
    const total = totalPublicPages.value
    const current = currentPublicPage.value

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      pages.push(total)
    }

    return [...new Set(pages)].sort((a, b) => a - b)
  })

  const currentArticles = computed(() => {
    return activeTab.value === 'my' ? articles.value : publicArticles.value
  })

  const currentIsLoading = computed(() => {
    return activeTab.value === 'my' ? isLoading.value : isLoadingPublic.value
  })

  const currentPagination = computed(() => {
    return activeTab.value === 'my' ? pagination.value : publicPagination.value
  })

  const currentTotalPages = computed(() => {
    return activeTab.value === 'my' ? totalPages.value : totalPublicPages.value
  })

  const currentVisiblePages = computed(() => {
    return activeTab.value === 'my' ? visiblePages.value : visiblePublicPages.value
  })

  const currentPageNumber = computed(() => {
    return activeTab.value === 'my' ? currentPage.value : currentPublicPage.value
  })

  // Actions
  function buildQuery(page: number): GetMyArticlesQuery {
    const query: GetMyArticlesQuery = {
      offset: (page - 1) * pagination.value.limit,
      limit: pagination.value.limit,
      sortField: 'createdAt',
      sortOrder: 'desc',
    }

    if (filters.value.status !== 'all') {
      query.status = filters.value.status
    }

    if (filters.value.search) {
      query.search = filters.value.search
    }

    return query
  }

  function buildPublicQuery(page: number): GetPublicArticlesQuery {
    const query: GetPublicArticlesQuery = {
      offset: (page - 1) * publicPagination.value.limit,
      limit: publicPagination.value.limit,
      sortField: 'publishedAt',
      sortOrder: 'desc',
    }

    if (publicFilters.value.search) {
      query.search = publicFilters.value.search
    }

    return query
  }

  async function fetchArticles(page: number = 1) {
    isLoading.value = true
    error.value = null

    try {
      const query = buildQuery(page)
      const response = await articlesService.value.getMyArticles(query)

      articles.value = response.data
      pagination.value = {
        offset: response.offset,
        limit: response.limit,
        total: response.total,
        hasMore: response.hasMore,
      }
      currentPage.value = page
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch articles'
      console.error('Failed to fetch articles:', err)
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPublicArticles(page: number = 1) {
    isLoadingPublic.value = true
    error.value = null

    try {
      const query = buildPublicQuery(page)
      const response = await articlesService.value.getPublicArticles(query)

      publicArticles.value = response.data
      publicPagination.value = {
        offset: response.offset,
        limit: response.limit,
        total: response.total,
        hasMore: response.hasMore,
      }
      currentPublicPage.value = page
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch public articles'
      console.error('Failed to fetch public articles:', err)
      error.value = errorMessage
      throw err
    } finally {
      isLoadingPublic.value = false
    }
  }

  function setFilters(newFilters: Partial<ArticlesFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function setPublicFilters(newFilters: Partial<Omit<ArticlesFilters, 'status'>>) {
    publicFilters.value = { ...publicFilters.value, ...newFilters }
  }

  function setActiveTab(tab: ArticleTab) {
    activeTab.value = tab
  }

  async function applyFilters() {
    if (activeTab.value === 'my') {
      currentPage.value = 1
      await fetchArticles(1)
    } else {
      currentPublicPage.value = 1
      await fetchPublicArticles(1)
    }
  }

  async function goToPage(page: number) {
    if (activeTab.value === 'my') {
      if (page >= 1 && page <= totalPages.value) {
        await fetchArticles(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else {
      if (page >= 1 && page <= totalPublicPages.value) {
        await fetchPublicArticles(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  // Article actions
  async function deleteArticle(article: Article) {
    try {
      await articlesService.value.deleteArticle(article.id)
      // Refetch current page
      await fetchArticles(currentPage.value)
      return true
    } catch (err) {
      console.error('Failed to delete article:', err)
      throw err
    }
  }

  async function publishArticle(article: Article) {
    try {
      await articlesService.value.publishArticle(article.id)
      // Refetch current page
      await fetchArticles(currentPage.value)
      return true
    } catch (err) {
      console.error('Failed to publish article:', err)
      throw err
    }
  }

  async function unpublishArticle(article: Article) {
    try {
      await articlesService.value.unpublishArticle(article.id)
      // Refetch current page
      await fetchArticles(currentPage.value)
      return true
    } catch (err) {
      console.error('Failed to unpublish article:', err)
      throw err
    }
  }

  // Delete dialog helpers
  function openDeleteDialog(article: Article) {
    articleToDelete.value = article
    showDeleteDialog.value = true
  }

  function closeDeleteDialog() {
    showDeleteDialog.value = false
    articleToDelete.value = null
  }

  async function confirmDelete() {
    if (!articleToDelete.value) return false

    await deleteArticle(articleToDelete.value)
    closeDeleteDialog()
    return true
  }

  // Reset
  function reset() {
    articles.value = []
    publicArticles.value = []
    isLoading.value = false
    isLoadingPublic.value = false
    error.value = null
    activeTab.value = 'my'
    filters.value = { search: '', status: 'all' }
    publicFilters.value = { search: '' }
    pagination.value = { offset: 0, limit: 12, total: 0, hasMore: false }
    publicPagination.value = { offset: 0, limit: 12, total: 0, hasMore: false }
    currentPage.value = 1
    currentPublicPage.value = 1
    showDeleteDialog.value = false
    articleToDelete.value = null
  }

  return {
    // State
    articles: readonly(articles),
    publicArticles: readonly(publicArticles),
    isLoading: readonly(isLoading),
    isLoadingPublic: readonly(isLoadingPublic),
    error: readonly(error),
    activeTab,
    filters,
    publicFilters,
    pagination: readonly(pagination),
    publicPagination: readonly(publicPagination),
    currentPage: readonly(currentPage),
    currentPublicPage: readonly(currentPublicPage),

    // Delete dialog
    showDeleteDialog,
    articleToDelete: readonly(articleToDelete),

    // Computed
    totalPages,
    totalPublicPages,
    visiblePages,
    visiblePublicPages,
    currentArticles,
    currentIsLoading,
    currentPagination,
    currentTotalPages,
    currentVisiblePages,
    currentPageNumber,

    // Actions
    fetchArticles,
    fetchPublicArticles,
    setFilters,
    setPublicFilters,
    setActiveTab,
    applyFilters,
    goToPage,

    // Article actions
    deleteArticle,
    publishArticle,
    unpublishArticle,

    // Delete dialog helpers
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,

    // Reset
    reset,
  }
})


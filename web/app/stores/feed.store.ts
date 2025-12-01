/**
 * Feed Store
 * Manages feed/posts state with server-side filtering
 */

import { FeedService } from '~/lib/api/feed.service'
import { SourcesService } from '~/lib/api/sources.service'
import type { FeedPost, SourceDto, GetFeedQuery } from '~/types/posts.types'

export interface FeedFilters {
  search: string
  sortBy: 'newest' | 'oldest' | 'source'
  sourceId: string | 'all'
}

export interface FeedPagination {
  offset: number
  limit: number
  total: number
  hasMore: boolean
}

export const useFeedStore = defineStore('feed', () => {
  // State
  const posts = ref<FeedPost[]>([])
  const isLoading = ref(false)
  const isRefreshing = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<FeedFilters>({
    search: '',
    sortBy: 'newest',
    sourceId: 'all',
  })
  const pagination = ref<FeedPagination>({
    offset: 0,
    limit: 20,
    total: 0,
    hasMore: false,
  })
  const currentPage = ref(1)

  // User sources for filtering
  const userSources = ref<SourceDto[]>([])
  const userSourcesLoading = ref(false)

  // Selection mode
  const isSelectionMode = ref(false)
  const selectedPostIds = ref<Set<string>>(new Set())

  // Get services
  const feedService = computed(() => {
    const api = useApi()
    return new FeedService(api)
  })

  const sourcesService = computed(() => {
    const api = useApi()
    return new SourcesService(api)
  })

  // Computed
  const totalPages = computed(() => {
    if (pagination.value.total === 0) return 0
    return Math.ceil(pagination.value.total / pagination.value.limit)
  })

  const visiblePages = computed(() => {
    const pages: number[] = []
    const total = totalPages.value
    const current = currentPage.value

    if (total <= 7) {
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

  // Actions
  function buildQuery(page: number): GetFeedQuery {
    const query: GetFeedQuery = {
      offset: (page - 1) * pagination.value.limit,
      limit: pagination.value.limit,
    }

    if (filters.value.sortBy === 'newest') {
      query.sortField = 'createdAt'
      query.sortOrder = 'desc'
    } else if (filters.value.sortBy === 'oldest') {
      query.sortField = 'createdAt'
      query.sortOrder = 'asc'
    }

    if (filters.value.search) {
      query.search = filters.value.search
    }

    // Server-side source filtering
    if (filters.value.sourceId !== 'all') {
      query.sourceIds = [filters.value.sourceId]
    }

    return query
  }

  async function fetchPosts(page: number = 1) {
    isLoading.value = true
    error.value = null

    try {
      const query = buildQuery(page)
      const response = await feedService.value.getFeed(query)

      posts.value = response.data
      pagination.value = {
        offset: response.offset,
        limit: response.limit,
        total: response.total,
        hasMore: response.hasMore,
      }
      currentPage.value = page

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts'
      console.error('Failed to fetch feed:', err)
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function refreshPosts() {
    isRefreshing.value = true
    try {
      currentPage.value = 1
      await fetchPosts(1)
    } finally {
      isRefreshing.value = false
    }
  }

  async function fetchUserSources() {
    userSourcesLoading.value = true
    try {
      const response = await sourcesService.value.getUserSources({ limit: 100 })
      userSources.value = response.data.map((item) => ({
        id: item.source.id,
        name: item.source.name,
        url: item.source.url,
        type: item.source.source,
      }))
    } catch (err) {
      console.error('Failed to fetch user sources for filter:', err)
      // Don't throw - this is not critical
    } finally {
      userSourcesLoading.value = false
    }
  }

  function setFilters(newFilters: Partial<FeedFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  async function applyFilters() {
    currentPage.value = 1
    await fetchPosts(1)
  }

  async function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      await fetchPosts(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Selection actions
  function toggleSelectionMode() {
    isSelectionMode.value = !isSelectionMode.value
    if (!isSelectionMode.value) {
      selectedPostIds.value.clear()
    }
  }

  function togglePostSelection(postId: string) {
    if (selectedPostIds.value.has(postId)) {
      selectedPostIds.value.delete(postId)
    } else {
      selectedPostIds.value.add(postId)
    }
    // Trigger reactivity
    selectedPostIds.value = new Set(selectedPostIds.value)
  }

  function clearSelection() {
    selectedPostIds.value.clear()
    selectedPostIds.value = new Set()
  }

  function getSelectedPosts(): FeedPost[] {
    return posts.value.filter((post) => selectedPostIds.value.has(post.id))
  }

  // Reset
  function reset() {
    posts.value = []
    isLoading.value = false
    isRefreshing.value = false
    error.value = null
    filters.value = { search: '', sortBy: 'newest', sourceId: 'all' }
    pagination.value = { offset: 0, limit: 20, total: 0, hasMore: false }
    currentPage.value = 1
    userSources.value = []
    isSelectionMode.value = false
    selectedPostIds.value.clear()
  }

  return {
    // State
    posts: readonly(posts),
    isLoading: readonly(isLoading),
    isRefreshing: readonly(isRefreshing),
    error: readonly(error),
    filters,
    pagination: readonly(pagination),
    currentPage: readonly(currentPage),

    // User sources
    userSources: readonly(userSources),
    userSourcesLoading: readonly(userSourcesLoading),

    // Selection
    isSelectionMode,
    selectedPostIds: readonly(selectedPostIds),

    // Computed
    totalPages,
    visiblePages,

    // Actions
    fetchPosts,
    refreshPosts,
    fetchUserSources,
    setFilters,
    applyFilters,
    goToPage,

    // Selection actions
    toggleSelectionMode,
    togglePostSelection,
    clearSelection,
    getSelectedPosts,

    // Reset
    reset,
  }
})


/**
 * Sources Store
 * Manages sources state with server-side filtering
 */

import {
  SourcesService,
  type SourceType,
  type UserSourceResponse,
  type SourceWithSubscriptionStatusResponse,
} from '~/lib/api/sources.service'

export interface Source {
  id: string
  name: string
  url: string
  source: SourceType
  lastFetchedAt?: string | Date
  isSubscribed?: boolean
}

export interface SourcesFilters {
  search: string
  sourceType: SourceType | 'all'
}

export interface SourcesPagination {
  offset: number
  limit: number
  total: number
  hasMore: boolean
}

export const useSourcesStore = defineStore('sources', () => {
  // State - My Sources
  const mySources = ref<Source[]>([])
  const mySourcesLoading = ref(false)
  const mySourcesError = ref<string | null>(null)
  const mySourcesFilters = ref<SourcesFilters>({
    search: '',
    sourceType: 'all',
  })
  const mySourcesPagination = ref<SourcesPagination>({
    offset: 0,
    limit: 20,
    total: 0,
    hasMore: false,
  })
  const mySourcesCurrentPage = ref(1)

  // State - All Sources
  const allSources = ref<Source[]>([])
  const allSourcesLoading = ref(false)
  const allSourcesError = ref<string | null>(null)
  const allSourcesFilters = ref<SourcesFilters & { subscription: 'all' | 'subscribed' | 'not-subscribed' }>({
    search: '',
    sourceType: 'all',
    subscription: 'all',
  })
  const allSourcesPagination = ref<SourcesPagination>({
    offset: 0,
    limit: 20,
    total: 0,
    hasMore: false,
  })
  const allSourcesCurrentPage = ref(1)

  // State - User Source Types
  const userSourceTypes = ref<SourceType[]>([])
  const userSourceTypesLoading = ref(false)

  // State - Follow actions
  const followingSourceIds = ref<Set<string>>(new Set())

  // Get service instance
  const sourcesService = computed(() => {
    const api = useApi()
    return new SourcesService(api)
  })

  // Computed - My Sources
  const mySourcesTotalPages = computed(() => {
    if (mySourcesPagination.value.total === 0) return 0
    return Math.ceil(mySourcesPagination.value.total / mySourcesPagination.value.limit)
  })

  const mySourcesVisiblePages = computed(() => {
    const pages: number[] = []
    const total = mySourcesTotalPages.value
    const current = mySourcesCurrentPage.value

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

  // Computed - All Sources
  const allSourcesTotalPages = computed(() => {
    if (allSourcesPagination.value.total === 0) return 0
    return Math.ceil(allSourcesPagination.value.total / allSourcesPagination.value.limit)
  })

  const allSourcesVisiblePages = computed(() => {
    const pages: number[] = []
    const total = allSourcesTotalPages.value
    const current = allSourcesCurrentPage.value

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

  // Computed - Filtered All Sources (client-side subscription filter)
  const filteredAllSources = computed(() => {
    let filtered = allSources.value

    if (allSourcesFilters.value.subscription === 'subscribed') {
      filtered = filtered.filter((source) => source.isSubscribed === true)
    } else if (allSourcesFilters.value.subscription === 'not-subscribed') {
      filtered = filtered.filter((source) => source.isSubscribed === false)
    }

    return filtered
  })

  // Actions - My Sources
  async function fetchMySources(page: number = 1) {
    mySourcesLoading.value = true
    mySourcesError.value = null

    try {
      const offset = (page - 1) * mySourcesPagination.value.limit

      const response = await sourcesService.value.getUserSources({
        offset,
        limit: mySourcesPagination.value.limit,
        search: mySourcesFilters.value.search || undefined,
        sourceType: mySourcesFilters.value.sourceType !== 'all' 
          ? mySourcesFilters.value.sourceType 
          : undefined,
      })

      mySources.value = response.data.map((userSource: UserSourceResponse) => ({
        id: userSource.source.id,
        name: userSource.source.name,
        url: userSource.source.url,
        source: userSource.source.source,
        lastFetchedAt: userSource.source.updatedAt,
        isSubscribed: true,
      }))

      mySourcesPagination.value = {
        offset: response.offset,
        limit: response.limit,
        total: response.total,
        hasMore: response.hasMore,
      }

      mySourcesCurrentPage.value = page
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sources'
      console.error('Failed to fetch my sources:', error)
      mySourcesError.value = errorMessage
      throw error
    } finally {
      mySourcesLoading.value = false
    }
  }

  function setMySourcesFilters(filters: Partial<SourcesFilters>) {
    mySourcesFilters.value = { ...mySourcesFilters.value, ...filters }
  }

  async function applyMySourcesFilters() {
    mySourcesCurrentPage.value = 1
    await fetchMySources(1)
  }

  async function goToMySourcesPage(page: number) {
    if (page >= 1 && page <= mySourcesTotalPages.value) {
      await fetchMySources(page)
    }
  }

  // Actions - All Sources
  async function fetchAllSources(page: number = 1) {
    allSourcesLoading.value = true
    allSourcesError.value = null

    try {
      const offset = (page - 1) * allSourcesPagination.value.limit

      const response = await sourcesService.value.getAllSources({
        offset,
        limit: allSourcesPagination.value.limit,
        search: allSourcesFilters.value.search || undefined,
        sourceType: allSourcesFilters.value.sourceType !== 'all' 
          ? allSourcesFilters.value.sourceType 
          : undefined,
      })

      allSources.value = response.data.map((item: SourceWithSubscriptionStatusResponse) => ({
        id: item.source.id,
        name: item.source.name,
        url: item.source.url,
        source: item.source.source,
        lastFetchedAt: item.source.updatedAt,
        isSubscribed: item.isSubscribed,
      }))

      allSourcesPagination.value = {
        offset: response.offset,
        limit: response.limit,
        total: response.total,
        hasMore: response.hasMore,
      }

      allSourcesCurrentPage.value = page
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sources'
      console.error('Failed to fetch all sources:', error)
      allSourcesError.value = errorMessage
      throw error
    } finally {
      allSourcesLoading.value = false
    }
  }

  function setAllSourcesFilters(filters: Partial<typeof allSourcesFilters.value>) {
    allSourcesFilters.value = { ...allSourcesFilters.value, ...filters }
  }

  async function applyAllSourcesFilters() {
    allSourcesCurrentPage.value = 1
    await fetchAllSources(1)
  }

  async function goToAllSourcesPage(page: number) {
    if (page >= 1 && page <= allSourcesTotalPages.value) {
      await fetchAllSources(page)
    }
  }

  // Actions - User Source Types
  async function fetchUserSourceTypes() {
    userSourceTypesLoading.value = true

    try {
      userSourceTypes.value = await sourcesService.value.getUserSourceTypes()
    } catch (error) {
      console.error('Failed to fetch user source types:', error)
      // Don't throw - this is not critical
    } finally {
      userSourceTypesLoading.value = false
    }
  }

  // Actions - Follow/Unfollow
  async function followSource(source: Source) {
    if (followingSourceIds.value.has(source.id)) {
      return
    }

    followingSourceIds.value.add(source.id)

    try {
      await sourcesService.value.addSource(source.url)

      // Update the source's subscription status in all sources
      const sourceIndex = allSources.value.findIndex((s) => s.id === source.id)
      if (sourceIndex !== -1) {
        allSources.value[sourceIndex].isSubscribed = true
      }

      // Reload my sources to include the newly followed source
      await fetchMySources(mySourcesCurrentPage.value)

      // Reload user source types
      await fetchUserSourceTypes()

      return true
    } catch (error) {
      followingSourceIds.value.delete(source.id)
      throw error
    }
  }

  // Reset
  function resetMySources() {
    mySources.value = []
    mySourcesLoading.value = false
    mySourcesError.value = null
    mySourcesFilters.value = { search: '', sourceType: 'all' }
    mySourcesPagination.value = { offset: 0, limit: 20, total: 0, hasMore: false }
    mySourcesCurrentPage.value = 1
  }

  function resetAllSources() {
    allSources.value = []
    allSourcesLoading.value = false
    allSourcesError.value = null
    allSourcesFilters.value = { search: '', sourceType: 'all', subscription: 'all' }
    allSourcesPagination.value = { offset: 0, limit: 20, total: 0, hasMore: false }
    allSourcesCurrentPage.value = 1
  }

  function resetAll() {
    resetMySources()
    resetAllSources()
    userSourceTypes.value = []
    followingSourceIds.value.clear()
  }

  return {
    // My Sources State
    mySources: readonly(mySources),
    mySourcesLoading: readonly(mySourcesLoading),
    mySourcesError: readonly(mySourcesError),
    mySourcesFilters,
    mySourcesPagination: readonly(mySourcesPagination),
    mySourcesCurrentPage: readonly(mySourcesCurrentPage),

    // My Sources Computed
    mySourcesTotalPages,
    mySourcesVisiblePages,

    // My Sources Actions
    fetchMySources,
    setMySourcesFilters,
    applyMySourcesFilters,
    goToMySourcesPage,

    // All Sources State
    allSources: readonly(allSources),
    allSourcesLoading: readonly(allSourcesLoading),
    allSourcesError: readonly(allSourcesError),
    allSourcesFilters,
    allSourcesPagination: readonly(allSourcesPagination),
    allSourcesCurrentPage: readonly(allSourcesCurrentPage),

    // All Sources Computed
    allSourcesTotalPages,
    allSourcesVisiblePages,
    filteredAllSources,

    // All Sources Actions
    fetchAllSources,
    setAllSourcesFilters,
    applyAllSourcesFilters,
    goToAllSourcesPage,

    // User Source Types
    userSourceTypes: readonly(userSourceTypes),
    userSourceTypesLoading: readonly(userSourceTypesLoading),
    fetchUserSourceTypes,

    // Follow Actions
    followingSourceIds: readonly(followingSourceIds),
    followSource,

    // Reset
    resetMySources,
    resetAllSources,
    resetAll,
  }
})


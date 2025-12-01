<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Sources</h1>
        <p class="text-muted-foreground mt-1">Manage your news sources</p>
      </div>
      <Button @click="navigateTo('/sources/add')">
        <Icon name="lucide:plus-circle" class="mr-2 h-4 w-4" />
        Add Source
      </Button>
    </div>

    <!-- Tabs -->
    <Tabs v-model="activeTab" class="w-full">
      <TabsList>
        <TabsTrigger value="my-sources">My Sources</TabsTrigger>
        <TabsTrigger value="all-sources">All Sources</TabsTrigger>
      </TabsList>

      <!-- My Sources Tab -->
      <TabsContent value="my-sources" class="space-y-6 mt-6">
        <!-- Search and Filters -->
        <div class="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
          <div class="relative flex-1 min-w-[200px]">
            <Icon
              name="lucide:search"
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              v-model="sourcesStore.mySourcesFilters.search"
              placeholder="Search sources..."
              class="pl-9"
              @keyup.enter="handleMySourcesSearch"
            />
          </div>
          <Select 
            v-model="sourcesStore.mySourcesFilters.sourceType" 
            @update:model-value="handleMySourcesTypeFilter"
          >
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">Twitter/X</SelectItem>
              <SelectItem value="rss">RSS</SelectItem>
            </SelectContent>
          </Select>
          <div class="h-6 w-px bg-border shrink-0" />
          <Button variant="outline" size="sm" @click="toggleView">
            <Icon :name="viewIcon" class="h-4 w-4 mr-2" />
            {{ viewMode === 'grid' ? 'List' : 'Grid' }}
          </Button>
          <!-- Pagination in Filters Block -->
          <div
            v-if="sourcesStore.mySourcesTotalPages > 1 && !sourcesStore.mySourcesLoading && sourcesStore.mySources.length > 0"
            class="flex items-center ml-auto gap-4"
          >
            <div class="h-6 w-px bg-border shrink-0" />
            <Pagination
              :total="sourcesStore.mySourcesPagination.total"
              :items-per-page="sourcesStore.mySourcesPagination.limit"
              :page="sourcesStore.mySourcesCurrentPage"
              @update:page="sourcesStore.goToMySourcesPage"
            >
              <PaginationContent>
                <PaginationPrevious />
                <PaginationItem
                  v-for="page in sourcesStore.mySourcesVisiblePages"
                  :key="page"
                  :value="page"
                  :is-active="page === sourcesStore.mySourcesCurrentPage"
                >
                  {{ page }}
                </PaginationItem>
                <PaginationNext />
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="sourcesStore.mySourcesLoading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SourceCardSkeleton v-for="i in 6" :key="i" />
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!sourcesStore.mySourcesLoading && sourcesStore.mySources.length === 0"
          class="text-center py-12"
        >
          <Icon name="lucide:book-open" class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-foreground mb-2">
            {{ sourcesStore.mySourcesFilters.search || sourcesStore.mySourcesFilters.sourceType !== 'all' ? 'No sources found' : 'No sources yet' }}
          </h3>
          <p class="text-muted-foreground mb-6">
            {{
              sourcesStore.mySourcesFilters.search || sourcesStore.mySourcesFilters.sourceType !== 'all'
                ? 'Try adjusting your filters.'
                : 'Add your first source to get started.'
            }}
          </p>
          <Button
            v-if="!sourcesStore.mySourcesFilters.search && sourcesStore.mySourcesFilters.sourceType === 'all'"
            @click="navigateTo('/sources/add')"
          >
            <Icon name="lucide:plus-circle" class="mr-2 h-4 w-4" />
            Add Your First Source
          </Button>
        </div>

        <!-- Sources Grid/List -->
        <div
          v-else
          :class="viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'"
        >
          <SourceCard
            v-for="source in sourcesStore.mySources"
            :key="source.id"
            :source="source"
            :is-subscribed="true"
            :show-follow-button="false"
            :show-actions="true"
            :show-report-button="true"
            @refresh="handleRefresh(source)"
            @view="handleView(source)"
          />
        </div>

        <!-- Pagination -->
        <div v-if="sourcesStore.mySourcesTotalPages > 1 && !sourcesStore.mySourcesLoading" class="flex justify-center">
          <Pagination
            :total="sourcesStore.mySourcesPagination.total"
            :items-per-page="sourcesStore.mySourcesPagination.limit"
            :page="sourcesStore.mySourcesCurrentPage"
            @update:page="sourcesStore.goToMySourcesPage"
          >
            <PaginationContent>
              <PaginationPrevious />
              <PaginationItem
                v-for="page in sourcesStore.mySourcesVisiblePages"
                :key="page"
                :value="page"
                :is-active="page === sourcesStore.mySourcesCurrentPage"
              >
                {{ page }}
              </PaginationItem>
              <PaginationNext />
            </PaginationContent>
          </Pagination>
        </div>
      </TabsContent>

      <!-- All Sources Tab -->
      <TabsContent value="all-sources" class="space-y-6 mt-6">
        <!-- Search and Filters -->
        <div class="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
          <div class="relative flex-1 min-w-[200px]">
            <Icon
              name="lucide:search"
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              v-model="sourcesStore.allSourcesFilters.search"
              placeholder="Search sources..."
              class="pl-9"
              @keyup.enter="handleAllSourcesSearch"
            />
          </div>
          <Select 
            v-model="sourcesStore.allSourcesFilters.sourceType" 
            @update:model-value="handleAllSourcesTypeFilter"
          >
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">Twitter/X</SelectItem>
              <SelectItem value="rss">RSS</SelectItem>
            </SelectContent>
          </Select>
          <Select
            v-model="sourcesStore.allSourcesFilters.subscription"
          >
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="subscribed">Subscribed</SelectItem>
              <SelectItem value="not-subscribed">Not Subscribed</SelectItem>
            </SelectContent>
          </Select>
          <div class="h-6 w-px bg-border shrink-0" />
          <Button variant="outline" size="sm" @click="toggleView">
            <Icon :name="viewIcon" class="h-4 w-4 mr-2" />
            {{ viewMode === 'grid' ? 'List' : 'Grid' }}
          </Button>
          <!-- Pagination in Filters Block -->
          <div
            v-if="sourcesStore.allSourcesTotalPages > 1 && !sourcesStore.allSourcesLoading && sourcesStore.allSources.length > 0"
            class="flex items-center ml-auto gap-4"
          >
            <div class="h-6 w-px bg-border shrink-0" />
            <Pagination
              :total="sourcesStore.allSourcesPagination.total"
              :items-per-page="sourcesStore.allSourcesPagination.limit"
              :page="sourcesStore.allSourcesCurrentPage"
              @update:page="sourcesStore.goToAllSourcesPage"
            >
              <PaginationContent>
                <PaginationPrevious />
                <PaginationItem
                  v-for="page in sourcesStore.allSourcesVisiblePages"
                  :key="page"
                  :value="page"
                  :is-active="page === sourcesStore.allSourcesCurrentPage"
                >
                  {{ page }}
                </PaginationItem>
                <PaginationNext />
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="sourcesStore.allSourcesLoading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SourceCardSkeleton v-for="i in 6" :key="i" />
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!sourcesStore.allSourcesLoading && sourcesStore.filteredAllSources.length === 0"
          class="text-center py-12"
        >
          <Icon name="lucide:book-open" class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-foreground mb-2">
            {{ sourcesStore.allSourcesFilters.search || sourcesStore.allSourcesFilters.sourceType !== 'all' ? 'No sources found' : 'No sources available' }}
          </h3>
          <p class="text-muted-foreground mb-6">
            {{
              sourcesStore.allSourcesFilters.search || sourcesStore.allSourcesFilters.sourceType !== 'all'
                ? 'Try adjusting your filters.'
                : 'There are no public sources available yet.'
            }}
          </p>
        </div>

        <!-- Sources Grid/List -->
        <div
          v-else
          :class="viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'"
        >
          <SourceCard
            v-for="source in sourcesStore.filteredAllSources"
            :key="source.id"
            :source="source"
            :is-subscribed="source.isSubscribed"
            :show-follow-button="true"
            :show-actions="source.isSubscribed"
            :show-report-button="true"
            :is-following="sourcesStore.followingSourceIds.has(source.id)"
            @refresh="handleRefresh(source)"
            @view="handleView(source)"
            @follow="handleFollow(source)"
          />
        </div>

        <!-- Pagination -->
        <div v-if="sourcesStore.allSourcesTotalPages > 1 && !sourcesStore.allSourcesLoading" class="flex justify-center">
          <Pagination
            :total="sourcesStore.allSourcesPagination.total"
            :items-per-page="sourcesStore.allSourcesPagination.limit"
            :page="sourcesStore.allSourcesCurrentPage"
            @update:page="sourcesStore.goToAllSourcesPage"
          >
            <PaginationContent>
              <PaginationPrevious />
              <PaginationItem
                v-for="page in sourcesStore.allSourcesVisiblePages"
                :key="page"
                :value="page"
                :is-active="page === sourcesStore.allSourcesCurrentPage"
              >
                {{ page }}
              </PaginationItem>
              <PaginationNext />
            </PaginationContent>
          </Pagination>
        </div>
      </TabsContent>
    </Tabs>
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SourceCard from '~/components/sources/SourceCard.vue'
import SourceCardSkeleton from '~/components/sources/SourceCardSkeleton.vue'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useSourcesStore, type Source } from '~/stores/sources.store'
import { toast } from 'vue-sonner'
import { useDebounce } from '~/composables/useDebounce'

definePageMeta({
  layout: 'default',
})

const sourcesStore = useSourcesStore()

const activeTab = ref<'my-sources' | 'all-sources'>('my-sources')
const viewMode = ref<'grid' | 'list'>('grid')

// Debounced search
const debouncedMySearch = useDebounce(toRef(sourcesStore.mySourcesFilters, 'search'), 500)
const debouncedAllSearch = useDebounce(toRef(sourcesStore.allSourcesFilters, 'search'), 500)

const viewIcon = computed(() => {
  return viewMode.value === 'grid' ? 'lucide:list' : 'lucide:grid'
})

const toggleView = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const handleMySourcesSearch = async () => {
  await sourcesStore.applyMySourcesFilters()
}

const handleMySourcesTypeFilter = async () => {
  await sourcesStore.applyMySourcesFilters()
}

const handleAllSourcesSearch = async () => {
  await sourcesStore.applyAllSourcesFilters()
}

const handleAllSourcesTypeFilter = async () => {
  await sourcesStore.applyAllSourcesFilters()
}

const handleRefresh = async (source: Source) => {
  // TODO: Implement refresh source
  console.log('Refresh source:', source.id)
}

const handleView = (source: Source) => {
  // TODO: Navigate to source details or filter feed by source
  console.log('View source:', source.id)
}

const handleFollow = async (source: Source) => {
  try {
    await sourcesStore.followSource(source)
    toast.success('Source followed', {
      description: `You are now following ${source.name}`,
      duration: 3000,
    })
  } catch (error) {
    toast.error('Failed to follow source', {
      description: error instanceof Error ? error.message : 'Please try again later.',
      duration: 5000,
    })
  }
}

// Watch for tab changes and load appropriate data
watch(activeTab, async (newTab) => {
  if (newTab === 'my-sources' && sourcesStore.mySources.length === 0) {
    await sourcesStore.fetchMySources(1)
  } else if (newTab === 'all-sources' && sourcesStore.allSources.length === 0) {
    await sourcesStore.fetchAllSources(1)
  }
})

// Watch debounced search queries
watch(debouncedMySearch, async () => {
  await sourcesStore.applyMySourcesFilters()
})

watch(debouncedAllSearch, async () => {
  await sourcesStore.applyAllSourcesFilters()
})

onMounted(async () => {
  await sourcesStore.fetchMySources(1)
})
</script>

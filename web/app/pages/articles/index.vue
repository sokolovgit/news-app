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

    <!-- Tabs -->
    <Tabs v-model="articlesStore.activeTab" class="w-full" @update:model-value="handleTabChange">
      <TabsList class="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="my">
          <Icon name="lucide:user" class="h-4 w-4 mr-2" />
          My Articles
        </TabsTrigger>
        <TabsTrigger value="public">
          <Icon name="lucide:globe" class="h-4 w-4 mr-2" />
          Public Articles
        </TabsTrigger>
      </TabsList>

      <!-- My Articles Tab -->
      <TabsContent value="my" class="mt-6">
        <ArticlesList :is-my-articles="true" />
      </TabsContent>

      <!-- Public Articles Tab -->
      <TabsContent value="public" class="mt-6">
        <ArticlesList :is-my-articles="false" />
      </TabsContent>
    </Tabs>
    
    <!-- Link to public articles page for sharing -->
    <div class="text-center pt-4 border-t border-border">
      <p class="text-sm text-muted-foreground">
        Want to share articles? 
        <NuxtLink to="/articles/public" class="text-primary hover:underline">
          View public articles page
        </NuxtLink>
      </p>
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ArticlesList from '~/components/articles/ArticlesList.vue'
import { useArticlesStore } from '~/stores/articles.store'
import { useAuthStore } from '~/stores/auth.store'
import type { Article } from '~/types/articles.types'
import { toast } from 'vue-sonner'

const route = useRoute()

definePageMeta({
  layout: 'default',
})

const articlesStore = useArticlesStore()
const authStore = useAuthStore()

const handleTabChange = async (tab: 'my' | 'public') => {
  articlesStore.setActiveTab(tab)
  try {
    if (tab === 'my') {
      if (!authStore.isAuthenticated) {
        navigateTo('/articles/public')
        return
      }
      await articlesStore.fetchArticles(1)
    } else {
      await articlesStore.fetchPublicArticles(1)
    }
  } catch (error) {
    toast.error('Error', {
      description: 'Failed to load articles. Please try again.',
    })
  }
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

// Redirect unauthorized users to public page
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated && route.path === '/articles') {
      navigateTo('/articles/public')
    }
  },
  { immediate: true },
)

// Fetch articles on mount
onMounted(async () => {
  try {
    if (!authStore.isAuthenticated) {
      navigateTo('/articles/public')
      return
    }
    // Start with my articles tab for authenticated users
    articlesStore.setActiveTab('my')
    await articlesStore.fetchArticles(1)
  } catch (error) {
    toast.error('Error', {
      description: 'Failed to load articles. Please try again.',
    })
  }
})
</script>

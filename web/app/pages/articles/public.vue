<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
          >
            <Icon name="lucide:globe" class="h-5 w-5 text-primary" />
          </div>
          <h1 class="text-3xl font-bold text-foreground tracking-tight">Public Articles</h1>
        </div>
        <p class="text-muted-foreground">
          Discover and read articles from our community
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          v-if="!authStore.isAuthenticated"
          variant="outline"
          class="gap-2"
          @click="navigateTo('/login')"
        >
          <Icon name="lucide:log-in" class="h-4 w-4" />
          Sign In
        </Button>
        <Button
          v-if="authStore.isAuthenticated"
          class="gap-2"
          @click="navigateTo('/articles')"
        >
          <Icon name="lucide:pen-square" class="h-4 w-4" />
          My Articles
        </Button>
      </div>
    </div>

    <!-- Articles List -->
    <ArticlesList :is-my-articles="false" />
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import ArticlesList from '~/components/articles/ArticlesList.vue'
import { useArticlesStore } from '~/stores/articles.store'
import { useAuthStore } from '~/stores/auth.store'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
})

const articlesStore = useArticlesStore()
const authStore = useAuthStore()

// Fetch public articles on mount
onMounted(async () => {
  try {
    articlesStore.setActiveTab('public')
    await articlesStore.fetchPublicArticles(1)
  } catch (error) {
    toast.error('Error', {
      description: 'Failed to load articles. Please try again.',
    })
  }
})
</script>


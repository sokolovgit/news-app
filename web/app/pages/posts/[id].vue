<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <PostCardSkeleton />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <Icon name="lucide:alert-circle" class="h-16 w-16 text-destructive mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-foreground mb-2">Post not found</h3>
      <p class="text-muted-foreground mb-6">{{ error }}</p>
      <Button @click="navigateTo('/feed')">
        <Icon name="lucide:arrow-left" class="h-4 w-4 mr-2" />
        Back to Feed
      </Button>
    </div>

    <!-- Post Content -->
    <div v-else-if="post" class="space-y-6">
      <!-- Back Button -->
      <Button variant="ghost" @click="navigateTo('/feed')">
        <Icon name="lucide:arrow-left" class="h-4 w-4 mr-2" />
        Back to Feed
      </Button>

      <!-- Post Card -->
      <PostCard :post="post" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import PostCard from '~/components/posts/PostCard.vue'
import PostCardSkeleton from '~/components/posts/PostCardSkeleton.vue'
import { useApi } from '~/composables/useApi'
import { FeedService } from '~/lib/api'
import type { FeedPost } from '~/types/posts.types'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const api = useApi()
const feedService = new FeedService(api)

const post = ref<FeedPost | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Fetch post by ID
const fetchPost = async () => {
  const postId = route.params.id as string

  if (!postId) {
    error.value = 'Invalid post ID'
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    error.value = null

    // Fetch single post by ID
    post.value = await feedService.getPostById(postId)
  } catch (err) {
    console.error('Failed to fetch post:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load post'
    toast.error('Error', {
      description: 'Failed to load post. Please try again.',
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchPost()
})

// Watch for route changes
watch(
  () => route.params.id,
  () => {
    fetchPost()
  },
)
</script>

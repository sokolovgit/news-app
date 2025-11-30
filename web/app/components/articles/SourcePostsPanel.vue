<template>
  <div
    v-if="selectedPosts.length > 0"
    class="source-posts-panel border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm"
  >
    <div
      class="flex items-center justify-between p-3 border-b border-border/50 cursor-pointer"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <Icon name="lucide:file-text" class="h-4 w-4 text-muted-foreground" />
        <span class="text-sm font-medium">Source Posts</span>
        <Badge variant="secondary" class="text-xs">
          {{ selectedPosts.length }}
        </Badge>
      </div>
      <Icon
        :name="isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
        class="h-4 w-4 text-muted-foreground"
      />
    </div>

    <div v-if="isExpanded" class="p-3 space-y-2 max-h-64 overflow-y-auto">
      <div
        v-for="post in selectedPosts"
        :key="post.id"
        class="flex items-start gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-foreground line-clamp-1">
            {{ post.title || 'Untitled' }}
          </p>
          <p class="text-xs text-muted-foreground line-clamp-2 mt-1">
            {{ extractText(post) }}
          </p>
          <p class="text-xs text-muted-foreground/70 mt-1">
            From: {{ post.source?.name || 'Unknown source' }}
          </p>
        </div>
        <div class="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            class="h-7 w-7 p-0"
            @click="$emit('copy', post)"
          >
            <Icon name="lucide:copy" class="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="h-7 w-7 p-0 text-destructive hover:text-destructive"
            @click="$emit('remove', post)"
          >
            <Icon name="lucide:x" class="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { FeedPost } from '~/types/posts.types'

defineProps<{
  selectedPosts: FeedPost[]
}>()

defineEmits<{
  copy: [post: FeedPost]
  remove: [post: FeedPost]
}>()

const isExpanded = ref(true)

const extractText = (post: FeedPost) => {
  if (!post.content) return ''
  const firstParagraph = post.content.find((block) => block.type === 'paragraph')
  if (firstParagraph?.type === 'paragraph') {
    return firstParagraph.data.text.replace(/<[^>]*>/g, '').substring(0, 150)
  }
  return ''
}
</script>


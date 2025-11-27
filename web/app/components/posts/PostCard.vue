<template>
  <Card class="hover:shadow-md transition-shadow">
    <CardHeader>
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <Badge variant="outline" class="text-xs">{{ sourceName }}</Badge>
            <span class="text-xs text-muted-foreground">{{ timeAgo }}</span>
          </div>
          <CardTitle v-if="post.title" class="text-lg mb-2 line-clamp-2">
            {{ post.title }}
          </CardTitle>
        </div>
        <Button
          v-if="!preview"
          variant="ghost"
          size="icon"
          class="shrink-0"
          @click="$emit('bookmark')"
        >
          <Icon name="lucide:bookmark" class="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <ClientOnly>
        <EditorJsRenderer v-if="post.content && post.content.length > 0" :content="post.content" />
        <template #fallback>
          <div class="text-sm text-muted-foreground">Loading content...</div>
        </template>
      </ClientOnly>
      <p v-if="!post.content || post.content.length === 0" class="text-sm text-muted-foreground">
        No content available
      </p>
    </CardContent>
    <CardFooter v-if="!preview" class="flex justify-between items-center">
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon name="lucide:calendar" class="h-3 w-3" />
        {{ formattedDate }}
      </div>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm" @click="showComplaintDialog = true">
          <Icon name="lucide:flag" class="h-4 w-4 mr-2" />
          Report
        </Button>
        <Button v-if="post.source?.url" variant="outline" size="sm" as-child>
          <a :href="post.source.url" target="_blank" rel="noopener noreferrer">
            <Icon name="lucide:external-link" class="h-4 w-4 mr-2" />
            View Source
          </a>
        </Button>
      </div>
    </CardFooter>

    <ComplaintDialog
      :open="showComplaintDialog"
      target-type="post"
      :target-id="post.id"
      @update:open="showComplaintDialog = $event"
      @submitted="$emit('complaint-submitted')"
    />
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import EditorJsRenderer from './EditorJsRenderer.vue'
import ComplaintDialog from '@/components/complaints/ComplaintDialog.vue'
import type { FeedPost } from '~/types/posts.types'

const props = defineProps<{
  post: FeedPost
  preview?: boolean
}>()

defineEmits<{
  bookmark: []
  'complaint-submitted': []
}>()

const showComplaintDialog = ref(false)

const sourceName = computed(() => {
  return props.post.source?.name || 'Unknown Source'
})

const timeAgo = computed(() => {
  if (!props.post.createdAt) return 'Unknown date'
  const date = new Date(props.post.createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
})

const formattedDate = computed(() => {
  if (!props.post.createdAt) return 'Unknown date'
  const date = new Date(props.post.createdAt)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})
</script>

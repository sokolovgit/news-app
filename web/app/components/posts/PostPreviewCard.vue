<template>
  <Card class="hover:shadow-md transition-all cursor-pointer group" @click="handleClick">
    <CardHeader>
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <Badge variant="outline" class="text-xs">{{ sourceName }}</Badge>
            <span class="text-xs text-muted-foreground">{{ timeAgo }}</span>
          </div>
          <CardTitle
            v-if="post.title"
            class="text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors"
          >
            {{ post.title }}
          </CardTitle>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <!-- Preview content - show first paragraph or image -->
      <div v-if="previewContent" class="space-y-2">
        <div v-if="previewText" class="text-sm text-muted-foreground line-clamp-3">
          {{ previewText }}
        </div>
        <div v-if="previewImage" class="rounded-lg overflow-hidden">
          <img
            :src="previewImage"
            :alt="post.title || 'Post preview'"
            class="w-full h-48 object-cover"
            loading="lazy"
          />
        </div>
      </div>
      <p v-else class="text-sm text-muted-foreground">No preview available</p>
    </CardContent>
    <CardFooter class="flex justify-between items-center text-xs text-muted-foreground">
      <div class="flex items-center gap-2">
        <Icon name="lucide:calendar" class="h-3 w-3" />
        {{ formattedDate }}
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          class="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          @click.stop="showComplaintDialog = true"
        >
          <Icon name="lucide:flag" class="h-3 w-3 mr-1" />
          Report
        </Button>
        <div
          class="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Read more
          <Icon name="lucide:arrow-right" class="h-3 w-3" />
        </div>
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
import ComplaintDialog from '@/components/complaints/ComplaintDialog.vue'
import type { FeedPost } from '~/types/posts.types'

const props = defineProps<{
  post: FeedPost
}>()

const emit = defineEmits<{
  click: [post: FeedPost]
  'complaint-submitted': []
}>()

const showComplaintDialog = ref(false)

// Use composable for media URL transformation
const { getMediaUrl } = useMediaUrl()

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

// Extract preview content
const previewContent = computed(() => {
  if (!props.post.content || props.post.content.length === 0) return null

  const firstParagraph = props.post.content.find((block) => block.type === 'paragraph')
  const firstImage = props.post.content.find((block) => block.type === 'image')

  return {
    text: firstParagraph?.type === 'paragraph' ? firstParagraph.data.text : null,
    image: firstImage?.type === 'image' ? firstImage.data.url : null,
  }
})

const previewText = computed(() => previewContent.value?.text || null)
const previewImage = computed(() => {
  const imageUrl = previewContent.value?.image
  return imageUrl ? getMediaUrl(imageUrl) : null
})

const handleClick = () => {
  emit('click', props.post)
  navigateTo(`/posts/${props.post.id}`)
}
</script>

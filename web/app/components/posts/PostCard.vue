<template>
  <Card class="hover:shadow-md transition-shadow">
    <CardHeader>
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <Badge variant="outline" class="text-xs">{{ post.sourceName }}</Badge>
            <span class="text-xs text-muted-foreground">{{ timeAgo }}</span>
          </div>
          <CardTitle class="text-lg mb-2 line-clamp-2">
            <a
              :href="post.url"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-primary-foreground transition-colors"
            >
              {{ post.title }}
            </a>
          </CardTitle>
          <CardDescription v-if="post.excerpt && !preview" class="line-clamp-3">
            {{ post.excerpt }}
          </CardDescription>
        </div>
        <Button
          v-if="!preview"
          variant="ghost"
          size="icon"
          class="flex-shrink-0"
          @click="$emit('bookmark')"
        >
          <Icon name="lucide:bookmark" class="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent v-if="post.excerpt && preview">
      <p class="text-sm text-muted-foreground line-clamp-2">{{ post.excerpt }}</p>
    </CardContent>
    <CardFooter v-if="!preview" class="flex justify-between items-center">
      <Button variant="outline" size="sm" as-child>
        <a :href="post.url" target="_blank" rel="noopener noreferrer">
          <Icon name="lucide:external-link" class="h-4 w-4 mr-2" />
          Read More
        </a>
      </Button>
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon name="lucide:calendar" class="h-3 w-3" />
        {{ formattedDate }}
      </div>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Post {
  id: string
  title: string
  excerpt?: string
  url: string
  sourceName: string
  publishedAt: Date | string
  read?: boolean
}

const props = defineProps<{
  post: Post
  preview?: boolean
}>()

defineEmits<{
  bookmark: []
}>()

const timeAgo = computed(() => {
  const date = new Date(props.post.publishedAt)
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
  const date = new Date(props.post.publishedAt)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})
</script>

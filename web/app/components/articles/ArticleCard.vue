<template>
  <Card
    class="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
    @click="handleClick"
  >
    <!-- Cover Image -->
    <div v-if="article.coverImageUrl" class="relative overflow-hidden">
      <img
        :src="getMediaUrl(article.coverImageUrl)"
        :alt="article.title"
        class="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      <!-- Status Badge on Image -->
      <Badge
        class="absolute top-3 right-3"
        :class="statusClass"
      >
        {{ statusLabel }}
      </Badge>
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Status Badge (when no cover image) -->
      <div v-if="!article.coverImageUrl" class="flex items-center gap-2 mb-3">
        <Badge :class="statusClass">{{ statusLabel }}</Badge>
        <span class="text-xs text-muted-foreground">{{ timeAgo }}</span>
      </div>

      <!-- Title -->
      <h3
        class="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-2"
        :class="article.coverImageUrl ? 'text-base' : 'text-lg'"
      >
        {{ article.title }}
      </h3>

      <!-- Description -->
      <p
        v-if="article.description"
        class="text-sm text-muted-foreground line-clamp-2 leading-relaxed"
      >
        {{ article.description }}
      </p>

      <!-- Footer -->
      <div class="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        <div class="flex items-center gap-3 text-xs text-muted-foreground">
          <div class="flex items-center gap-1.5">
            <Icon name="lucide:clock" class="h-3.5 w-3.5" />
            <span>{{ timeAgo }}</span>
          </div>
          <div v-if="article.viewCount > 0" class="flex items-center gap-1.5">
            <Icon name="lucide:eye" class="h-3.5 w-3.5" />
            <span>{{ article.viewCount }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Share Button (only for published articles) -->
          <Button
            v-if="article.status === 'published' && article.slug"
            variant="ghost"
            size="sm"
            class="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            @click.stop="handleShare"
            title="Share article"
          >
            <Icon name="lucide:share-2" class="h-3.5 w-3.5" />
          </Button>

          <!-- Edit Button -->
          <Button
            v-if="showActions"
            variant="ghost"
            size="sm"
            class="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            @click.stop="$emit('edit', article)"
          >
            <Icon name="lucide:pencil" class="h-3.5 w-3.5" />
          </Button>

          <!-- Delete Button -->
          <Button
            v-if="showActions"
            variant="ghost"
            size="sm"
            class="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            @click.stop="$emit('delete', article)"
          >
            <Icon name="lucide:trash-2" class="h-3.5 w-3.5" />
          </Button>

          <!-- Publish/Unpublish Button -->
          <Button
            v-if="showActions && article.status === 'draft'"
            variant="ghost"
            size="sm"
            class="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-700"
            @click.stop="$emit('publish', article)"
          >
            <Icon name="lucide:send" class="h-3.5 w-3.5" />
          </Button>
          <Button
            v-else-if="showActions && article.status === 'published'"
            variant="ghost"
            size="sm"
            class="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-orange-600 hover:text-orange-700"
            @click.stop="$emit('unpublish', article)"
          >
            <Icon name="lucide:archive" class="h-3.5 w-3.5" />
          </Button>

          <div class="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            {{ showActions ? 'Edit' : 'Read' }}
            <Icon name="lucide:arrow-right" class="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Article } from '~/types/articles.types'
import { ArticleStatus } from '~/types/articles.types'
import { useMediaUrl } from '~/composables/useMediaUrl'
import { useShare } from '~/composables/useShare'

const { getMediaUrl } = useMediaUrl()
const { shareArticle } = useShare()

interface Props {
  article: Article
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
})

const emit = defineEmits<{
  click: [article: Article]
  edit: [article: Article]
  delete: [article: Article]
  publish: [article: Article]
  unpublish: [article: Article]
  share: [article: Article]
}>()

const handleShare = async () => {
  await shareArticle(props.article)
  emit('share', props.article)
}

const statusLabel = computed(() => {
  switch (props.article.status) {
    case ArticleStatus.DRAFT:
      return 'Draft'
    case ArticleStatus.PUBLISHED:
      return 'Published'
    case ArticleStatus.ARCHIVED:
      return 'Archived'
    default:
      return props.article.status
  }
})

const statusClass = computed(() => {
  switch (props.article.status) {
    case ArticleStatus.DRAFT:
      return 'bg-yellow-500/90 hover:bg-yellow-500 text-white border-0'
    case ArticleStatus.PUBLISHED:
      return 'bg-green-500/90 hover:bg-green-500 text-white border-0'
    case ArticleStatus.ARCHIVED:
      return 'bg-gray-500/90 hover:bg-gray-500 text-white border-0'
    default:
      return ''
  }
})

const timeAgo = computed(() => {
  const date = props.article.status === ArticleStatus.PUBLISHED && props.article.publishedAt
    ? new Date(props.article.publishedAt)
    : props.article.createdAt
      ? new Date(props.article.createdAt)
      : null

  if (!date) return 'Unknown date'

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

const handleClick = () => {
  if (props.showActions) {
    navigateTo(`/articles/${props.article.id}/edit`)
  } else if (props.article.slug) {
    navigateTo(`/articles/read/${props.article.slug}`)
  }
}
</script>


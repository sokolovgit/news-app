<template>
  <Card
    class="group relative overflow-hidden border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
    :class="{ 'ring-2 ring-primary ring-offset-2 ring-offset-background': isSelected }"
    @click="handleClick"
  >
    <!-- Selection Checkbox -->
    <div
      v-if="selectable"
      class="absolute top-3 left-3 z-10"
      @click.stop="toggleSelection"
    >
      <Checkbox
        :checked="isSelected"
        class="h-5 w-5 border-2 border-white/80 bg-black/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
    </div>

    <!-- Media Preview Section -->
    <div v-if="mediaPreview" class="relative">
      <!-- Image Preview -->
      <div v-if="mediaPreview.type === 'image'" class="relative overflow-hidden">
        <img
          :src="mediaPreview.url"
          :alt="post.title || 'Post preview'"
          class="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          @error="handleImageError"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
        />
      </div>

      <!-- Video Preview with Play Overlay -->
      <div v-else-if="mediaPreview.type === 'video'" class="relative overflow-hidden bg-zinc-900">
        <video
          ref="videoRef"
          :src="mediaPreview.url"
          class="w-full h-52 object-cover"
          muted
          preload="metadata"
          @loadedmetadata="handleVideoLoaded"
          @error="handleVideoError"
        />
        <!-- Play Button Overlay -->
        <div
          class="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors"
        >
          <div
            class="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300"
          >
            <Icon name="lucide:play" class="h-7 w-7 text-zinc-900 ml-1" />
          </div>
        </div>
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"
        />
        <!-- Video Duration Badge -->
        <Badge
          v-if="videoDuration"
          class="absolute bottom-3 right-3 bg-black/70 text-white border-0 text-xs font-mono"
        >
          {{ videoDuration }}
        </Badge>
      </div>

      <!-- Audio Preview -->
      <div
        v-else-if="mediaPreview.type === 'audio'"
        class="relative h-32 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 flex items-center justify-center"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20"
          >
            <Icon name="lucide:music" class="h-6 w-6 text-white" />
          </div>
          <!-- Audio Waveform Decoration -->
          <div class="flex items-end gap-1 h-8">
            <div
              v-for="i in 12"
              :key="i"
              class="w-1 bg-white/40 rounded-full animate-pulse"
              :style="{
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
              }"
            />
          </div>
        </div>
      </div>

      <!-- Media Type Badge -->
      <Badge
        v-if="mediaPreview.type !== 'image'"
        class="absolute top-3 left-3 gap-1.5 text-xs font-medium"
        :class="{
          'bg-rose-500/90 hover:bg-rose-500 text-white border-0': mediaPreview.type === 'video',
          'bg-violet-500/90 hover:bg-violet-500 text-white border-0': mediaPreview.type === 'audio',
        }"
      >
        <Icon
          :name="mediaPreview.type === 'video' ? 'lucide:video' : 'lucide:headphones'"
          class="h-3 w-3"
        />
        {{ mediaPreview.type === 'video' ? 'Video' : 'Audio' }}
      </Badge>

      <!-- Source Badge on Media -->
      <div class="absolute top-3 right-3">
        <Badge class="bg-black/60 text-white border-0 backdrop-blur-sm text-xs">
          {{ sourceName }}
        </Badge>
      </div>
    </div>

    <!-- Content Section -->
    <div class="p-4">
      <!-- Header without media -->
      <div v-if="!mediaPreview" class="flex items-center gap-2 mb-3">
        <Badge variant="outline" class="text-xs">{{ sourceName }}</Badge>
        <span class="text-xs text-muted-foreground">{{ timeAgo }}</span>
      </div>

      <!-- Title -->
      <h3
        v-if="post.title"
        class="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-2"
        :class="mediaPreview ? 'text-base' : 'text-lg'"
      >
        {{ post.title }}
      </h3>

      <!-- Preview Text -->
      <p
        v-if="previewText"
        class="text-sm text-muted-foreground line-clamp-2 leading-relaxed"
        :class="{ 'line-clamp-3': !mediaPreview && !post.title }"
      >
        {{ cleanPreviewText }}
      </p>

      <!-- No Content Fallback -->
      <p
        v-if="!previewText && !post.title && !mediaPreview"
        class="text-sm text-muted-foreground italic"
      >
        No preview available
      </p>

      <!-- Footer -->
      <div class="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        <div class="flex items-center gap-3 text-xs text-muted-foreground">
          <div class="flex items-center gap-1.5">
            <Icon name="lucide:clock" class="h-3.5 w-3.5" />
            <span>{{ timeAgo }}</span>
          </div>
          <!-- Content Type Icons -->
          <div v-if="contentTypes.length > 0" class="flex items-center gap-1">
            <Icon
              v-for="type in contentTypes"
              :key="type"
              :name="getContentTypeIcon(type)"
              class="h-3.5 w-3.5 text-muted-foreground/70"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Button
            v-if="!selectable"
            variant="ghost"
            size="sm"
            class="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            title="Create article from this post"
            @click.stop="createArticle"
          >
            <Icon name="lucide:pen-square" class="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            @click.stop="showComplaintDialog = true"
          >
            <Icon name="lucide:flag" class="h-3.5 w-3.5" />
          </Button>
          <div
            class="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Read
            <Icon name="lucide:arrow-right" class="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>

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
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import ComplaintDialog from '@/components/complaints/ComplaintDialog.vue'
import type { FeedPost, ContentBlockType } from '~/types/posts.types'

const props = withDefaults(defineProps<{
  post: FeedPost
  selectable?: boolean
  isSelected?: boolean
}>(), {
  selectable: false,
  isSelected: false,
})

const emit = defineEmits<{
  click: [post: FeedPost]
  'complaint-submitted': []
  'toggle-select': [post: FeedPost]
}>()

const showComplaintDialog = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const videoDuration = ref<string | null>(null)
const imageError = ref(false)
const videoError = ref(false)

// Use composable for media URL transformation
const { getMediaUrl, getMediaType } = useMediaUrl()

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

// Get all content types present in the post
const contentTypes = computed(() => {
  if (!props.post.content) return []
  const types = new Set<string>()
  props.post.content.forEach((block) => {
    if (block.type === 'image' || block.type === 'video' || block.type === 'audio') {
      types.add(block.type)
    }
  })
  return Array.from(types)
})

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'image':
      return 'lucide:image'
    case 'video':
      return 'lucide:video'
    case 'audio':
      return 'lucide:headphones'
    default:
      return 'lucide:file'
  }
}

// Extract media preview (image, video, or audio)
const mediaPreview = computed(() => {
  if (!props.post.content || props.post.content.length === 0) return null

  // Priority: image > video > audio
  const firstImage = props.post.content.find((block) => block.type === 'image')
  if (firstImage && firstImage.type === 'image' && !imageError.value) {
    // Check if the "image" is actually a video file
    const detectedType = getMediaType(firstImage.data.url)
    if (detectedType === 'video') {
      return {
        type: 'video' as const,
        url: getMediaUrl(firstImage.data.url),
        caption: firstImage.data.caption,
      }
    }
    return {
      type: 'image' as const,
      url: getMediaUrl(firstImage.data.url),
      caption: firstImage.data.caption,
    }
  }

  const firstVideo = props.post.content.find((block) => block.type === 'video')
  if (firstVideo && firstVideo.type === 'video' && !videoError.value) {
    return {
      type: 'video' as const,
      url: getMediaUrl(firstVideo.data.url),
      caption: firstVideo.data.caption,
    }
  }

  const firstAudio = props.post.content.find((block) => block.type === 'audio')
  if (firstAudio && firstAudio.type === 'audio') {
    return {
      type: 'audio' as const,
      url: getMediaUrl(firstAudio.data.url),
      caption: firstAudio.data.caption,
    }
  }

  return null
})

// Extract preview text
const previewText = computed(() => {
  if (!props.post.content) return null
  const firstParagraph = props.post.content.find((block) => block.type === 'paragraph')
  return firstParagraph?.type === 'paragraph' ? firstParagraph.data.text : null
})

// Clean preview text (remove HTML tags)
const cleanPreviewText = computed(() => {
  if (!previewText.value) return null
  return previewText.value.replace(/<[^>]*>/g, '').trim()
})

// Format video duration
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleVideoLoaded = () => {
  if (videoRef.value && videoRef.value.duration) {
    videoDuration.value = formatDuration(videoRef.value.duration)
  }
}

const handleImageError = () => {
  imageError.value = true
}

const handleVideoError = () => {
  videoError.value = true
}

const toggleSelection = () => {
  emit('toggle-select', props.post)
}

const handleClick = () => {
  if (props.selectable) {
    toggleSelection()
  } else {
    emit('click', props.post)
    navigateTo(`/posts/${props.post.id}`)
  }
}

const createArticle = () => {
  navigateTo({
    path: '/articles/create',
    query: { sourcePostIds: props.post.id },
  })
}
</script>

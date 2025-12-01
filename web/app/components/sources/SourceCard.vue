<template>
  <Card class="hover:shadow-md transition-shadow">
    <CardHeader>
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3 flex-1 min-w-0">
          <div class="p-2 rounded-lg bg-primary/10 shrink-0">
            <Icon :name="sourceIcon" class="h-5 w-5 text-primary-foreground" />
          </div>
          <div class="flex-1 min-w-0">
            <CardTitle class="text-lg truncate">{{ source.name }}</CardTitle>
            <CardDescription class="truncate">{{ source.url }}</CardDescription>
          </div>
        </div>
        <Badge :variant="sourceBadgeVariant">{{ sourceTypeLabel }}</Badge>
      </div>
    </CardHeader>
    <CardContent v-if="!preview">
      <div class="space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Last fetched</span>
          <span class="text-foreground">{{ lastFetched }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Posts (24h)</span>
          <span class="text-foreground">{{ source.postCount || 0 }}</span>
        </div>
      </div>
    </CardContent>
    <CardFooter v-if="!preview" class="flex justify-between items-center">
      <Button v-if="showReportButton" variant="ghost" size="sm" @click="showComplaintDialog = true">
        <Icon name="lucide:flag" class="h-4 w-4 mr-2" />
        Report
      </Button>
      <div class="flex gap-2">
        <Button
          v-if="showFollowButton && !isSubscribed"
          variant="default"
          size="sm"
          :disabled="isFollowing"
          @click="$emit('follow')"
        >
          <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
          {{ isFollowing ? 'Following...' : 'Follow' }}
        </Button>
        <Button v-if="showActions" variant="ghost" size="sm" @click="$emit('refresh')">
          <Icon name="lucide:refresh-cw" class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button v-if="showActions" variant="ghost" size="sm" @click="$emit('view')"> View </Button>
      </div>
    </CardFooter>

    <ComplaintDialog
      :open="showComplaintDialog"
      target-type="source"
      :target-id="source.id"
      @update:open="showComplaintDialog = $event"
      @submitted="$emit('complaint-submitted')"
    />
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
import ComplaintDialog from '@/components/complaints/ComplaintDialog.vue'

interface Source {
  id: string
  name: string
  url: string
  source: string // 'rss' | 'instagram' | etc.
  postCount?: number
  lastFetchedAt?: Date | string
}

const props = defineProps<{
  source: Source
  preview?: boolean
  isSubscribed?: boolean
  showFollowButton?: boolean
  showActions?: boolean
  showReportButton?: boolean
  isFollowing?: boolean
}>()

defineEmits<{
  refresh: []
  view: []
  follow: []
  'complaint-submitted': []
}>()

const showComplaintDialog = ref(false)

const sourceIcon = computed(() => {
  const sourceType = props.source.source.toLowerCase()
  if (sourceType === 'instagram') return 'lucide:instagram'
  if (sourceType === 'telegram') return 'lucide:send'
  if (sourceType === 'rss') return 'lucide:rss'
  return 'lucide:link'
})

const sourceTypeLabel = computed(() => {
  return props.source.source.charAt(0).toUpperCase() + props.source.source.slice(1)
})

const sourceBadgeVariant = computed(() => {
  const sourceType = props.source.source.toLowerCase()
  if (sourceType === 'instagram') return 'secondary'
  if (sourceType === 'telegram') return 'outline'
  if (sourceType === 'rss') return 'default'
  return 'outline'
})

const lastFetched = computed(() => {
  if (!props.source.lastFetchedAt) return 'Never'
  const date = new Date(props.source.lastFetchedAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
})
</script>

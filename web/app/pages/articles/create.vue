<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-24">
    <!-- Header -->
    <div class="flex items-center justify-between sticky top-16 z-40 py-4 bg-background/80 backdrop-blur-sm border-b border-border/50 -mx-4 px-4">
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="sm" @click="navigateTo('/articles')">
          <Icon name="lucide:arrow-left" class="h-4 w-4 mr-2" />
          Back
        </Button>
        <div class="h-5 w-px bg-border" />
        <h1 class="text-lg font-semibold text-foreground">New Article</h1>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" :disabled="isSaving" @click="saveDraft">
          <Icon v-if="isSaving" name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
          <Icon v-else name="lucide:save" class="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button size="sm" :disabled="isSaving || !canPublish" @click="saveAndPublish">
          <Icon v-if="isSaving" name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
          <Icon v-else name="lucide:send" class="h-4 w-4 mr-2" />
          Publish
        </Button>
      </div>
    </div>

    <!-- Source Posts Panel (if coming from feed) -->
    <SourcePostsPanel
      v-if="sourcePosts.length > 0"
      :selected-posts="sourcePosts"
      @copy="copyPostContent"
      @remove="removeSourcePost"
    />

    <!-- Editor -->
    <ArticleEditor
      ref="editorRef"
      :initial-title="title"
      :initial-description="description"
      :initial-content="content"
      :initial-cover-image-url="coverImageUrl"
      @update="handleEditorUpdate"
    />

    <!-- Floating action bar -->
    <div class="fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 z-50">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="text-sm text-muted-foreground">
            <span v-if="wordCount > 0">{{ wordCount }} words</span>
            <span v-else>Start writing...</span>
          </div>
          <div v-if="sourcePosts.length > 0" class="text-sm text-muted-foreground">
            • {{ sourcePosts.length }} source{{ sourcePosts.length > 1 ? 's' : '' }}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground mr-2">
            {{ canPublish ? 'Ready to publish' : 'Add title & content to publish' }}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            :disabled="isSaving"
            @click="saveDraft"
          >
            Save Draft
          </Button>
          <Button 
            size="sm" 
            :disabled="isSaving || !canPublish"
            @click="saveAndPublish"
          >
            <Icon name="lucide:send" class="h-4 w-4 mr-1" />
            Publish
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import ArticleEditor from '~/components/articles/ArticleEditor.vue'
import SourcePostsPanel from '~/components/articles/SourcePostsPanel.vue'
import { useApi } from '~/composables/useApi'
import { ArticlesService, FeedService } from '~/lib/api'
import type { EditorJsContent } from '~/types/articles.types'
import type { FeedPost } from '~/types/posts.types'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const route = useRoute()
const api = useApi()
const articlesService = new ArticlesService(api)
const feedService = new FeedService(api)

const editorRef = ref<InstanceType<typeof ArticleEditor> | null>(null)

// Form state
const title = ref('')
const description = ref('')
const content = ref<EditorJsContent>({ blocks: [] })
const coverImageUrl = ref<string | undefined>()
const sourcePosts = ref<FeedPost[]>([])
const sourceRawPostIds = ref<string[]>([])

const isSaving = ref(false)

// Word count
const wordCount = computed(() => {
  let count = 0
  count += title.value.split(/\s+/).filter(Boolean).length
  count += description.value.split(/\s+/).filter(Boolean).length
  
  content.value.blocks.forEach((block) => {
    if (block.type === 'paragraph' && block.data.text) {
      count += block.data.text.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    } else if (block.type === 'header' && block.data.text) {
      count += block.data.text.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    } else if (block.type === 'list' && block.data.items) {
      const items = block.data.items as Array<string | { content?: string }>
      items.forEach((item) => {
        if (typeof item === 'string') {
          count += item.split(/\s+/).filter(Boolean).length
        } else if (typeof item === 'object' && item.content) {
          count += item.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
        }
      })
    }
  })
  
  return count
})

// Check if article can be published (has title and content)
const canPublish = computed(() => {
  return title.value.trim().length > 0 && content.value.blocks.length > 0
})

// Load source posts from query params
onMounted(async () => {
  const postIds = route.query.sourcePostIds
  if (postIds) {
    const ids = Array.isArray(postIds) ? postIds : [postIds]
    sourceRawPostIds.value = ids as string[]

    // Fetch the source posts
    try {
      const posts = await Promise.all(
        ids.map((id) => feedService.getPostById(id as string))
      )
      sourcePosts.value = posts
    } catch (error) {
      console.error('Failed to load source posts:', error)
      toast.error('Failed to load source posts')
    }
  }
})

const handleEditorUpdate = (data: {
  title: string
  description: string
  content: EditorJsContent
  coverImageUrl?: string
}) => {
  title.value = data.title
  description.value = data.description
  content.value = data.content
  coverImageUrl.value = data.coverImageUrl
}

const copyPostContent = (post: FeedPost) => {
  // Copy post content to clipboard or insert into editor
  const textContent = post.content
    ?.filter((block) => block.type === 'paragraph')
    .map((block) => block.type === 'paragraph' ? block.data.text : '')
    .join('\n\n')

  if (textContent) {
    navigator.clipboard.writeText(textContent)
    toast.success('Copied', {
      description: 'Post content copied to clipboard',
    })
  }
}

const removeSourcePost = (post: FeedPost) => {
  sourcePosts.value = sourcePosts.value.filter((p) => p.id !== post.id)
  sourceRawPostIds.value = sourceRawPostIds.value.filter((id) => id !== post.id)
}

const saveDraft = async () => {
  if (!title.value.trim()) {
    toast.error('Title required', {
      description: 'Please enter a title for your article.',
    })
    return
  }

  isSaving.value = true
  try {
    const editorContent = await editorRef.value?.getContent()

    const article = await articlesService.createArticle({
      title: title.value,
      description: description.value || undefined,
      content: editorContent || { blocks: [] },
      coverImageUrl: coverImageUrl.value,
      sourceRawPostIds: sourceRawPostIds.value.length > 0 ? sourceRawPostIds.value : undefined,
    })

    toast.success('Draft saved', {
      description: 'Your article has been saved as a draft.',
    })

    navigateTo(`/articles/${article.id}/edit`)
  } catch (error) {
    console.error('Failed to save article:', error)
    toast.error('Error', {
      description: 'Failed to save article. Please try again.',
    })
  } finally {
    isSaving.value = false
  }
}

const saveAndPublish = async () => {
  if (!canPublish.value) {
    toast.error('Cannot publish', {
      description: 'Please add a title and some content before publishing.',
    })
    return
  }

  isSaving.value = true
  try {
    const editorContent = await editorRef.value?.getContent()

    // Create the article
    const article = await articlesService.createArticle({
      title: title.value,
      description: description.value || undefined,
      content: editorContent || { blocks: [] },
      coverImageUrl: coverImageUrl.value,
      sourceRawPostIds: sourceRawPostIds.value.length > 0 ? sourceRawPostIds.value : undefined,
    })

    // Publish it
    await articlesService.publishArticle(article.id)

    toast.success('Published!', {
      description: 'Your article is now live.',
    })

    navigateTo('/articles')
  } catch (error) {
    console.error('Failed to publish article:', error)
    toast.error('Error', {
      description: 'Failed to publish article. Please try again.',
    })
  } finally {
    isSaving.value = false
  }
}
</script>

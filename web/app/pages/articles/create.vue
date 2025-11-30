<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="sm" @click="navigateTo('/articles')">
          <Icon name="lucide:arrow-left" class="h-4 w-4 mr-2" />
          Back
        </Button>
        <div class="h-6 w-px bg-border" />
        <h1 class="text-xl font-semibold text-foreground">New Article</h1>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" :disabled="isSaving" @click="saveDraft">
          <Icon v-if="isSaving" name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
          Save Draft
        </Button>
        <Button :disabled="isSaving || !canPublish" @click="saveAndPublish">
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


<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-6">
      <Skeleton class="h-8 w-48" />
      <Skeleton class="h-64 w-full" />
      <Skeleton class="h-12 w-full" />
      <Skeleton class="h-96 w-full" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <Icon name="lucide:alert-circle" class="h-16 w-16 text-destructive mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-foreground mb-2">Article not found</h3>
      <p class="text-muted-foreground mb-6">{{ error }}</p>
      <Button @click="navigateTo('/articles')">
        <Icon name="lucide:arrow-left" class="h-4 w-4 mr-2" />
        Back to Articles
      </Button>
    </div>

    <!-- Editor -->
    <template v-else-if="article">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Button variant="ghost" size="sm" @click="navigateTo('/articles')">
            <Icon name="lucide:arrow-left" class="h-4 w-4 mr-2" />
            Back
          </Button>
          <div class="h-6 w-px bg-border" />
          <h1 class="text-xl font-semibold text-foreground">Edit Article</h1>
          <Badge :class="statusClass">{{ statusLabel }}</Badge>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" :disabled="isSaving" @click="saveChanges">
            <Icon v-if="isSaving" name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
            Save
          </Button>
          <Button
            v-if="article.status === 'draft'"
            :disabled="isSaving || !canPublish"
            @click="publishArticle"
          >
            <Icon v-if="isSaving" name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
            <Icon v-else name="lucide:send" class="h-4 w-4 mr-2" />
            Publish
          </Button>
          <Button
            v-else-if="article.status === 'published'"
            variant="outline"
            :disabled="isSaving"
            @click="unpublishArticle"
          >
            <Icon name="lucide:archive" class="h-4 w-4 mr-2" />
            Unpublish
          </Button>
        </div>
      </div>

      <!-- Editor Component -->
      <ArticleEditor
        ref="editorRef"
        :initial-title="article.title"
        :initial-description="article.description || ''"
        :initial-content="article.content"
        :initial-cover-image-url="article.coverImageUrl"
        @update="handleEditorUpdate"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import ArticleEditor from '~/components/articles/ArticleEditor.vue'
import { useApi } from '~/composables/useApi'
import { ArticlesService } from '~/lib/api'
import type { Article, EditorJsContent } from '~/types/articles.types'
import { ArticleStatus } from '~/types/articles.types'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const api = useApi()
const articlesService = new ArticlesService(api)

const editorRef = ref<InstanceType<typeof ArticleEditor> | null>(null)

const article = ref<Article | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isSaving = ref(false)

// Local form state for tracking changes
const title = ref('')
const description = ref('')
const content = ref<EditorJsContent>({ blocks: [] })
const coverImageUrl = ref<string | undefined>()

const statusLabel = computed(() => {
  switch (article.value?.status) {
    case ArticleStatus.DRAFT:
      return 'Draft'
    case ArticleStatus.PUBLISHED:
      return 'Published'
    case ArticleStatus.ARCHIVED:
      return 'Archived'
    default:
      return ''
  }
})

const statusClass = computed(() => {
  switch (article.value?.status) {
    case ArticleStatus.DRAFT:
      return 'bg-yellow-500/90 text-white border-0'
    case ArticleStatus.PUBLISHED:
      return 'bg-green-500/90 text-white border-0'
    case ArticleStatus.ARCHIVED:
      return 'bg-gray-500/90 text-white border-0'
    default:
      return ''
  }
})

const canPublish = computed(() => {
  return title.value.trim().length > 0 && content.value.blocks.length > 0
})

// Fetch article on mount
onMounted(async () => {
  const params = route.params as { id: string }
  const articleId = params.id

  try {
    article.value = await articlesService.getMyArticleById(articleId)
    title.value = article.value.title
    description.value = article.value.description || ''
    content.value = article.value.content
    coverImageUrl.value = article.value.coverImageUrl
  } catch (err) {
    console.error('Failed to fetch article:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load article'
  } finally {
    isLoading.value = false
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

const saveChanges = async () => {
  if (!article.value) return

  isSaving.value = true
  try {
    const editorContent = await editorRef.value?.getContent()

    await articlesService.updateArticle(article.value.id, {
      title: title.value,
      description: description.value || undefined,
      content: editorContent,
      coverImageUrl: coverImageUrl.value,
    })

    toast.success('Saved', {
      description: 'Your changes have been saved.',
    })
  } catch (err) {
    console.error('Failed to save article:', err)
    toast.error('Error', {
      description: 'Failed to save changes. Please try again.',
    })
  } finally {
    isSaving.value = false
  }
}

const publishArticle = async () => {
  if (!article.value || !canPublish.value) return

  isSaving.value = true
  try {
    // Save changes first
    const editorContent = await editorRef.value?.getContent()

    await articlesService.updateArticle(article.value.id, {
      title: title.value,
      description: description.value || undefined,
      content: editorContent,
      coverImageUrl: coverImageUrl.value,
    })

    // Then publish
    const updatedArticle = await articlesService.publishArticle(article.value.id)
    article.value = updatedArticle

    toast.success('Published!', {
      description: 'Your article is now live.',
    })
  } catch (err) {
    console.error('Failed to publish article:', err)
    toast.error('Error', {
      description: 'Failed to publish article. Please try again.',
    })
  } finally {
    isSaving.value = false
  }
}

const unpublishArticle = async () => {
  if (!article.value) return

  isSaving.value = true
  try {
    const updatedArticle = await articlesService.unpublishArticle(article.value.id)
    article.value = updatedArticle

    toast.success('Unpublished', {
      description: 'Your article is now a draft.',
    })
  } catch (err) {
    console.error('Failed to unpublish article:', err)
    toast.error('Error', {
      description: 'Failed to unpublish article. Please try again.',
    })
  } finally {
    isSaving.value = false
  }
}
</script>


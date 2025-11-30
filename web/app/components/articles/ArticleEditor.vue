<template>
  <div class="article-editor relative space-y-6">
    <!-- Cover Image Section -->
    <section class="editor-section">
      <div class="section-header">
        <Icon name="lucide:image" class="h-4 w-4" />
        <span>Cover Image</span>
        <span class="text-xs text-muted-foreground/60 ml-auto">Optional</span>
      </div>
      <div
        class="relative w-full h-[240px] rounded-xl overflow-hidden group transition-all duration-300"
        :class="
          coverImageUrl
            ? 'ring-1 ring-border'
            : 'bg-muted/20 border-2 border-dashed border-border/50 hover:border-primary/40 hover:bg-muted/30'
        "
      >
        <img
          v-if="coverImageUrl"
          :src="getMediaUrl(coverImageUrl)"
          alt="Cover"
          class="w-full h-full object-cover"
        />

        <!-- Overlay for existing cover -->
        <div
          v-if="coverImageUrl"
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />

        <!-- Upload placeholder -->
        <div
          v-if="!coverImageUrl"
          class="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
          @click="triggerCoverUpload"
        >
          <div
            class="w-14 h-14 rounded-xl bg-muted/60 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors"
          >
            <Icon
              name="lucide:image-plus"
              class="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors"
            />
          </div>
          <p
            class="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors"
          >
            Click to add cover image
          </p>
          <p class="text-xs text-muted-foreground/60 mt-1">Recommended: 1600 × 840px</p>
        </div>

        <!-- Actions for existing cover -->
        <div
          v-if="coverImageUrl"
          class="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <Button
            variant="secondary"
            size="sm"
            class="bg-white/90 hover:bg-white shadow-lg text-xs h-8"
            @click="triggerCoverUpload"
          >
            <Icon name="lucide:replace" class="h-3.5 w-3.5 mr-1.5" />
            Replace
          </Button>
          <Button
            variant="secondary"
            size="sm"
            class="bg-white/90 hover:bg-white shadow-lg text-destructive hover:text-destructive h-8 px-2"
            @click="removeCoverImage"
          >
            <Icon name="lucide:trash-2" class="h-3.5 w-3.5" />
          </Button>
        </div>

        <!-- Upload loading indicator -->
        <div
          v-if="isUploadingCover"
          class="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
        >
          <div class="flex flex-col items-center gap-2">
            <Icon name="lucide:loader-2" class="h-6 w-6 text-primary animate-spin" />
            <p class="text-sm text-muted-foreground">Uploading...</p>
          </div>
        </div>

        <input
          ref="coverInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleCoverUpload"
        />
      </div>
    </section>

    <!-- Title Section -->
    <section class="editor-section">
      <div class="section-header">
        <Icon name="lucide:heading" class="h-4 w-4" />
        <span>Title</span>
        <span class="text-xs text-muted-foreground/60 ml-auto">Required</span>
      </div>
      <div class="section-content">
        <input
          v-model="title"
          type="text"
          placeholder="Enter article title..."
          class="w-full text-3xl md:text-4xl font-bold bg-transparent border-0 outline-none placeholder:text-muted-foreground/30 text-foreground tracking-tight focus:ring-0"
          @input="debouncedEmitUpdate"
        />
      </div>
    </section>

    <!-- Description Section -->
    <section class="editor-section">
      <div class="section-header">
        <Icon name="lucide:text" class="h-4 w-4" />
        <span>Description</span>
        <span class="text-xs text-muted-foreground/60 ml-auto">Brief summary</span>
      </div>
      <div class="section-content">
        <textarea
          v-model="description"
          placeholder="Add a brief description that appears in article previews..."
          class="w-full text-base text-muted-foreground bg-transparent border-0 outline-none resize-none placeholder:text-muted-foreground/30 leading-relaxed focus:ring-0"
          rows="2"
          @input="autoResizeTextarea"
        />
      </div>
    </section>

    <!-- Content Section -->
    <section class="editor-section editor-section--content">
      <div class="section-header">
        <Icon name="lucide:file-text" class="h-4 w-4" />
        <span>Content</span>
        <span class="text-xs text-muted-foreground/60 ml-auto">Press "/" for commands</span>
      </div>
      <div class="section-content section-content--editor">
        <div
          ref="editorContainer"
          class="article-content prose prose-lg dark:prose-invert max-w-none min-h-[350px]"
        />
      </div>
    </section>

    <!-- Autosave indicator -->
    <div
      v-if="lastSaved"
      class="fixed bottom-24 left-6 flex items-center gap-2 px-3 py-1.5 bg-card/90 backdrop-blur-sm border border-border/50 rounded-full text-xs text-muted-foreground shadow-lg"
    >
      <Icon name="lucide:check-circle" class="h-3.5 w-3.5 text-green-500" />
      <span>Saved {{ formatTimeAgo(lastSaved) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { EditorJsContent } from '~/types/articles.types'
import { useApi } from '~/composables/useApi'
import { useMediaUrl } from '~/composables/useMediaUrl'
import { MediaService } from '~/lib/api'
import { toast } from 'vue-sonner'

interface Props {
  initialTitle?: string
  initialDescription?: string
  initialContent?: EditorJsContent
  initialCoverImageUrl?: string
}

interface Emits {
  (
    e: 'update',
    data: {
      title: string
      description: string
      content: EditorJsContent
      coverImageUrl?: string
    },
  ): void
}

const props = withDefaults(defineProps<Props>(), {
  initialTitle: '',
  initialDescription: '',
  initialContent: () => ({ blocks: [] }),
  initialCoverImageUrl: undefined,
})

const emit = defineEmits<Emits>()

const api = useApi()
const mediaService = new MediaService(api)
const { getMediaUrl, isFullUrl } = useMediaUrl()
const config = useRuntimeConfig()
const apiBaseUrl = config.public.apiBaseUrl

/**
 * Extract S3 key from full media URL or return as-is if already an S3 key
 */
function toS3Path(url: string): string {
  if (!url) return url

  // Check for various API URL patterns
  const mediaPatterns = [`${apiBaseUrl}/media/`, '/api/media/']

  for (const pattern of mediaPatterns) {
    if (url.includes(pattern)) {
      return url.split(pattern).pop() || url
    }
  }

  return url
}

/**
 * Deep clone content to convert Vue Proxy objects to plain objects.
 * This is necessary because Editor.js uses structuredClone internally,
 * which cannot clone Proxy objects.
 */
function deepCloneContent(content: EditorJsContent): EditorJsContent {
  if (!content) return content
  return JSON.parse(JSON.stringify(content))
}

/**
 * Transform content image URLs to S3 paths for storage
 */
function transformContentForStorage(content: EditorJsContent): EditorJsContent {
  if (!content?.blocks) return content

  // Deep clone to convert Proxy objects to plain objects
  const cloned = deepCloneContent(content)

  return {
    ...cloned,
    blocks: cloned.blocks.map((block) => {
      if (block.type === 'image' && block.data?.file?.url) {
        return {
          ...block,
          data: {
            ...block.data,
            file: {
              ...block.data.file,
              url: toS3Path(block.data.file.url),
            },
          },
        }
      }
      return block
    }),
  }
}

/**
 * Transform content S3 paths to full URLs for Editor.js display.
 * Deep clones to convert Vue Proxy objects - Editor.js uses structuredClone which cannot clone Proxies.
 */
function transformContentForEditor(content: EditorJsContent): EditorJsContent {
  if (!content?.blocks) return content

  // Deep clone to convert Vue Proxy objects to plain objects
  const cloned = deepCloneContent(content)

  return {
    ...cloned,
    blocks: cloned.blocks.map((block) => {
      if (block.type === 'image' && block.data?.file?.url) {
        const url = block.data.file.url
        // Only transform if it's not already a full URL
        if (!isFullUrl(url)) {
          return {
            ...block,
            data: {
              ...block.data,
              file: {
                ...block.data.file,
                url: getMediaUrl(url),
              },
            },
          }
        }
      }
      return block
    }),
  }
}

// Refs
const editorContainer = ref<HTMLElement | null>(null)
const coverInput = ref<HTMLInputElement | null>(null)

// State
const title = ref(props.initialTitle)
const description = ref(props.initialDescription)
const coverImageUrl = ref(props.initialCoverImageUrl)
const isUploadingCover = ref(false)
const lastSaved = ref<Date | null>(null)

// Editor instance
let editor: any = null

// Debounced emit
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const debouncedEmitUpdate = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emitUpdate()
  }, 500)
}

const triggerCoverUpload = () => {
  coverInput.value?.click()
}

const handleCoverUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isUploadingCover.value = true
  try {
    const response = await mediaService.uploadImage(file, 'covers')
    // Store S3 key instead of full URL for consistency with raw posts
    coverImageUrl.value = response.key
    emitUpdate()
    toast.success('Cover image uploaded')
  } catch (error) {
    console.error('Failed to upload cover:', error)
    toast.error('Failed to upload image')
  } finally {
    isUploadingCover.value = false
    // Reset input
    if (target) target.value = ''
  }
}

const removeCoverImage = () => {
  coverImageUrl.value = undefined
  emitUpdate()
}

const autoResizeTextarea = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
  debouncedEmitUpdate()
}

const emitUpdate = async () => {
  let content: EditorJsContent = { blocks: [] }

  if (editor) {
    try {
      const rawContent = await editor.save()
      // Transform URLs to S3 paths for storage
      content = transformContentForStorage(rawContent)
    } catch (error) {
      console.error('Failed to save editor content:', error)
    }
  }

  lastSaved.value = new Date()

  emit('update', {
    title: title.value,
    description: description.value,
    content,
    coverImageUrl: coverImageUrl.value,
  })
}

// Get current content (for parent component)
const getContent = async (): Promise<EditorJsContent> => {
  if (editor) {
    try {
      const rawContent = await editor.save()
      // Transform URLs to S3 paths for storage
      return transformContentForStorage(rawContent)
    } catch (error) {
      console.error('Failed to save editor content:', error)
    }
  }
  return { blocks: [] }
}

// Format time ago
const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

// Expose methods for parent component
defineExpose({
  getContent,
  getTitle: () => title.value,
  getDescription: () => description.value,
  getCoverImageUrl: () => coverImageUrl.value,
})

onMounted(async () => {
  if (typeof window === 'undefined' || !editorContainer.value) return

  try {
    // Dynamically import Editor.js and plugins
    const [
      { default: EditorJS },
      { default: Header },
      { default: List },
      { default: ImageTool },
      { default: Quote },
      { default: Delimiter },
      { default: InlineCode },
      { default: Marker },
    ] = await Promise.all([
      import('@editorjs/editorjs'),
      import('@editorjs/header'),
      import('@editorjs/list'),
      import('@editorjs/image'),
      import('@editorjs/quote'),
      import('@editorjs/delimiter'),
      import('@editorjs/inline-code'),
      // @ts-expect-error - no types available
      import('@editorjs/marker'),
    ])

    // Transform S3 paths to full URLs for Editor.js display
    const editorContent = transformContentForEditor(props.initialContent)

    editor = new EditorJS({
      holder: editorContainer.value,
      data: editorContent,
      placeholder: 'Press "/" for commands or just start writing...',
      inlineToolbar: ['bold', 'italic', 'link', 'marker', 'inlineCode'],
      tools: {
        header: {
          class: Header as any,
          config: {
            levels: [1, 2, 3, 4],
            defaultLevel: 2,
          },
          shortcut: 'CMD+SHIFT+H',
        },
        list: {
          class: List as any,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered',
          },
        },
        image: {
          class: ImageTool as any,
          config: {
            uploader: {
              uploadByFile: async (file: File) => {
                try {
                  const response = await mediaService.uploadImage(file, 'articles')
                  // Return full URL for Editor.js display; will be converted to S3 path on save
                  return {
                    success: 1,
                    file: { url: getMediaUrl(response.key) },
                  }
                } catch (error) {
                  console.error('Image upload failed:', error)
                  toast.error('Failed to upload image')
                  return { success: 0 }
                }
              },
              uploadByUrl: async (url: string) => {
                try {
                  const response = await mediaService.uploadFromUrl(url, 'articles')
                  // Return full URL for Editor.js display; will be converted to S3 path on save
                  return {
                    success: 1,
                    file: { url: getMediaUrl(response.key) },
                  }
                } catch (error) {
                  console.error('Image upload from URL failed:', error)
                  toast.error('Failed to upload image from URL')
                  return { success: 0 }
                }
              },
            },
          },
        },
        quote: {
          class: Quote as any,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+O',
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Quote author',
          },
        },
        delimiter: Delimiter as any,
        inlineCode: InlineCode as any,
        marker: Marker as any,
      },
      onChange: () => {
        debouncedEmitUpdate()
      },
      onReady: () => {
        // Focus the editor
        const contentEditable = editorContainer.value?.querySelector(
          '[contenteditable]',
        ) as HTMLElement | null
        contentEditable?.focus()
      },
    })

    await editor.isReady
  } catch (error) {
    console.error('Failed to initialize Editor.js:', error)
    toast.error('Failed to load editor')
  }
})

onUnmounted(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})

// Watch for prop changes
watch(
  () => props.initialTitle,
  (newVal) => {
    if (newVal !== title.value) {
      title.value = newVal
    }
  },
)

watch(
  () => props.initialDescription,
  (newVal) => {
    if (newVal !== description.value) {
      description.value = newVal
    }
  },
)

watch(
  () => props.initialCoverImageUrl,
  (newVal) => {
    if (newVal !== coverImageUrl.value) {
      coverImageUrl.value = newVal
    }
  },
)

watch(
  () => props.initialContent,
  async (newVal) => {
    if (editor && newVal && newVal.blocks.length > 0) {
      try {
        // Transform S3 paths to full URLs for Editor.js display
        const editorContent = transformContentForEditor(newVal)
        await editor.render(editorContent)
      } catch (error) {
        console.error('Failed to render content:', error)
      }
    }
  },
  { deep: true },
)
</script>

<style scoped>
/* Section Styling */
.editor-section {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border) / 0.5);
  border-radius: 0.75rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: hsl(var(--muted) / 0.3);
  border-bottom: 1px solid hsl(var(--border) / 0.5);
  font-size: 0.8125rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.section-content {
  padding: 1rem 1.25rem;
}

.section-content--editor {
  padding: 1rem 0.5rem 1rem 1.25rem;
}

.editor-section--content {
  min-height: 400px;
}

/* Editor.js Core Styling */
.article-content :deep(.codex-editor) {
  padding: 0;
}

.article-content :deep(.codex-editor__redactor) {
  padding-bottom: 150px !important;
}

.article-content :deep(.ce-block__content) {
  max-width: 100%;
  margin: 0;
  padding-right: 3rem;
}

.article-content :deep(.ce-toolbar__content) {
  max-width: 100%;
}

/* Move toolbar buttons to the LEFT */
.article-content :deep(.ce-toolbar) {
  left: -2.5rem;
  right: auto;
}

.article-content :deep(.ce-toolbar__plus) {
  left: 0;
  right: auto;
}

.article-content :deep(.ce-toolbar__actions) {
  left: 0;
  right: auto;
  position: absolute;
  top: 100%;
  margin-top: 0.25rem;
}

/* Toolbox positioning (left side) */
.article-content :deep(.ce-toolbox) {
  left: 0;
  right: auto;
}

/* Block content styling */
.article-content :deep(.ce-paragraph) {
  line-height: 1.75;
  font-size: 1.0625rem;
}

.article-content :deep(.ce-header) {
  font-weight: 700;
  letter-spacing: -0.02em;
}

.article-content :deep(h1.ce-header) {
  font-size: 2rem;
  margin: 1.75rem 0 0.75rem;
}

.article-content :deep(h2.ce-header) {
  font-size: 1.5rem;
  margin: 1.5rem 0 0.625rem;
}

.article-content :deep(h3.ce-header) {
  font-size: 1.25rem;
  margin: 1.25rem 0 0.5rem;
}

.article-content :deep(.image-tool__image) {
  border-radius: 0.5rem;
  overflow: hidden;
}

.article-content :deep(.image-tool__caption) {
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
  margin-top: 0.5rem;
}

.article-content :deep(.cdx-quote) {
  border-left: 3px solid hsl(var(--primary));
  padding-left: 1rem;
  margin: 1.25rem 0;
  font-style: italic;
}

.article-content :deep(.cdx-quote__text) {
  font-size: 1.125rem;
  line-height: 1.7;
}

.article-content :deep(.cdx-quote__caption) {
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
  margin-top: 0.375rem;
}

.article-content :deep(.ce-delimiter) {
  line-height: 1.6em;
  text-align: center;
  font-size: 1.75rem;
  letter-spacing: 0.4em;
  color: hsl(var(--muted-foreground) / 0.6);
  padding: 1.25rem 0;
}

.article-content :deep(.cdx-list) {
  padding-left: 1.25rem;
}

.article-content :deep(.cdx-list__item) {
  padding: 0.2rem 0;
  line-height: 1.7;
}

.article-content :deep(.cdx-marker) {
  background: hsl(var(--primary) / 0.2);
  padding: 0.125rem 0;
}

.article-content :deep(.inline-code) {
  background: hsl(var(--muted));
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, monospace;
  font-size: 0.875em;
}

/* Toolbar button styling */
.article-content :deep(.ce-toolbar__plus),
.article-content :deep(.ce-toolbar__settings-btn) {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.375rem;
  transition: all 0.15s ease;
}

.article-content :deep(.ce-toolbar__plus:hover),
.article-content :deep(.ce-toolbar__settings-btn:hover) {
  color: hsl(var(--foreground));
  background: hsl(var(--muted));
  border-color: hsl(var(--border));
}

/* Toolbox and settings panel styling */
.article-content :deep(.ce-toolbox),
.article-content :deep(.ce-settings),
.article-content :deep(.ce-inline-toolbar),
.article-content :deep(.ce-conversion-toolbar) {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  box-shadow:
    0 4px 12px -2px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.article-content :deep(.ce-toolbox__button),
.article-content :deep(.ce-settings__button),
.article-content :deep(.ce-inline-tool) {
  color: hsl(var(--foreground));
  border-radius: 0.25rem;
}

.article-content :deep(.ce-toolbox__button:hover),
.article-content :deep(.ce-settings__button:hover),
.article-content :deep(.ce-inline-tool:hover) {
  background: hsl(var(--muted));
}

/* Dark mode adjustments */
:root.dark .article-content :deep(.ce-block--focused) {
  background: transparent;
}

:root.dark .editor-section {
  background: hsl(var(--card) / 0.5);
}

:root.dark .section-header {
  background: hsl(var(--muted) / 0.2);
}

:root.dark .article-content :deep(.ce-toolbox),
:root.dark .article-content :deep(.ce-settings),
:root.dark .article-content :deep(.ce-inline-toolbar),
:root.dark .article-content :deep(.ce-conversion-toolbar) {
  box-shadow:
    0 4px 12px -2px rgba(0, 0, 0, 0.3),
    0 2px 4px -1px rgba(0, 0, 0, 0.2);
}
</style>

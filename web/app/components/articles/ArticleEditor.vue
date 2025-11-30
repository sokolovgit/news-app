<template>
  <div class="article-editor relative">
    <!-- Cover Image Section -->
    <div
      class="relative w-full h-[280px] mb-8 rounded-2xl overflow-hidden group transition-all duration-300"
      :class="
        coverImageUrl
          ? 'bg-transparent'
          : 'bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-dashed border-border/40 hover:border-primary/40'
      "
    >
      <img
        v-if="coverImageUrl"
        :src="coverImageUrl"
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
          class="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors"
        >
          <Icon
            name="lucide:image-plus"
            class="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors"
          />
        </div>
        <p
          class="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors"
        >
          Add cover image
        </p>
        <p class="text-xs text-muted-foreground/70 mt-1">Recommended: 1600 × 840 pixels</p>
      </div>

      <!-- Actions for existing cover -->
      <div
        v-if="coverImageUrl"
        class="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <Button
          variant="secondary"
          size="sm"
          class="bg-white/90 hover:bg-white shadow-lg"
          @click="triggerCoverUpload"
        >
          <Icon name="lucide:replace" class="h-4 w-4 mr-1.5" />
          Replace
        </Button>
        <Button
          variant="secondary"
          size="sm"
          class="bg-white/90 hover:bg-white shadow-lg text-destructive hover:text-destructive"
          @click="removeCoverImage"
        >
          <Icon name="lucide:trash-2" class="h-4 w-4" />
        </Button>
      </div>

      <!-- Upload loading indicator -->
      <div
        v-if="isUploadingCover"
        class="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
      >
        <div class="flex flex-col items-center gap-3">
          <Icon name="lucide:loader-2" class="h-8 w-8 text-primary animate-spin" />
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

    <!-- Title -->
    <div class="mb-4">
      <input
        v-model="title"
        type="text"
        placeholder="Untitled"
        class="w-full text-4xl md:text-5xl font-bold bg-transparent border-0 outline-none placeholder:text-muted-foreground/40 text-foreground tracking-tight"
        @input="debouncedEmitUpdate"
      />
    </div>

    <!-- Description -->
    <div class="mb-8">
      <textarea
        v-model="description"
        placeholder="Add a brief description..."
        class="w-full text-lg text-muted-foreground bg-transparent border-0 outline-none resize-none placeholder:text-muted-foreground/40 leading-relaxed"
        rows="2"
        @input="autoResizeTextarea"
      />
    </div>

    <!-- Editor Container -->
    <div
      ref="editorContainer"
      class="article-content prose prose-lg dark:prose-invert max-w-none min-h-[400px]"
    />

    <!-- Autosave indicator -->
    <div
      v-if="lastSaved"
      class="fixed bottom-24 right-6 flex items-center gap-2 px-3 py-1.5 bg-card/90 backdrop-blur-sm border border-border/50 rounded-full text-xs text-muted-foreground shadow-lg"
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
    coverImageUrl.value = response.url
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
      content = await editor.save()
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
      return await editor.save()
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

    editor = new EditorJS({
      holder: editorContainer.value,
      data: props.initialContent,
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
                  return {
                    success: 1,
                    file: { url: response.url },
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
                  return {
                    success: 1,
                    file: { url: response.url },
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
        await editor.render(newVal)
      } catch (error) {
        console.error('Failed to render content:', error)
      }
    }
  },
  { deep: true },
)
</script>

<style scoped>
.article-content :deep(.codex-editor) {
  padding: 0;
}

.article-content :deep(.codex-editor__redactor) {
  padding-bottom: 200px !important;
}

.article-content :deep(.ce-block__content) {
  max-width: 100%;
  margin: 0;
}

.article-content :deep(.ce-toolbar__content) {
  max-width: 100%;
}

.article-content :deep(.ce-toolbar__plus) {
  left: -40px;
}

.article-content :deep(.ce-toolbar__actions) {
  right: -40px;
}

.article-content :deep(.ce-paragraph) {
  line-height: 1.8;
  font-size: 1.125rem;
}

.article-content :deep(.ce-header) {
  font-weight: 700;
  letter-spacing: -0.02em;
}

.article-content :deep(h1.ce-header) {
  font-size: 2.25rem;
  margin: 2rem 0 1rem;
}

.article-content :deep(h2.ce-header) {
  font-size: 1.75rem;
  margin: 1.75rem 0 0.75rem;
}

.article-content :deep(h3.ce-header) {
  font-size: 1.375rem;
  margin: 1.5rem 0 0.5rem;
}

.article-content :deep(.image-tool__image) {
  border-radius: 0.75rem;
  overflow: hidden;
}

.article-content :deep(.image-tool__caption) {
  font-size: 0.875rem;
  color: var(--color-muted-foreground);
  text-align: center;
  margin-top: 0.5rem;
}

.article-content :deep(.cdx-quote) {
  border-left: 4px solid hsl(var(--primary));
  padding-left: 1.25rem;
  margin: 1.5rem 0;
  font-style: italic;
}

.article-content :deep(.cdx-quote__text) {
  font-size: 1.25rem;
  line-height: 1.7;
}

.article-content :deep(.cdx-quote__caption) {
  font-size: 0.875rem;
  color: var(--color-muted-foreground);
  margin-top: 0.5rem;
}

.article-content :deep(.ce-delimiter) {
  line-height: 1.6em;
  text-align: center;
  font-size: 2rem;
  letter-spacing: 0.5em;
  color: var(--color-muted-foreground);
  padding: 1.5rem 0;
}

.article-content :deep(.cdx-list) {
  padding-left: 1.5rem;
}

.article-content :deep(.cdx-list__item) {
  padding: 0.25rem 0;
  line-height: 1.7;
}

.article-content :deep(.cdx-marker) {
  background: rgba(var(--primary-rgb), 0.2);
  padding: 0.125rem 0;
}

.article-content :deep(.inline-code) {
  background: hsl(var(--muted));
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, monospace;
  font-size: 0.9em;
}

/* Dark mode adjustments */
:root.dark .article-content :deep(.ce-block--focused) {
  background: transparent;
}

:root.dark .article-content :deep(.ce-toolbar__settings-btn),
:root.dark .article-content :deep(.ce-toolbar__plus) {
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
}

:root.dark .article-content :deep(.ce-toolbox),
:root.dark .article-content :deep(.ce-settings),
:root.dark .article-content :deep(.ce-inline-toolbar),
:root.dark .article-content :deep(.ce-conversion-toolbar) {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

:root.dark .article-content :deep(.ce-toolbox__button),
:root.dark .article-content :deep(.ce-settings__button),
:root.dark .article-content :deep(.ce-inline-tool) {
  color: hsl(var(--foreground));
}

:root.dark .article-content :deep(.ce-toolbox__button:hover),
:root.dark .article-content :deep(.ce-settings__button:hover),
:root.dark .article-content :deep(.ce-inline-tool:hover) {
  background: hsl(var(--muted));
}
</style>

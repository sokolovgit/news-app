<template>
  <div class="article-editor space-y-6">
    <!-- Cover Image Upload -->
    <div class="cover-image-section">
      <label class="block text-sm font-medium text-foreground mb-2">Cover Image</label>
      <div
        v-if="coverImageUrl"
        class="relative rounded-xl overflow-hidden bg-muted aspect-video max-h-64"
      >
        <img
          :src="coverImageUrl"
          alt="Cover"
          class="w-full h-full object-cover"
        />
        <Button
          variant="destructive"
          size="sm"
          class="absolute top-3 right-3"
          @click="removeCoverImage"
        >
          <Icon name="lucide:x" class="h-4 w-4" />
        </Button>
      </div>
      <div
        v-else
        class="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        @click="triggerCoverUpload"
      >
        <Icon name="lucide:image-plus" class="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p class="text-sm text-muted-foreground">Click to upload cover image</p>
        <p class="text-xs text-muted-foreground/70 mt-1">Recommended: 1200x630px</p>
      </div>
      <input
        ref="coverInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleCoverUpload"
      />
    </div>

    <!-- Title Input -->
    <div>
      <Input
        v-model="title"
        placeholder="Article title..."
        class="text-2xl font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
        @input="emitUpdate"
      />
    </div>

    <!-- Description Input -->
    <div>
      <textarea
        v-model="description"
        placeholder="Brief description of your article..."
        class="w-full resize-none border-0 border-b rounded-none px-0 py-2 focus:outline-none bg-transparent placeholder:text-muted-foreground/50 text-foreground"
        rows="2"
        @input="emitUpdate"
      />
    </div>

    <!-- Editor.js Container -->
    <div class="editor-wrapper">
      <div
        ref="editorContainer"
        class="prose prose-sm max-w-none dark:prose-invert min-h-[300px] border border-border/50 rounded-xl p-4 focus-within:border-primary/50 transition-colors"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { EditorJsContent } from '~/types/articles.types'

interface Props {
  initialTitle?: string
  initialDescription?: string
  initialContent?: EditorJsContent
  initialCoverImageUrl?: string
}

interface Emits {
  (e: 'update', data: {
    title: string
    description: string
    content: EditorJsContent
    coverImageUrl?: string
  }): void
}

const props = withDefaults(defineProps<Props>(), {
  initialTitle: '',
  initialDescription: '',
  initialContent: () => ({ blocks: [] }),
  initialCoverImageUrl: undefined,
})

const emit = defineEmits<Emits>()

const editorContainer = ref<HTMLElement | null>(null)
const coverInput = ref<HTMLInputElement | null>(null)

// Local state
const title = ref(props.initialTitle)
const description = ref(props.initialDescription)
const coverImageUrl = ref(props.initialCoverImageUrl)

// Editor instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let editor: any = null

const triggerCoverUpload = () => {
  coverInput.value?.click()
}

const handleCoverUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // TODO: Upload to S3 via media service
  // For now, create a local URL
  coverImageUrl.value = URL.createObjectURL(file)
  emitUpdate()
}

const removeCoverImage = () => {
  coverImageUrl.value = undefined
  emitUpdate()
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

  emit('update', {
    title: title.value,
    description: description.value,
    content,
    coverImageUrl: coverImageUrl.value,
  })
}

// Get current content
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
    ] = await Promise.all([
      import('@editorjs/editorjs'),
      import('@editorjs/header'),
      import('@editorjs/list'),
      import('@editorjs/image'),
    ])

    editor = new EditorJS({
      holder: editorContainer.value,
      data: props.initialContent,
      placeholder: 'Start writing your article...',
      tools: {
        header: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          class: Header as any,
          config: {
            levels: [1, 2, 3, 4],
            defaultLevel: 2,
          },
        },
        list: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          class: List as any,
          inlineToolbar: true,
        },
        image: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          class: ImageTool as any,
          config: {
            uploader: {
              uploadByFile: async (file: File) => {
                // TODO: Upload to S3 via media service
                const url = URL.createObjectURL(file)
                return {
                  success: 1,
                  file: { url },
                }
              },
              uploadByUrl: async (url: string) => {
                return {
                  success: 1,
                  file: { url },
                }
              },
            },
          },
        },
      },
      onChange: () => {
        emitUpdate()
      },
    })

    await editor.isReady
  } catch (error) {
    console.error('Failed to initialize Editor.js:', error)
  }
})

onUnmounted(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
})

// Watch for prop changes
watch(() => props.initialTitle, (newVal) => {
  if (newVal !== title.value) {
    title.value = newVal
  }
})

watch(() => props.initialDescription, (newVal) => {
  if (newVal !== description.value) {
    description.value = newVal
  }
})

watch(() => props.initialCoverImageUrl, (newVal) => {
  if (newVal !== coverImageUrl.value) {
    coverImageUrl.value = newVal
  }
})
</script>

<style scoped>
.editor-wrapper :deep(.codex-editor) {
  padding: 0;
}

.editor-wrapper :deep(.codex-editor__redactor) {
  padding-bottom: 100px !important;
}

.editor-wrapper :deep(.ce-block__content) {
  max-width: 100%;
  margin: 0;
}

.editor-wrapper :deep(.ce-toolbar__content) {
  max-width: 100%;
}

.editor-wrapper :deep(.ce-paragraph) {
  line-height: 1.7;
}

.editor-wrapper :deep(.ce-header) {
  font-weight: 600;
}

.editor-wrapper :deep(.image-tool__image) {
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>


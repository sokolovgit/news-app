<template>
  <div
    ref="editorContainer"
    class="editorjs-renderer prose prose-sm max-w-none dark:prose-invert"
  />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { Content } from '~/types/posts.types'

interface Props {
  content: Content
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: true,
})

const editorContainer = ref<HTMLElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let editor: any = null

// Use composable for media URL transformation
const { getMediaUrl, getMediaType } = useMediaUrl()

// Render media (images/videos) directly as HTML
// Inserts media at correct positions based on content order
function renderMediaDirectly(
  container: HTMLElement,
  content: Content,
  editorBlocks: NodeListOf<Element>,
) {
  // Create a map of media positions
  const mediaPositions = new Map<
    number,
    { url: string; caption?: string; type: 'image' | 'video' | 'audio' }
  >()

  content.forEach((block, index) => {
    if (
      (block.type === 'image' || block.type === 'video' || block.type === 'audio') &&
      block.data.url
    ) {
      mediaPositions.set(index, {
        url: block.data.url,
        caption: block.data.caption,
        type: block.type,
      })
    }
  })

  // Insert media at their correct positions
  mediaPositions.forEach((mediaData, position) => {
    // Find the block at this position (skip media when counting)
    let blockIndex = 0
    for (let i = 0; i < position; i++) {
      const block = content[i]
      if (block && block.type !== 'image' && block.type !== 'video' && block.type !== 'audio') {
        blockIndex++
      }
    }

    // Transform S3 path to full URL
    const mediaUrl = getMediaUrl(mediaData.url)
    const detectedType = getMediaType(mediaData.url)
    const effectiveType =
      mediaData.type === 'image' && detectedType === 'video' ? 'video' : mediaData.type

    const mediaWrapper = document.createElement('figure')
    mediaWrapper.className = 'editorjs-direct-media my-4'

    if (effectiveType === 'video') {
      // Render video element
      const video = document.createElement('video')
      video.src = mediaUrl
      video.className = 'max-w-full h-auto rounded-lg block mx-auto'
      video.controls = true
      video.preload = 'metadata'
      video.playsInline = true

      video.onerror = () => {
        console.error('Failed to load video:', mediaUrl)
        renderMediaError(mediaWrapper, video, mediaUrl, 'Video could not be loaded')
      }

      mediaWrapper.appendChild(video)
    } else if (effectiveType === 'audio') {
      // Render audio element
      const audio = document.createElement('audio')
      audio.src = mediaUrl
      audio.className = 'w-full'
      audio.controls = true
      audio.preload = 'metadata'

      audio.onerror = () => {
        console.error('Failed to load audio:', mediaUrl)
        renderMediaError(mediaWrapper, audio, mediaUrl, 'Audio could not be loaded')
      }

      mediaWrapper.appendChild(audio)
    } else {
      // Render image element
      const img = document.createElement('img')
      img.src = mediaUrl
      img.alt = mediaData.caption || ''
      img.className = 'max-w-full h-auto rounded-lg block mx-auto'
      img.loading = 'lazy'

      img.onerror = () => {
        console.error('Failed to load image:', mediaUrl)
        renderMediaError(mediaWrapper, img, mediaUrl, 'Image could not be loaded')
      }

      img.onload = () => {
        console.log('Image loaded successfully:', mediaUrl)
      }

      mediaWrapper.appendChild(img)
    }

    if (mediaData.caption) {
      const caption = document.createElement('figcaption')
      caption.className = 'text-sm text-muted-foreground text-center mt-2'
      caption.textContent = mediaData.caption
      mediaWrapper.appendChild(caption)
    }

    // Insert after the corresponding Editor.js block, or at the end if no blocks
    if (editorBlocks.length > 0 && blockIndex < editorBlocks.length) {
      const targetBlock = editorBlocks[blockIndex]
      if (targetBlock && targetBlock.nextSibling) {
        container.insertBefore(mediaWrapper, targetBlock.nextSibling)
      } else if (targetBlock) {
        container.appendChild(mediaWrapper)
      } else {
        container.appendChild(mediaWrapper)
      }
    } else {
      container.appendChild(mediaWrapper)
    }
  })
}

// Render error placeholder for failed media
function renderMediaError(
  wrapper: HTMLElement,
  element: HTMLElement,
  url: string,
  message: string,
) {
  element.style.display = 'none'
  const errorMsg = document.createElement('div')
  errorMsg.className = 'editorjs-media-error'
  errorMsg.innerHTML = `
    <div class="editorjs-media-error-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
        <circle cx="9" cy="9" r="2"></circle>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
      </svg>
    </div>
    <p class="editorjs-media-error-text">${message}</p>
    <a href="${url}" target="_blank" rel="noopener noreferrer" class="editorjs-media-error-link">
      Open in new tab
    </a>
  `
  wrapper.appendChild(errorMsg)
}

// Fallback renderer for when Editor.js fails
function renderFallback(container: HTMLElement, content: Content) {
  container.innerHTML = content
    .map((block) => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${block.data.text}</p>`
        case 'header':
          return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`
        case 'image': {
          const imageUrl = getMediaUrl(block.data.url)
          return `<figure class="editorjs-direct-media my-4"><img src="${imageUrl}" alt="${block.data.caption || ''}" class="max-w-full h-auto rounded-lg" />${block.data.caption ? `<figcaption class="text-sm text-muted-foreground text-center mt-2">${block.data.caption}</figcaption>` : ''}</figure>`
        }
        case 'video': {
          const videoUrl = getMediaUrl(block.data.url)
          return `<figure class="editorjs-direct-media my-4"><video src="${videoUrl}" controls class="max-w-full h-auto rounded-lg" preload="metadata" playsinline></video>${block.data.caption ? `<figcaption class="text-sm text-muted-foreground text-center mt-2">${block.data.caption}</figcaption>` : ''}</figure>`
        }
        case 'audio': {
          const audioUrl = getMediaUrl(block.data.url)
          return `<figure class="editorjs-direct-media my-4"><audio src="${audioUrl}" controls class="w-full" preload="metadata"></audio>${block.data.caption ? `<figcaption class="text-sm text-muted-foreground text-center mt-2">${block.data.caption}</figcaption>` : ''}</figure>`
        }
        default:
          return ''
      }
    })
    .join('')
}

// Convert backend content format to Editor.js format (excluding media)
function convertContentToEditorJs(content: Content) {
  // Filter out media - we'll render them separately
  const nonMediaBlocks = content.filter(
    (block) => block.type !== 'image' && block.type !== 'video' && block.type !== 'audio',
  )

  return {
    blocks: nonMediaBlocks.map((block) => {
      switch (block.type) {
        case 'paragraph':
          return {
            type: 'paragraph',
            data: {
              text: block.data.text,
            },
          }
        case 'header':
          return {
            type: 'header',
            data: {
              text: block.data.text,
              level: block.data.level,
            },
          }
        default:
          return {
            type: 'paragraph',
            data: {
              text: JSON.stringify(block),
            },
          }
      }
    }),
  }
}

onMounted(async () => {
  // Only load Editor.js on client side
  if (typeof window === 'undefined' || !editorContainer.value) return

  try {
    // Dynamically import Editor.js and plugins only on client side
    const [{ default: EditorJS }, { default: Header }, { default: List }] = await Promise.all([
      import('@editorjs/editorjs'),
      import('@editorjs/header'),
      import('@editorjs/list'),
    ])

    const editorJsData = convertContentToEditorJs(props.content)

    // Create a wrapper for Editor.js content
    const editorWrapper = document.createElement('div')
    editorContainer.value.appendChild(editorWrapper)

    editor = new EditorJS({
      holder: editorWrapper,
      readOnly: props.readOnly,
      data: editorJsData,
      tools: {
        header: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          class: Header as any,
          config: {
            levels: [1, 2, 3],
            defaultLevel: 2,
          },
        },
        list: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          class: List as any,
          inlineToolbar: true,
        },
      },
    })

    // Wait for editor to render
    await editor.isReady

    // Render media directly at correct positions
    const editorBlocks = editorWrapper.querySelectorAll('.ce-block')
    renderMediaDirectly(editorContainer.value, props.content, editorBlocks)
  } catch (error) {
    console.error('Failed to load Editor.js:', error)
    // Fallback: render content directly if Editor.js fails
    if (editorContainer.value && props.content.length > 0) {
      renderFallback(editorContainer.value, props.content)
    }
  }
})

watch(
  () => props.content,
  async (newContent) => {
    if (!editor || !editorContainer.value) return

    // Clear container
    editorContainer.value.innerHTML = ''

    // Re-render Editor.js content
    const editorWrapper = document.createElement('div')
    editorContainer.value.appendChild(editorWrapper)

    const editorJsData = convertContentToEditorJs(newContent)
    await editor.render(editorJsData)

    // Re-render media at correct positions
    const editorBlocks = editorWrapper.querySelectorAll('.ce-block')
    renderMediaDirectly(editorContainer.value, newContent, editorBlocks)
  },
  { deep: true },
)

onUnmounted(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
})
</script>

<style scoped>
/* Editor.js base styles */
.editorjs-renderer :deep(.codex-editor) {
  padding: 0;
}

.editorjs-renderer :deep(.codex-editor__redactor) {
  padding-bottom: 0 !important;
}

.editorjs-renderer :deep(.ce-block) {
  margin: 0.75rem 0;
}

.editorjs-renderer :deep(.ce-block__content) {
  max-width: 100%;
  margin: 0;
}

.editorjs-renderer :deep(.ce-toolbar__content),
.editorjs-renderer :deep(.ce-block__content) {
  max-width: 100%;
}

/* Paragraph styles */
.editorjs-renderer :deep(.ce-paragraph) {
  line-height: 1.6;
  margin: 0.5rem 0;
}

/* Direct media rendering */
.editorjs-renderer .editorjs-direct-media {
  margin: 1rem 0;
  display: block;
  width: 100%;
}

.editorjs-renderer .editorjs-direct-media img,
.editorjs-renderer .editorjs-direct-media video {
  max-width: 100%;
  width: 100%;
  height: auto;
  display: block;
  border-radius: 0.5rem;
  margin: 0 auto;
  object-fit: contain;
}

.editorjs-renderer .editorjs-direct-media audio {
  width: 100%;
  display: block;
}

.editorjs-renderer .editorjs-direct-media figcaption {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
  display: block;
  font-style: italic;
}

/* Media error placeholder styling */
.editorjs-renderer .editorjs-media-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  padding: 1.5rem;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  text-align: center;
  transition: all 0.2s ease;
}

.editorjs-renderer .editorjs-media-error:hover {
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-color: hsl(var(--border) / 0.8);
}

.editorjs-renderer .editorjs-media-error-icon {
  margin-bottom: 0.75rem;
  color: hsl(var(--muted-foreground));
  opacity: 0.5;
}

.editorjs-renderer .editorjs-media-error-icon svg {
  width: 40px;
  height: 40px;
}

.editorjs-renderer .editorjs-media-error-text {
  margin-bottom: 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--foreground));
  line-height: 1.5;
}

.editorjs-renderer .editorjs-media-error-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: hsl(var(--primary));
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  background: hsl(var(--primary) / 0.08);
  border: 1px solid hsl(var(--primary) / 0.2);
}

.editorjs-renderer .editorjs-media-error-link:hover {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  text-decoration: none;
}

.editorjs-renderer .editorjs-media-error-link::after {
  content: '↗';
  font-size: 0.75rem;
  margin-left: 0.125rem;
  opacity: 0.7;
}

/* Header styles */
.editorjs-renderer :deep(.ce-header) {
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  line-height: 1.3;
}

.editorjs-renderer :deep(.ce-header[data-level='1']) {
  font-size: 1.875rem;
}

.editorjs-renderer :deep(.ce-header[data-level='2']) {
  font-size: 1.5rem;
}

.editorjs-renderer :deep(.ce-header[data-level='3']) {
  font-size: 1.25rem;
}

/* List styles */
.editorjs-renderer :deep(.ce-list) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.editorjs-renderer :deep(.ce-list__item) {
  margin: 0.25rem 0;
  line-height: 1.6;
}

/* Hide toolbar in read-only mode */
.editorjs-renderer :deep(.ce-toolbar),
.editorjs-renderer :deep(.ce-inline-toolbar),
.editorjs-renderer :deep(.ce-conversion-toolbar),
.editorjs-renderer :deep(.ce-settings) {
  display: none !important;
}

/* Ensure proper text colors */
.editorjs-renderer :deep(.ce-paragraph),
.editorjs-renderer :deep(.ce-header) {
  color: hsl(var(--foreground));
}

/* Dark mode adjustments */
.dark .editorjs-renderer :deep(.ce-paragraph),
.dark .editorjs-renderer :deep(.ce-header) {
  color: hsl(var(--foreground));
}
</style>

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

// Render images directly as HTML (bypassing Editor.js Image tool)
// Inserts images at correct positions based on content order
function renderImagesDirectly(
  container: HTMLElement,
  content: Content,
  editorBlocks: NodeListOf<Element>,
) {
  // Create a map of image positions
  const imagePositions = new Map<number, { url: string; caption?: string }>()

  content.forEach((block, index) => {
    if (block.type === 'image' && block.data.url) {
      imagePositions.set(index, {
        url: block.data.url,
        caption: block.data.caption,
      })
    }
  })

  // Insert images at their correct positions
  imagePositions.forEach((imageData, position) => {
    // Find the block at this position (skip images when counting)
    let blockIndex = 0
    for (let i = 0; i < position; i++) {
      const block = content[i]
      if (block && block.type !== 'image') {
        blockIndex++
      }
    }

    const imageWrapper = document.createElement('figure')
    imageWrapper.className = 'editorjs-direct-image my-4'

    const img = document.createElement('img')
    // Don't set crossOrigin - Instagram CDN doesn't support CORS
    // Setting crossOrigin='anonymous' causes browser to block the image
    // Also don't set referrerPolicy initially - let browser use default
    img.src = imageData.url
    img.alt = imageData.caption || ''
    img.className = 'max-w-full h-auto rounded-lg block mx-auto'
    img.loading = 'lazy'

    // Handle image load errors
    img.onerror = () => {
      console.error('Failed to load image:', imageData.url)
      // Try retrying with no-referrer policy (sometimes helps with CDN restrictions)
      const retryImg = document.createElement('img')
      retryImg.referrerPolicy = 'no-referrer'
      retryImg.src = imageData.url
      retryImg.alt = imageData.caption || ''
      retryImg.className = 'max-w-full h-auto rounded-lg block mx-auto'
      retryImg.loading = 'lazy'

      retryImg.onload = () => {
        // Replace failed image with retry image
        imageWrapper.replaceChild(retryImg, img)
        console.log('Image loaded on retry:', imageData.url)
      }

      retryImg.onerror = () => {
        // Show error message with link to open image
        img.style.display = 'none'
        const errorMsg = document.createElement('div')
        errorMsg.className = 'editorjs-image-error'
        errorMsg.innerHTML = `
            <div class="editorjs-image-error-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
            </div>
            <p class="editorjs-image-error-text">Image could not be loaded</p>
            <a href="${imageData.url}" target="_blank" rel="noopener noreferrer" class="editorjs-image-error-link">
              Open image in new tab
            </a>
          `
        imageWrapper.appendChild(errorMsg)
      }
    }

    // Handle successful load
    img.onload = () => {
      console.log('Image loaded successfully:', imageData.url)
    }

    imageWrapper.appendChild(img)

    if (imageData.caption) {
      const caption = document.createElement('figcaption')
      caption.className = 'text-sm text-muted-foreground text-center mt-2'
      caption.textContent = imageData.caption
      imageWrapper.appendChild(caption)
    }

    // Insert after the corresponding Editor.js block, or at the end if no blocks
    if (editorBlocks.length > 0 && blockIndex < editorBlocks.length) {
      const targetBlock = editorBlocks[blockIndex]
      if (targetBlock && targetBlock.nextSibling) {
        container.insertBefore(imageWrapper, targetBlock.nextSibling)
      } else if (targetBlock) {
        container.appendChild(imageWrapper)
      } else {
        container.appendChild(imageWrapper)
      }
    } else {
      container.appendChild(imageWrapper)
    }
  })
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
        case 'image':
          return `<figure class="my-4"><img src="${block.data.url}" alt="${block.data.caption || ''}" class="max-w-full h-auto rounded-lg" /><figcaption class="text-sm text-muted-foreground text-center mt-2">${block.data.caption || ''}</figcaption></figure>`
        case 'audio':
        case 'video':
          return `<div class="my-4"><a href="${block.data.url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${block.data.caption || block.data.url}</a></div>`
        default:
          return ''
      }
    })
    .join('')
}

// Convert backend content format to Editor.js format (excluding images)
function convertContentToEditorJs(content: Content) {
  // Filter out images - we'll render them separately
  const nonImageBlocks = content.filter((block) => block.type !== 'image')

  return {
    blocks: nonImageBlocks.map((block) => {
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
        case 'audio':
          return {
            type: 'embed',
            data: {
              service: 'audio',
              source: block.data.url,
              embed: block.data.url,
              width: 600,
              height: 200,
              caption: block.data.caption || '',
            },
          }
        case 'video':
          return {
            type: 'embed',
            data: {
              service: 'video',
              source: block.data.url,
              embed: block.data.url,
              width: 600,
              height: 400,
              caption: block.data.caption || '',
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
    // Note: We don't import Image tool - we render images directly as HTML
    const [
      { default: EditorJS },
      { default: Header },
      { default: List },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Editor.js plugins don't have perfect TypeScript support
      { default: Embed },
    ] = await Promise.all([
      import('@editorjs/editorjs'),
      import('@editorjs/header'),
      import('@editorjs/list'),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Editor.js plugins don't have perfect TypeScript support
      import('@editorjs/embed'),
    ])

    const editorJsData = convertContentToEditorJs(props.content)
    console.log('Editor.js data:', editorJsData)

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
        embed: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          class: Embed as any,
          config: {
            services: {
              youtube: true,
              codepen: true,
              twitter: true,
              instagram: true,
            },
          },
        },
      },
    })

    // Wait for editor to render
    await editor.isReady
    console.log('Editor.js rendered successfully')

    // Render images directly at correct positions
    // Get all rendered Editor.js blocks
    const editorBlocks = editorWrapper.querySelectorAll('.ce-block')
    renderImagesDirectly(editorContainer.value, props.content, editorBlocks)
  } catch (error) {
    console.error('Failed to load Editor.js:', error)
    // Fallback: render images directly if Editor.js fails
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

    // Re-render images at correct positions
    const editorBlocks = editorWrapper.querySelectorAll('.ce-block')
    renderImagesDirectly(editorContainer.value, newContent, editorBlocks)
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

/* Direct image rendering (bypassing Editor.js Image tool) */
.editorjs-renderer .editorjs-direct-image {
  margin: 1rem 0;
  display: block;
  width: 100%;
}

.editorjs-renderer .editorjs-direct-image img {
  max-width: 100%;
  width: 100%;
  height: auto;
  display: block;
  border-radius: 0.5rem;
  margin: 0 auto;
  object-fit: contain;
}

.editorjs-renderer .editorjs-direct-image figcaption {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
  display: block;
  font-style: italic;
}

/* Image error placeholder styling */
.editorjs-renderer .editorjs-image-error {
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

.editorjs-renderer .editorjs-image-error:hover {
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-color: hsl(var(--border) / 0.8);
}

.editorjs-renderer .editorjs-image-error-icon {
  margin-bottom: 0.75rem;
  color: hsl(var(--muted-foreground));
  opacity: 0.5;
}

.editorjs-renderer .editorjs-image-error-icon svg {
  width: 40px;
  height: 40px;
}

.editorjs-renderer .editorjs-image-error-text {
  margin-bottom: 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--foreground));
  line-height: 1.5;
}

.editorjs-renderer .editorjs-image-error-link {
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

.editorjs-renderer .editorjs-image-error-link:hover {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  text-decoration: none;
}

.editorjs-renderer .editorjs-image-error-link::after {
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

/* Image styles */
.editorjs-renderer :deep(.image-tool) {
  margin: 1rem 0;
  display: block;
  width: 100%;
}

.editorjs-renderer :deep(.image-tool__image) {
  max-width: 100%;
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
  display: block;
  margin: 0 auto;
}

.editorjs-renderer :deep(.image-tool__image-picture) {
  max-width: 100%;
  width: 100%;
  height: auto;
  display: block;
}

.editorjs-renderer :deep(.image-tool__image img),
.editorjs-renderer :deep(.image-tool__image-picture img) {
  max-width: 100%;
  width: 100%;
  height: auto;
  display: block;
  border-radius: 0.5rem;
  object-fit: contain;
}

.editorjs-renderer :deep(.image-tool__caption) {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
  display: block;
}

/* Ensure image wrapper is visible */
.editorjs-renderer :deep(.cdx-block[data-type='image']) {
  display: block;
  width: 100%;
}

.editorjs-renderer :deep(.cdx-block[data-type='image'] .cdx-block__content) {
  display: block;
  width: 100%;
}

/* Embed styles */
.editorjs-renderer :deep(.embed-tool) {
  margin: 1rem 0;
}

.editorjs-renderer :deep(.embed-tool__content) {
  max-width: 100%;
}

.editorjs-renderer :deep(.embed-tool__caption) {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
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

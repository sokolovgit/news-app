<template>
  <div class="article-content-renderer prose prose-lg dark:prose-invert max-w-none">
    <template v-for="(block, index) in content.blocks" :key="block.id || index">
      <!-- Paragraph -->
      <p
        v-if="block.type === 'paragraph'"
        class="mb-4 leading-relaxed"
        v-html="sanitizeHtml((block.data as ParagraphBlockData).text)"
      />

      <!-- Header -->
      <component
        :is="`h${(block.data as HeaderBlockData).level}`"
        v-else-if="block.type === 'header'"
        class="font-bold tracking-tight"
        :class="getHeaderClass((block.data as HeaderBlockData).level)"
        v-html="sanitizeHtml((block.data as HeaderBlockData).text)"
      />

      <!-- Image -->
      <figure
        v-else-if="block.type === 'image'"
        class="my-8"
        :class="{
          'w-full': (block.data as ImageBlockData).stretched,
          'border rounded-lg p-2': (block.data as ImageBlockData).withBorder,
          'bg-muted/30 p-4 rounded-xl': (block.data as ImageBlockData).withBackground,
        }"
      >
        <img
          :src="(block.data as ImageBlockData).file?.url"
          :alt="(block.data as ImageBlockData).caption || 'Image'"
          class="rounded-lg w-full object-cover"
          loading="lazy"
        />
        <figcaption
          v-if="(block.data as ImageBlockData).caption"
          class="text-sm text-muted-foreground text-center mt-3"
          v-html="sanitizeHtml((block.data as ImageBlockData).caption || '')"
        />
      </figure>

      <!-- List -->
      <component
        :is="(block.data as ListBlockData).style === 'ordered' ? 'ol' : 'ul'"
        v-else-if="block.type === 'list'"
        class="my-4 pl-6"
        :class="(block.data as ListBlockData).style === 'ordered' ? 'list-decimal' : 'list-disc'"
      >
        <li
          v-for="(item, itemIndex) in (block.data as ListBlockData).items"
          :key="itemIndex"
          class="my-1"
        >
          <span v-html="sanitizeHtml(getListItemContent(item))" />
          <!-- Nested list support -->
          <component
            :is="(block.data as ListBlockData).style === 'ordered' ? 'ol' : 'ul'"
            v-if="typeof item === 'object' && item.items && item.items.length > 0"
            :class="
              (block.data as ListBlockData).style === 'ordered' ? 'list-decimal' : 'list-disc'
            "
            class="pl-4 mt-1"
          >
            <li v-for="(subItem, subIdx) in item.items" :key="subIdx" class="my-1">
              <span v-html="sanitizeHtml(getListItemContent(subItem))" />
            </li>
          </component>
        </li>
      </component>

      <!-- Quote -->
      <blockquote
        v-else-if="block.type === 'quote'"
        class="border-l-4 border-primary pl-6 my-6 italic"
        :class="(block.data as QuoteBlockData).alignment === 'center' ? 'text-center' : ''"
      >
        <p
          class="text-xl leading-relaxed"
          v-html="sanitizeHtml((block.data as QuoteBlockData).text)"
        />
        <cite
          v-if="(block.data as QuoteBlockData).caption"
          class="block text-sm text-muted-foreground mt-2 not-italic"
        >
          — {{ (block.data as QuoteBlockData).caption }}
        </cite>
      </blockquote>

      <!-- Code -->
      <pre
        v-else-if="block.type === 'code'"
        class="bg-muted/50 rounded-lg p-4 overflow-x-auto my-6"
      >
        <code class="text-sm font-mono">{{ (block.data as CodeBlockData).code }}</code>
      </pre>

      <!-- Delimiter -->
      <div v-else-if="block.type === 'delimiter'" class="flex items-center justify-center my-10">
        <span class="text-2xl text-muted-foreground tracking-[0.5em]">***</span>
      </div>

      <!-- Embed -->
      <div
        v-else-if="block.type === 'embed'"
        class="my-8 aspect-video rounded-lg overflow-hidden bg-muted"
      >
        <iframe
          :src="(block.data as EmbedBlockData).embed"
          :width="(block.data as EmbedBlockData).width || '100%'"
          :height="(block.data as EmbedBlockData).height || '100%'"
          class="w-full h-full"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
        <p
          v-if="(block.data as EmbedBlockData).caption"
          class="text-sm text-muted-foreground text-center mt-2"
        >
          {{ (block.data as EmbedBlockData).caption }}
        </p>
      </div>

      <!-- Warning -->
      <div
        v-else-if="block.type === 'warning'"
        class="flex gap-4 p-4 my-6 bg-amber-500/10 border border-amber-500/20 rounded-xl"
      >
        <Icon name="lucide:alert-triangle" class="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p class="font-semibold text-amber-700 dark:text-amber-400">
            {{ (block.data as WarningBlockData).title }}
          </p>
          <p class="text-sm mt-1 text-foreground/80">
            {{ (block.data as WarningBlockData).message }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type {
  EditorJsContent,
  ListItem,
  ParagraphBlockData,
  HeaderBlockData,
  ImageBlockData,
  ListBlockData,
  QuoteBlockData,
  CodeBlockData,
  EmbedBlockData,
  WarningBlockData,
} from '~/types/articles.types'
import DOMPurify from 'isomorphic-dompurify'

defineProps<{
  content: EditorJsContent
}>()

const sanitizeHtml = (html: string): string => {
  if (typeof window === 'undefined') return html
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'code', 'mark', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}

const getListItemContent = (item: string | ListItem): string => {
  if (typeof item === 'string') return item
  return item.content || ''
}

const getHeaderClass = (level: number): string => {
  const classes: Record<number, string> = {
    1: 'text-4xl mt-10 mb-4',
    2: 'text-3xl mt-8 mb-3',
    3: 'text-2xl mt-6 mb-2',
    4: 'text-xl mt-4 mb-2',
    5: 'text-lg mt-4 mb-1',
    6: 'text-base mt-3 mb-1',
  }
  return classes[level] ?? 'text-3xl mt-8 mb-3'
}
</script>

<style scoped>
.article-content-renderer :deep(a) {
  color: hsl(var(--primary));
  text-decoration: underline;
  text-underline-offset: 2px;
}

.article-content-renderer :deep(a:hover) {
  opacity: 0.8;
}

.article-content-renderer :deep(code) {
  background: hsl(var(--muted));
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.9em;
}

.article-content-renderer :deep(mark) {
  background: rgba(var(--primary-rgb), 0.2);
  padding: 0 0.125rem;
}

.article-content-renderer :deep(strong),
.article-content-renderer :deep(b) {
  font-weight: 600;
}

.article-content-renderer :deep(em),
.article-content-renderer :deep(i) {
  font-style: italic;
}
</style>

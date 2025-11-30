/**
 * Editor.js compatible content types
 * These are designed to be compatible with raw-posts ContentBlock types
 * while supporting the full Editor.js specification.
 */

// === Block Data Types ===

export interface ParagraphBlockData {
  text: string;
}

export interface HeaderBlockData {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ImageBlockData {
  file: {
    url: string;
  };
  caption?: string;
  withBorder?: boolean;
  withBackground?: boolean;
  stretched?: boolean;
}

export interface ListBlockData {
  style: 'ordered' | 'unordered';
  items: ListItem[];
  meta?: Record<string, unknown>;
}

export interface ListItem {
  content: string;
  meta?: Record<string, unknown>;
  items?: ListItem[];
}

export interface QuoteBlockData {
  text: string;
  caption?: string;
  alignment?: 'left' | 'center';
}

export interface CodeBlockData {
  code: string;
  language?: string;
}

export interface EmbedBlockData {
  service: string;
  source: string;
  embed: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface DelimiterBlockData {
  // No data for delimiter
}

export interface WarningBlockData {
  title: string;
  message: string;
}

// === Block Types ===

export type EditorJsBlockType =
  | 'paragraph'
  | 'header'
  | 'image'
  | 'list'
  | 'quote'
  | 'code'
  | 'embed'
  | 'delimiter'
  | 'warning';

export interface EditorJsBlock<
  T extends EditorJsBlockType = EditorJsBlockType,
  D = unknown,
> {
  id?: string;
  type: T;
  data: D;
}

export type ParagraphBlock = EditorJsBlock<'paragraph', ParagraphBlockData>;
export type HeaderBlock = EditorJsBlock<'header', HeaderBlockData>;
export type ImageBlock = EditorJsBlock<'image', ImageBlockData>;
export type ListBlock = EditorJsBlock<'list', ListBlockData>;
export type QuoteBlock = EditorJsBlock<'quote', QuoteBlockData>;
export type CodeBlock = EditorJsBlock<'code', CodeBlockData>;
export type EmbedBlock = EditorJsBlock<'embed', EmbedBlockData>;
export type DelimiterBlock = EditorJsBlock<'delimiter', DelimiterBlockData>;
export type WarningBlock = EditorJsBlock<'warning', WarningBlockData>;

export type ContentBlock =
  | ParagraphBlock
  | HeaderBlock
  | ImageBlock
  | ListBlock
  | QuoteBlock
  | CodeBlock
  | EmbedBlock
  | DelimiterBlock
  | WarningBlock;

// === Main Content Type ===

export interface EditorJsContent {
  time?: number;
  blocks: ContentBlock[];
  version?: string;
}

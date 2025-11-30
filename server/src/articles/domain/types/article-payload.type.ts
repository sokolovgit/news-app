import { EditorJsContent } from './editor-js-content.type';

export type CreateArticlePayload = {
  title: string;
  description?: string;
  content: EditorJsContent;
  coverImageUrl?: string;
  sourceRawPostIds?: string[];
};

export type UpdateArticlePayload = {
  title?: string;
  description?: string;
  content?: EditorJsContent;
  coverImageUrl?: string;
  sourceRawPostIds?: string[];
};

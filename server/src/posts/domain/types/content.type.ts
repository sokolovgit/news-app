import { ContentBlockType } from '../enums';

type ParagraphBlock = {
  type: ContentBlockType.PARAGRAPH;
  data: { text: string };
};

type HeaderBlock = {
  type: ContentBlockType.HEADER;
  data: { text: string; level: 1 | 2 | 3 };
};
type ImageBlock = {
  type: ContentBlockType.IMAGE;
  data: { url: string; caption?: string };
};

export type ContentBlock = ParagraphBlock | HeaderBlock | ImageBlock;

export type Content = ContentBlock[];

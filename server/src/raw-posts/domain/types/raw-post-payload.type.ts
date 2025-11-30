import { Content } from './content.type';

export type RawPostPayload = {
  externalId: string;
  title?: string;
  content: Content;
};

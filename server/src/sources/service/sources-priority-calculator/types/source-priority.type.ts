import { SourceId } from '@/sources/domain/schemas';
import { PublicSource } from '@/sources/domain/enums';

export type SourcePriority = {
  sourceId: SourceId;
  sourceType: PublicSource;
  url: string;
  activeFollowers: number;
  priority: number;
  repeatInterval: number;
};

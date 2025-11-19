import { SourceId } from '@/sources/domain/schemas';
import { Collector, PublicSource } from '@/sources/domain/enums';

export type SourcePriority = {
  sourceId: SourceId;
  sourceType: PublicSource;
  collector: Collector;
  url: string;
  activeFollowers: number;
  priority: number;
  repeatInterval: number;
};

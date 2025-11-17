import { Collector, PublicSource } from '@/sources/domain/enums';

export type SourcePriority = {
  sourceId: string;
  sourceType: PublicSource;
  collector: Collector;
  url: string;
  activeFollowers: number;
  priority: number;
  repeatInterval: number;
};

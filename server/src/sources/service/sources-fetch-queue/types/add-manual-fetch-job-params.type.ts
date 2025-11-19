import { SourceId } from '@/sources/domain/schemas';
import { PublicSource, Collector } from '@/sources/domain/enums';

export type AddManualFetchJobParams = {
  sourceId: SourceId;
  sourceType: PublicSource;
  collector: Collector;
  url: string;
  options?: {
    priority?: number;
    delay?: number;
    userId?: string;
  };
};

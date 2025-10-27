import { Source } from '@/sources/domain/entities';
import { Collector } from '@/sources/domain/enums';

export interface CollectorStrategy {
  collect(source: Source): Promise<void>;
  validate(url: string): Promise<boolean>;
  supports(collector: Collector): boolean;
  getCollectorType(): Collector;
}

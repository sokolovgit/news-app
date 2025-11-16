import { Source } from '@/sources/domain/entities';
import { Collector } from '@/sources/domain/enums';
import { ValidatedSourceUrl } from '@/sources/domain/types';

export interface CollectorStrategy {
  collect(source: Source): Promise<void>;
  validate(validatedSource: ValidatedSourceUrl): Promise<boolean>;
  supports(collector: Collector): boolean;
  getCollectorType(): Collector;
}

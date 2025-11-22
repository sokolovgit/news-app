import { Source } from '@/sources/domain/entities';
import { AvailableApi } from '@/sources/domain/enums';
import { CollectorResult } from '../../sources-collector-service/types';

export interface AvailableApiSourceCollectorStrategy {
  collect(source: Source): Promise<CollectorResult>;
  validate(url: string): Promise<boolean>;
  supports(api: AvailableApi): boolean;
  getApi(): AvailableApi;
}

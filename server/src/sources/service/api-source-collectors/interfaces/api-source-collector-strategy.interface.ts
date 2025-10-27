import { Source } from '@/sources/domain/entities';
import { AvailableApi } from '@/sources/domain/enums';

export interface AvailableApiSourceCollectorStrategy {
  collect(source: Source): Promise<void>;
  validate(url: string): Promise<boolean>;
  supports(api: AvailableApi): boolean;
  getApi(): AvailableApi;
}

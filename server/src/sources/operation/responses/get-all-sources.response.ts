import { PaginatedResult } from '@/commons/types';
import { Source } from '@/sources/domain/entities';

export interface SourceWithSubscriptionStatus {
  source: Source;
  isSubscribed: boolean;
}

export type GetAllSourcesResponse = PaginatedResult<SourceWithSubscriptionStatus>;


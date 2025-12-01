import { UserId } from '@/users/domain/schemas';
import { PaginationParams } from '@/commons/types';
import { PublicSource } from '@/sources/domain/enums';

export interface GetAllSourcesFilters {
  search?: string;
  sourceType?: PublicSource;
}

export class GetAllSourcesRequest {
  constructor(
    public readonly userId: UserId,
    public readonly pagination: PaginationParams,
    public readonly filters?: GetAllSourcesFilters,
  ) {}
}

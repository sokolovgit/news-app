import { UserId } from '@/users/domain/schemas';
import { PaginationParams } from '@/commons/types';

export class GetUserSourcesRequest {
  constructor(
    public readonly userId: UserId,
    public readonly pagination: PaginationParams,
  ) {}
}

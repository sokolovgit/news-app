import { UserId } from '@/users/domain/schemas';
import { PaginationParams } from '@/commons/types';

export class GetAllSourcesRequest {
  constructor(
    public readonly userId: UserId,
    public readonly pagination: PaginationParams,
  ) {}
}

import { PaginationQueryDto } from '@/commons/types';
import { GetUserSourcesRequest } from '@/sources/operation/requests';
import { User } from '@/users/domain/entities';

export class GetUserSourcesQueryDto extends PaginationQueryDto {
  toRequest(user: User): GetUserSourcesRequest {
    const pagination = this.toPaginationParams();

    return new GetUserSourcesRequest(user.getId(), pagination);
  }
}

import { PaginationQueryDto } from '@/commons/types';
import { GetAllSourcesRequest } from '@/sources/operation/requests';
import { User } from '@/users/domain/entities';

export class GetAllSourcesQueryDto extends PaginationQueryDto {
  toRequest(user: User): GetAllSourcesRequest {
    const pagination = this.toPaginationParams();

    return new GetAllSourcesRequest(user.getId(), pagination);
  }
}

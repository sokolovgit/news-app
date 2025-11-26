import {
  UserSource,
  UserSourceLoadOptions,
} from '@/user-sources/domain/entities';
import { SourceId } from '@/sources/domain/schemas';
import { UserId } from '@/users/domain/schemas';
import { PaginatedResult, PaginationParams } from '@/commons/types';

export abstract class UserSourcesRepository {
  abstract findByUserAndSource(
    userId: UserId,
    sourceId: SourceId,
    loadOptions?: UserSourceLoadOptions,
  ): Promise<UserSource | null>;

  abstract save(userSource: UserSource): Promise<UserSource | null>;

  abstract findAllSourceIdsByUser(userId: UserId): Promise<SourceId[]>;

  abstract findAllByUser(
    userId: UserId,
    loadOptions?: UserSourceLoadOptions,
  ): Promise<UserSource[]>;

  abstract findAllByUserPaginated(
    userId: UserId,
    params: PaginationParams,
    loadOptions?: UserSourceLoadOptions,
  ): Promise<PaginatedResult<UserSource>>;
}

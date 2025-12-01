import {
  UserSource,
  UserSourceLoadOptions,
} from '@/user-sources/domain/entities';
import { SourceId } from '@/sources/domain/schemas';
import { UserId } from '@/users/domain/schemas';
import { PaginatedResult, PaginationParams } from '@/commons/types';
import { PublicSource } from '@/sources/domain/enums';

export interface UserSourcesFilterParams {
  search?: string;
  sourceType?: PublicSource;
}

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

  abstract findAllByUserPaginatedFiltered(
    userId: UserId,
    params: PaginationParams,
    loadOptions?: UserSourceLoadOptions,
    filters?: UserSourcesFilterParams,
  ): Promise<PaginatedResult<UserSource>>;

  abstract getDistinctSourceTypesByUser(userId: UserId): Promise<PublicSource[]>;
}

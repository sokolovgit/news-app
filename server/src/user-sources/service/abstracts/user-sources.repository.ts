import {
  UserSource,
  UserSourceLoadOptions,
} from '@/user-sources/domain/entities';
import { SourceId } from '@/sources/domain/schemas';
import { UserId } from '@/users/domain/schemas';

export abstract class UserSourcesRepository {
  abstract findByUserAndSource(
    userId: UserId,
    sourceId: SourceId,
    loadOptions?: UserSourceLoadOptions,
  ): Promise<UserSource | null>;

  abstract save(userSource: UserSource): Promise<UserSource | null>;

  abstract findAllSourceIdsByUser(userId: UserId): Promise<SourceId[]>;
}

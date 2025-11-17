import { UserId } from '@/users/domain/schemas';
import { SourceId } from '@/sources/domain/schemas';
import { UserSource, UserSourceLoadOptions } from '@/sources/domain/entities';

export abstract class UserSourcesRepository {
  abstract findByUserAndSource(
    userId: UserId,
    sourceId: SourceId,
    loadOptions?: UserSourceLoadOptions,
  ): Promise<UserSource | null>;

  abstract save(userSource: UserSource): Promise<UserSource | null>;

  abstract findAllSourceIdsByUser(userId: UserId): Promise<SourceId[]>;
}

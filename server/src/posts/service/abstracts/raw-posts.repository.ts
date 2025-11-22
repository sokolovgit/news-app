import { SourceId } from '@/sources/domain/schemas';
import { RawPostId } from '@/posts/domain/schemas';
import { RawPost, RawPostLoadOptions } from '@/posts/domain/entities';

export abstract class RawPostsRepository {
  abstract getRawPostById(
    id: RawPostId,
    relations?: RawPostLoadOptions,
  ): Promise<RawPost | null>;

  abstract save(rawPost: RawPost): Promise<RawPost | null>;

  abstract saveMany(rawPosts: RawPost[]): Promise<RawPost[]>;

  abstract existsByExternalIds(
    sourceId: SourceId,
    externalIds: string[],
  ): Promise<Set<string>>;
}

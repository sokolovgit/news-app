import { uuid } from '@/commons/utils';
import { LoadState } from '@/commons/types';

import { RawPost } from '../entities';
import { RawPostId } from '../schemas';
import { RawPostPayload } from '../types';

import { Source } from '@/sources/domain/entities';
import { SourceId } from '@/sources/domain/schemas';

export class RawPostFactory {
  static fromPayload(payload: RawPostPayload, sourceId: SourceId): RawPost {
    return new RawPost(
      {
        id: uuid<RawPostId>(),
        sourceId,
        externalId: payload.externalId,
        title: payload.title,
        content: payload.content,
      },
      {
        source: LoadState.notLoaded<Source>(),
      },
    );
  }
}
